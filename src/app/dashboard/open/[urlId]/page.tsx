import { db } from "@/server/db";
import { nominationRequestsTable } from "@/server/db/schema";
import { eq, and } from "drizzle-orm";
import { redirect } from "next/navigation";
import { auth, signIn } from "@/server/auth";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

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
    <div className="flex min-h-screen flex-col items-center justify-center">
      <Card>
        <CardHeader>
          <CardTitle>{nominationRequest[0].name}</CardTitle>
          <CardDescription>
            {nominationRequest[0].createdAt.toLocaleDateString()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>This Nomination Request is open: UrlId: {urlId}</p>
        </CardContent>
      </Card>
    </div>
  );
}
