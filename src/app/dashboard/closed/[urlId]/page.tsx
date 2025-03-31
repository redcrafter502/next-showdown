import { auth, signIn } from "@/server/auth";

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

  return <div>This Nomination Request is closed: UrlId: {urlId}</div>;
}
