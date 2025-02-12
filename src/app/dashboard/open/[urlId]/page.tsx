export default async function OpenStatePage({
  params,
}: {
  params: Promise<{ urlId: string }>;
}) {
  const { urlId } = await params;

  return <div>This Nomination Request is open: UrlId: {urlId}</div>;
}
