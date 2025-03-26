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
import { Input } from "@/components/ui/input";
import { UrlCopyButton } from "./client";

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

  const url = nominationRequest[0].urlId;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <Card>
        <CardHeader>
          <CardTitle>{nominationRequest[0].name}</CardTitle>
          <CardDescription>
            {nominationRequest[0].createdAt.toLocaleDateString()}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p>
            This is an open nomination request. Pleaselj share the link below to
            allow people to nominate seasons.
          </p>
          <div className="flex w-full gap-4">
            <Input disabled value={url} />
            <UrlCopyButton url={url} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
