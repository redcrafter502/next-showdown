import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { env } from "@/env.js";
import { eq } from "drizzle-orm/expressions";
import { db } from "@/server/db";
import { usersTable } from "@/server/db/schema";
import {
  ONE_DAY_IN_MILLISECONDS,
  ONE_DAY_IN_SECONDS,
  USER_COOKIE_NAME,
} from "@/lib/constants";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ urlId: string }> },
) {
  const { urlId } = await params;

  const cookieStore = await cookies();
  const userCookie = cookieStore.get(USER_COOKIE_NAME);

  let decoded;
  try {
    decoded = jwt.verify(userCookie?.value ?? "", env.JWT_SECRET) as {
      id: string;
    };
  } catch {}

  const user = await getOrCreateUser(decoded?.id);
  if (!user) return redirect(`/nominate/${urlId}`);

  const newToken = jwt.sign({ id: user.id }, env.JWT_SECRET, {
    expiresIn: ONE_DAY_IN_SECONDS,
  });
  cookieStore.set(USER_COOKIE_NAME, newToken, {
    httpOnly: true,
    expires: new Date(Date.now() + ONE_DAY_IN_MILLISECONDS),
  });

  return redirect(`/nominate/${urlId}`);
}

async function getOrCreateUser(userId?: string) {
  if (!userId) return createUser();

  const user = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, userId))
    .limit(1);
  if (user.length === 1) return user[0];

  return createUser();
}

async function createUser() {
  const randomName = `User_${Math.floor(Math.random() * 1000)}`;
  const user = await db
    .insert(usersTable)
    .values({
      name: randomName,
    })
    .returning();
  return user[0];
}
