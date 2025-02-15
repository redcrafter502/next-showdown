import { db } from "@/server/db";
import UserProvider from "./user-provider";
import UserNameDisplay from "./userNameDisplay";
import { nominationRequestsTable, seasonsTable } from "@/server/db/schema";
import { eq } from "drizzle-orm/expressions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function NomitatePage({
  params,
}: {
  params: Promise<{ urlId: string }>;
}) {
  const { urlId } = await params;

  const seasons = await db
    .select({
      nominationRequest: {
        nominatableSeasonCount: nominationRequestsTable.nominatableSeasonCount,
        state: nominationRequestsTable.state,
      },
      season: {
        id: seasonsTable.id,
        traktSeasonId: seasonsTable.traktSeasonId,
        title: seasonsTable.title,
        year: seasonsTable.year,
        seasonNumber: seasonsTable.seasonNumber,
      },
    })
    .from(seasonsTable)
    .innerJoin(
      nominationRequestsTable,
      eq(seasonsTable.nominationRequestId, nominationRequestsTable.id),
    )
    .where(eq(nominationRequestsTable.urlId, urlId));

  if (seasons.length === 0 || !seasons[0]) {
    return <p>No seasons found</p>;
  }

  if (seasons[0].nominationRequest.state === "closed") {
    return <p>This nomination request is already closed</p>;
  }

  return (
    <UserProvider>
      <div className="flex flex-col gap-4">
        <p>Nominate for Request with ID: {urlId}</p>
        <UserNameDisplay />
        <p>{seasons[0].nominationRequest.nominatableSeasonCount}</p>
        <div className="flex flex-wrap gap-4">
          {seasons
            .map((s) => s.season)
            .map((season) => (
              <Card key={season.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2.5">
                    {season.title}
                  </CardTitle>
                  <CardDescription>
                    {season.year} | Season {season.seasonNumber}
                  </CardDescription>
                </CardHeader>
                <CardContent>Nominate this season</CardContent>
              </Card>
            ))}
        </div>
      </div>
    </UserProvider>
  );
}
