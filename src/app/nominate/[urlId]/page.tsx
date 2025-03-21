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
import { Button } from "@/components/ui/button";
import { DiamondMinus, DiamondPlus } from "lucide-react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { env } from "@/env";
import jwt from "jsonwebtoken";

export default async function NomitatePage({
  params,
}: {
  params: Promise<{ urlId: string }>;
}) {
  const { urlId } = await params;
  const cookieStore = await cookies();
  const userCookie = cookieStore.get("user");
  if (!userCookie) return redirect(`/nominate/${urlId}/cookie`);

  let decoded;
  try {
    decoded = jwt.verify(userCookie?.value ?? "", env.JWT_SECRET) as {
      id: string;
    };
  } catch {}

  if (typeof decoded?.id !== "string")
    return redirect(`/nominate/${urlId}/cookie`);

  const seasons = await db
    .select({
      nominationRequest: {
        nominatableSeasonCount: nominationRequestsTable.nominatableSeasonCount,
        state: nominationRequestsTable.state,
        id: nominationRequestsTable.id,
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

  const nominatableSeasonCount =
    seasons[0].nominationRequest.nominatableSeasonCount;

  const defaultNominations = seasons.map((season) => ({
    id: season.season.id,
    count: 0,
  }));

  return (
    <UserProvider>
      <div className="flex flex-col gap-4">
        <p>Nominate for Request with ID: {urlId}</p>
        <UserNameDisplay />
        <p>{nominatableSeasonCount}</p>
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
                <CardContent className="flex items-center gap-4">
                  {/*<NominationButton
                      id={season.id}
                      nominatableSeasonCount={nominatableSeasonCount}
                    />*/}
                  <Button
                    variant="default"
                    //disabled={nomination.count === 0}
                    //onClick={async () => await decrementNomination(id)}
                  >
                    <DiamondMinus />
                  </Button>
                  {0}
                  <Button
                    variant="default"
                    //disabled={nominatedSeasons >= nominatableSeasonCount}
                    //onClick={async () => await incrementNomination(id)}
                  >
                    <DiamondPlus />
                  </Button>
                </CardContent>
              </Card>
            ))}
        </div>
      </div>
    </UserProvider>
  );
}
