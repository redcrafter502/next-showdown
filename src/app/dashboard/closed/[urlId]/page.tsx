import { auth, signIn } from "@/server/auth";
import { db } from "@/server/db";
import { eq, and } from "drizzle-orm/expressions";
import { nominationRequestsTable } from "@/server/db/schema";
import { redirect } from "next/navigation";

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
    );

  if (!nominationRequest[0]) return redirect("/dashboard");
  if (!(nominationRequest[0].state === "closed"))
    return redirect(`/dashboard/open/${urlId}`);

  return (
    <div>
      This Nomination Request is closed: UrlId: {urlId} It has the name:{" "}
      {nominationRequest[0].name}
    </div>
  );
}
