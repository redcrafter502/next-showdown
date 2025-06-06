import { db } from "@/server/db";
import {
  nominationRequestsTable,
  nominationsTable,
  seasonsTable,
  usersTable,
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
import { revalidatePath } from "next/cache";
import { USER_COOKIE_NAME } from "@/lib/constants";

export default async function NomitatePage({
  params,
}: {
  params: Promise<{ urlId: string }>;
}) {
  const { urlId } = await params;
  const cookieStore = await cookies();
  const userCookie = cookieStore.get(USER_COOKIE_NAME);
  if (!userCookie) return redirect(`/nominate/${urlId}/cookie`);

  let decoded;
  try {
    decoded = jwt.verify(userCookie?.value ?? "", env.JWT_SECRET) as {
      id: string;
    };
  } catch {}

  if (typeof decoded?.id !== "string")
    return redirect(`/nominate/${urlId}/cookie`);

  const seasonsPromise = db
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
    )
    .orderBy(seasonsTable.id);

  const userPromise = db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, decoded.id))
    .limit(1);

  const [seasons, user] = await Promise.all([seasonsPromise, userPromise]);

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
    <div className="flex flex-col items-center gap-4">
      <h1 className="mt-2 text-2xl">Welcome, {user[0]?.name}!</h1>
      <h2 className="text-xl">
        You have nominated {nominatedSeasonsCount} / {nominatableSeasonCount}{" "}
        Seasons!
      </h2>
      <div className="flex flex-wrap gap-4">
        {seasons.map((season) => {
          const nominationCount = season.nomination?.count ?? 0;

          const backgroundColor = getBackgroundColor(
            nominationCount,
            nominatableSeasonCount,
          );

          return (
            <Card key={season.season.id} className={backgroundColor}>
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
                    await decreaseCountOfNomination(
                      season.season.id,
                      nominationCount,
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
                    await increaseCountOfNomination(
                      season.season.id,
                      nominationCount,
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
  );
}

const backgroundColors = [
  "bg-green-950",
  "bg-green-900",
  "bg-green-800",
  "bg-green-700",
];

function getBackgroundColor(count: number, maxCount: number) {
  if (count === 0) return "";
  if (count === 1) return backgroundColors[0];
  const percentage = (count - 1) / (maxCount - 1);
  const index = Math.min(
    Math.floor(percentage * (backgroundColors.length - 1)),
    backgroundColors.length - 1,
  );
  return backgroundColors[index];
}

async function increaseCountOfNomination(
  seasonId: number,
  nominationCount: number,
  nominationRequestId: number,
) {
  const nominationRequest = await db
    .select({
      nominatableSeasonCount: nominationRequestsTable.nominatableSeasonCount,
    })
    .from(nominationRequestsTable)
    .where(eq(nominationRequestsTable.id, nominationRequestId))
    .limit(1);

  if (!nominationRequest[0]) return;
  const nominatableSeasonCount = nominationRequest[0].nominatableSeasonCount;

  await changeCountOfNomination(
    seasonId,
    Math.min(nominationCount + 1, nominatableSeasonCount),
    nominationRequestId,
  );
}

async function decreaseCountOfNomination(
  seasonId: number,
  nominationCount: number,
  nominationRequestId: number,
) {
  await changeCountOfNomination(
    seasonId,
    Math.max(nominationCount - 1, 0),
    nominationRequestId,
  );
}

async function changeCountOfNomination(
  seasonId: number,
  count: number,
  nominationRequestId: number,
) {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get(USER_COOKIE_NAME);

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
          eq(nominationsTable.userId, userId),
          eq(nominationsTable.nominatedSeasonId, seasonId),
        ),
      )
      .limit(1)
  )[0];

  if (nomination) return nomination;

  const createdNomination = await db
    .insert(nominationsTable)
    .values({
      nominationRequestId: nominationRequestId,
      count: 0,
      userId,
      state: "open",
      nominatedSeasonId: seasonId,
    })
    .returning();

  return createdNomination[0];
}
