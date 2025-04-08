import { auth, signIn } from "@/server/auth";
import { db } from "@/server/db";
import { eq, and } from "drizzle-orm/expressions";
import {
  nominationRequestsTable,
  nominationsTable,
  seasonsTable,
} from "@/server/db/schema";
import { redirect } from "next/navigation";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";

export default async function ClosedStatePage({
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
    )
    .innerJoin(
      nominationsTable,
      eq(nominationRequestsTable.id, nominationsTable.nominationRequestId),
    )
    .innerJoin(
      seasonsTable,
      eq(nominationsTable.nominatedSeasonId, seasonsTable.id),
    );

  if (!nominationRequest[0]) return redirect("/dashboard");
  if (!(nominationRequest[0].nominationRequests.state === "closed"))
    return redirect(`/dashboard/open/${urlId}`);

  const nominations = nominationRequest.flatMap((nominationRequest) => {
    const count = nominationRequest.nominations.count;
    if (count === 0) return [];

    const returnNominations = [];

    for (let i = 0; i < count; i++) {
      returnNominations.push(nominationRequest);
    }

    return returnNominations;
  });

  return (
    <div>
      This Nomination Request is closed: UrlId: {urlId} It has the name:{" "}
      {nominationRequest[0].nominationRequests.name}
      <div className="flex flex-wrap gap-4">
        {nominations.map((n, index) => (
          <Nomination key={index} nominations={n} index={index} />
        ))}
      </div>
    </div>
  );
}

function Nomination({
  nominations: { nominationRequests, seasons, nominations },
  index,
}: {
  nominations: {
    nominationRequests: typeof nominationRequestsTable.$inferSelect;
    seasons: typeof seasonsTable.$inferSelect;
    nominations: typeof nominationsTable.$inferSelect;
  };
  index: number;
}) {
  if (nominations.state === "open")
    return (
      <Card>
        <CardHeader>
          <div className="flex flex-row items-center gap-4">
            <Button variant="secondary">
              <X color="red" />
            </Button>
            <span className="text-xl">{index + 1}</span>
            <Button variant="secondary">
              <Check color="green" />
            </Button>
          </div>
        </CardHeader>
      </Card>
    );
  if (nominations.state === "nominated") return <Card>Nominated</Card>;
  if (nominations.state === "revoked") return <Card>Revoked</Card>;
}
