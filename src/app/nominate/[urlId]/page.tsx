import { db } from "@/server/db";
import UserProvider from "./user-provider";
import UserNameDisplay from "./userNameDisplay";
import {
  nominationRequestsTable,
  nominationsTable,
  nominationState,
  seasonsTable,
} from "@/server/db/schema";
import { and, eq } from "drizzle-orm/expressions";
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
import { changeCountOfNomination } from "./server";
import { revalidatePath } from "next/cache";

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
      nomination: {
        id: nominationsTable.id,
        count: nominationsTable.count,
        nominatedSeasonId: nominationsTable.nominatedSeasonId,
      },
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
      and(
        eq(nominationRequestsTable.urlId, urlId),
        eq(seasonsTable.nominationRequestId, nominationRequestsTable.id),
      ),
    )
    .leftJoin(
      nominationsTable,
      and(
        eq(nominationRequestsTable.id, nominationsTable.nominationRequestId),
        eq(seasonsTable.id, nominationsTable.nominatedSeasonId),
        eq(nominationsTable.userId, decoded.id),
      ),
    );
  //.where(eq(nominationRequestsTable.urlId, urlId));

  console.log(seasons);

  if (seasons.length === 0 || !seasons[0]) {
    return <p>No seasons found</p>;
  }

  if (seasons[0].nominationRequest.state === "closed") {
    return <p>This nomination request is already closed</p>;
  }

  const nominatableSeasonCount =
    seasons[0].nominationRequest.nominatableSeasonCount;

  const nominatedSeasonsCount = seasons
    .filter((season) => season.nomination?.nominatedSeasonId)
    .reduce((acc, season) => acc + (season.nomination?.count ?? 0), 0);

  return (
    <UserProvider>
      <div className="flex flex-col gap-4">
        <p>Nominate for Request with ID: {urlId}</p>
        <UserNameDisplay />
        <p>{nominatableSeasonCount}</p>
        <div className="flex flex-wrap gap-4">
          {seasons.map((season) => {
            const nominationCount = season.nomination?.count ?? 0;

            return (
              <Card key={season.season.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2.5">
                    {season.season.title}
                  </CardTitle>
                  <CardDescription>
                    {season.season.year} | Season {season.season.seasonNumber}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex items-center gap-4">
                  <Button
                    variant="default"
                    disabled={nominationCount === 0}
                    onClick={async () => {
                      "use server";
                      console.log("in server component");
                      await changeCountOfNominationLocal(
                        season.season.id,
                        Math.max(nominationCount - 1, 0),
                        season.nominationRequest.id,
                      );
                      revalidatePath(`/nominate/${urlId}`);
                    }}
                  >
                    <DiamondMinus />
                  </Button>
                  {nominationCount}
                  <Button
                    variant="default"
                    disabled={nominatedSeasonsCount >= nominatableSeasonCount}
                    onClick={async () => {
                      "use server";
                      console.log("in server component");
                      await changeCountOfNominationLocal(
                        season.season.id,
                        Math.max(nominationCount + 1, nominatableSeasonCount),
                        season.nominationRequest.id,
                      );
                      revalidatePath(`/nominate/${urlId}`);
                    }}
                  >
                    <DiamondPlus />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </UserProvider>
  );
}

async function changeCountOfNominationLocal(
  seasonId: number,
  count: number,
  nominationRequestId: number,
) {
  console.log("HI", seasonId, count, nominationRequestId);

  const cookieStore = await cookies();
  const userCookie = cookieStore.get("user");

  let decoded;
  try {
    decoded = jwt.verify(userCookie?.value ?? "", env.JWT_SECRET) as {
      id: string;
    };
  } catch {}
  if (typeof decoded?.id !== "string") return;

  const nomination = await createOrGetNomination(
    decoded.id,
    seasonId,
    nominationRequestId,
  );
  if (!nomination) return;

  await db
    .update(nominationsTable)
    .set({
      count: count,
    })
    .where(eq(nominationsTable.id, nomination.id))
    .execute();
}

async function createOrGetNomination(
  userId: string,
  seasonId: number,
  nominationRequestId: number,
) {
  const nomination = (
    await db
      .select()
      .from(nominationsTable)
      .where(
        and(
          eq(nominationsTable.id, userId),
          eq(nominationsTable.nominatedSeasonId, seasonId),
        ),
      )
      .limit(1)
  )[0];

  if (nomination) return nomination;

  const createdNomination = await db
    .insert(nominationsTable)
    .values({
      id: userId,
      nominationRequestId: nominationRequestId,
      count: 0,
      userId,
      state: "open",
      nominatedSeasonId: seasonId,
    })
    .returning();

  return createdNomination[0];
}
