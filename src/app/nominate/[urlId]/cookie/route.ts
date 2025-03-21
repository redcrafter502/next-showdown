import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { env } from "@/env.js";
import { eq } from "drizzle-orm/expressions";
import { db } from "@/server/db";
import { usersTable } from "@/server/db/schema";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ urlId: string }> },
) {
  const { urlId } = await params;

  const cookieStore = await cookies();
  const userCookie = cookieStore.get("user");

  let decoded;
  try {
    decoded = jwt.verify(userCookie?.value ?? "", env.JWT_SECRET) as {
      id: string;
    };
  } catch {}

  if (typeof decoded?.id !== "string") {
    await createUser();
    return redirect(`/nominate/${urlId}`);
  }
  const user = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, decoded.id))
    .limit(1);

  if (user.length === 0) {
    await createUser();
    return redirect(`/nominate/${urlId}`);
  }

  const newToken = jwt.sign({ id: user[0]?.id }, env.JWT_SECRET, {
    expiresIn: "1h",
  });
  cookieStore.set("user", newToken, {
    httpOnly: true,
    expires: new Date(Date.now() + 3600000),
  });

  return redirect(`/nominate/${urlId}`);
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
}
