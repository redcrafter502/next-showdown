import { db } from "@/server/db";
import { nominationRequestsTable } from "@/server/db/schema";
import { eq, and } from "drizzle-orm";
import { redirect } from "next/navigation";
import { auth, signIn } from "@/server/auth";

export default async function OpenStatePage({
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

  if (!(nominationRequest[0]?.state === "open"))
    return redirect(`/dashboard/closed/${urlId}`);

  return (
    <div>
      <p>This Nomination Request is open: UrlId: {urlId}</p>
      <p>{nominationRequest[0].name}</p>
    </div>
  );
}
