import { db } from "@/server/db";
import { nominationRequestsTable } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

export default async function OpenStatePage({
  params,
}: {
  params: Promise<{ urlId: string }>;
}) {
  const { urlId } = await params;

  const nominationRequest = await db
    .select()
    .from(nominationRequestsTable)
    .where(eq(nominationRequestsTable.urlId, urlId));

  if (!(nominationRequest[0]?.state === "open"))
    return redirect(`/dashboard/closed/${urlId}`);

  return (
    <div>
      <p>This Nomination Request is open: UrlId: {urlId}</p>
      <p>{nominationRequest[0].name}</p>
    </div>
  );
}
