import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { auth, signIn, signOut } from "@/server/auth";
import SignOutButton from "./signOutButton";
//import { env } from "@/env";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Suspense } from "react";
import { db } from "@/server/db";
import { nominationRequestsTable } from "@/server/db/schema";
import { desc, eq } from "drizzle-orm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    await signIn();
    return;
  }

  return (
    <>
      <UserInfo session={session} />
      <h1>This is the Dashbaord</h1>
      <Button asChild>
        <Link href="/dashboard/new">New Nomination Request</Link>
      </Button>
      <Suspense fallback={<div>Loading...</div>}>
        <MyNominationRequests userId={session.user.id} />
      </Suspense>
      {/*<DisplayList listName="Test" accessToken={session.accessToken} />*/}
      {/*<DisplayLists accessToken={session.accessToken} />*/}
    </>
  );
}

async function MyNominationRequests({ userId }: { userId: string }) {
  // TODO: Add pagination

  const nominationRequests = await db
    .select()
    .from(nominationRequestsTable)
    .where(eq(nominationRequestsTable.traktUserId, userId))
    .orderBy(desc(nominationRequestsTable.updatedAt));

  console.log(nominationRequests);

  return (
    <div className="flex flex-wrap gap-4">
      {nominationRequests.map((nominationRequest) => (
        <Link
          href={
            nominationRequest.state === "open"
              ? `/dashboard/open/${nominationRequest.urlId}`
              : `/dashboard/closed/${nominationRequest.urlId}`
          }
          key={nominationRequest.id}
        >
          <Card>
            <CardHeader>
              <CardTitle>
                {nominationRequest.name || "<no name provided>"}
              </CardTitle>
              <CardDescription>
                {nominationRequest.listName}{" "}
                <Badge
                  variant={
                    nominationRequest.state === "open"
                      ? "destructive"
                      : "default"
                  }
                >
                  {nominationRequest.state}
                </Badge>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>CreatedAt: {nominationRequest.createdAt.toString()}</p>
              <p>UpdatedAt: {nominationRequest.updatedAt.toString()}</p>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}

type AuthSession = {
  user: {
    name?: string | null;
    image?: string | null;
    id: string;
  };
  accessToken?: string;
  expires: string;
};

function UserInfo({ session }: { session: AuthSession }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Avatar>
          <AvatarImage src={session.user.image ?? ""} />
          <AvatarFallback>{(session.user.name ?? "U")[0]}</AvatarFallback>
        </Avatar>
      </PopoverTrigger>
      <PopoverContent>
        <div className="flex flex-col gap-3">
          <div>
            <p>My Account</p>
            <p>{session.user.name ?? "<your account has no name>"}</p>
          </div>
          <div>
            <p>Account ID</p>
            <p>{session.user.id}</p>
          </div>
          <div>
            <p>Session Expires</p>
            <p>{session.expires}</p>
          </div>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}
          >
            <SignOutButton />
          </form>
        </div>
      </PopoverContent>
    </Popover>
  );
}

/*async function DisplayList({
  listName,
  accessToken,
}: {
  listName: string;
  accessToken?: string;
}) {
  if (!accessToken) {
    return <div>There was an error getting the access Token!</div>;
  }

  const ho = await fetch(
    `https://api.trakt.tv/users/me/lists/${listName}/items/season`,
    {
      method: "GET",
      headers: {
        "trakt-api-version": "2",
        "trakt-api-key": env.AUTH_TRAKT_ID,
        Authorization: accessToken,
      },
    },
  ).catch((err) => {
    console.log("Fetch error", err);
  });

  console.log(ho);
  const data: unknown = await ho?.json();
  console.log(data);

  return (
    <div>
      List ({listName}):
      {JSON.stringify(data)}
    </div>
  );
}*/

/*async function DisplayLists({ accessToken }: { accessToken?: string }) {
  if (!accessToken) {
    return <div>There was an error getting the Access Token!</div>;
  }

  const ho = await fetch(`https://api.trakt.tv/users/me/lists/`, {
    method: "GET",
    headers: {
      "trakt-api-version": "2",
      "trakt-api-key": env.AUTH_TRAKT_ID,
      Authorization: accessToken,
    },
  }).catch((err) => {
    console.log("Fetch error", err);
  });

  console.log(ho);
  const data: unknown = await ho?.json();
  console.log(data);

  return (
    <div>
      Your lists:
      {JSON.stringify(data)}
    </div>
  );
  }*/
