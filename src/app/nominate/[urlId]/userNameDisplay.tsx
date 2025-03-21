import { db } from "@/server/db";
import { usersTable } from "@/server/db/schema";
import { eq } from "drizzle-orm/expressions";

export default async function UserNameDisplay({ userId }: { userId: string }) {
  const user = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, userId))
    .limit(1);

  if (user.length === 0) return <p>User: Unknown</p>;

  const name = user[0]?.name;

  return <p>User: {name}</p>;
}
