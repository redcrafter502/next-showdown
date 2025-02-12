export default async function NomitatePage({
  params,
}: {
  params: Promise<{ urlId: string }>;
}) {
  const { urlId } = await params;

  return <div>Nominate for Request with ID: {urlId}</div>;
}
