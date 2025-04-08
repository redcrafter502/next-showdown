import { db } from "@/server/db";
import { nominationRequestsTable } from "@/server/db/schema";
import { eq, and } from "drizzle-orm";
import { redirect } from "next/navigation";
import { auth, signIn } from "@/server/auth";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CloseNominationRequestButton, UrlCopyButton } from "./client";
import { env } from "@/env";
import { revalidatePath } from "next/cache";

export default async function OpenStatePage({
  params,
}: {
  params: Promise<{ urlId: string }>;
}) {
  const { urlId } = await params;
  const session = await auth();

  if (!session?.user) {
    await signIn();
    return;
  }

  const nominationRequest = await db
    .select()
    .from(nominationRequestsTable)
    .where(
      and(
        eq(nominationRequestsTable.urlId, urlId),
        eq(nominationRequestsTable.traktUserId, session.user.id),
      ),
    );

  if (!(nominationRequest[0]?.state === "open"))
    return redirect(`/dashboard/closed/${urlId}`);

  const url = new URL(
    `nominate/${nominationRequest[0].urlId}`,
    env.NEXT_PUBLIC_CLIENT_URL,
  ).href;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <Card>
        <CardHeader>
          <CardTitle>{nominationRequest[0].name}</CardTitle>
          <CardDescription>
            {nominationRequest[0].createdAt.toLocaleDateString()}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p>
            This is an open nomination request. Please share the link below to
            allow people to nominate seasons.
          </p>
          <div className="flex w-full gap-4">
            <Input disabled value={url} />
            <UrlCopyButton url={url} />
          </div>
        </CardContent>
        <CardFooter>
          <form
            action={async () => {
              "use server";
              await closeNominationRequest(urlId);
            }}
            className="w-full"
          >
            <CloseNominationRequestButton />
          </form>
        </CardFooter>
      </Card>
    </div>
  );
}

async function closeNominationRequest(urlId: string) {
  const session = await auth();

  if (!session?.user) {
    await signIn();
    return;
  }

  await db
    .update(nominationRequestsTable)
    .set({
      state: "closed",
    })
    .where(
      and(
        eq(nominationRequestsTable.urlId, urlId),
        eq(nominationRequestsTable.traktUserId, session.user.id),
      ),
    );
  revalidatePath("/");
}
