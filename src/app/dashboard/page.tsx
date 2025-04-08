import { auth, signIn } from "@/server/auth";
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
import LoadingSpinner from "@/components/loadingSpinner";

export default function DashboardPage() {
  return (
    <div className="mt-4 flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Your nomination requests</h1>
      <Suspense fallback={<LoadingSpinner />}>
        <MyNominationRequests />
      </Suspense>
    </div>
  );
}

async function MyNominationRequests() {
  const session = await auth();
  if (!session?.user) return signIn();

  const userId = session.user.id;

  // TODO: Add pagination

  const nominationRequests = await db
    .select()
    .from(nominationRequestsTable)
    .where(eq(nominationRequestsTable.traktUserId, userId))
    .orderBy(desc(nominationRequestsTable.updatedAt));

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
