"use server";

import { db } from "@/server/db";
import { nominationsTable, usersTable } from "@/server/db/schema";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { and, eq } from "drizzle-orm";
import { env } from "@/env";

export async function getUser() {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get("user");

  let decoded;
  try {
    decoded = jwt.verify(userCookie?.value ?? "", env.JWT_SECRET) as {
      id: string;
    };
  } catch {}

  if (typeof decoded?.id !== "string") {
    return await createUser();
  } else {
    const user = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, decoded.id))
      .limit(1);

    if (user.length === 0) {
      return await createUser();
    }

    const newToken = jwt.sign({ id: user[0]?.id }, env.JWT_SECRET, {
      expiresIn: "1h",
    });
    cookieStore.set("user", newToken, {
      httpOnly: true,
      expires: new Date(Date.now() + 3600000),
    });

    return user[0];
  }
}

async function createUser() {
  const cookieStore = await cookies();

  const randomName = `User_${Math.floor(Math.random() * 1000)}`;
  const user = await db
    .insert(usersTable)
    .values({
      name: randomName,
    })
    .returning();
  const token = jwt.sign({ id: user[0]?.id }, env.JWT_SECRET, {
    expiresIn: "1h",
  });
  cookieStore.set("user", token, {
    httpOnly: true,
    expires: new Date(Date.now() + 3600000),
  });
  return user[0];
}

export async function changeCountOfNomination(
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
