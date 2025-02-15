import UserProvider from "./user-provider";
import UserNameDisplay from "./userNameDisplay";

export default async function NomitatePage({
  params,
}: {
  params: Promise<{ urlId: string }>;
}) {
  const { urlId } = await params;

  return (
    <UserProvider>
      <div>
        <p>Nominate for Request with ID: {urlId}</p>
        <UserNameDisplay />
      </div>
    </UserProvider>
  );
}
