import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { auth, signOut } from "@/server/auth";
import { redirect } from "next/navigation";
import SignOutButton from "./signOutButton";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/sign-in");
  }

  return (
    <>
      <UserInfo session={session} />
      <h1>This is the Dashbaord</h1>
    </>
  );
}

type AuthSession = {
  user: {
    name?: string | null;
    image?: string | null;
    id: string;
  };
  expires: string;
};

function UserInfo({ session }: { session: AuthSession }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Avatar>
          <AvatarImage src={session.user.image ?? ""} />
          <AvatarFallback>{(session.user.name ?? "U")[0]}</AvatarFallback>
        </Avatar>
      </PopoverTrigger>
      <PopoverContent>
        <div className="flex flex-col gap-3">
          <div>
            <p>My Account</p>
            <p>{session.user.name ?? "<your account has no name>"}</p>
          </div>
          <div>
            <p>Account ID</p>
            <p>{session.user.id}</p>
          </div>
          <div>
            <p>Session Expires</p>
            <p>{session.expires}</p>
          </div>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}
          >
            <SignOutButton />
          </form>
        </div>
      </PopoverContent>
    </Popover>
  );
}
