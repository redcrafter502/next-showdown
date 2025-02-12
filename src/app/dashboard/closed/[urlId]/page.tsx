export default async function ClosedStatePage({
  params,
}: {
  params: Promise<{ urlId: string }>;
}) {
  const { urlId } = await params;

  return <div>This Nomination Request is closed: UrlId: {urlId}</div>;
}
