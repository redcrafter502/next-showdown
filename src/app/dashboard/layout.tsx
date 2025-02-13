import { auth, signIn, signOut } from "@/server/auth";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import SignOutButton from "./signOutButton";
import { Suspense } from "react";
import LoadingSpinner from "./loading";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="m-2">
      <header className="flex items-center justify-between rounded-md bg-blue-50 p-1">
        <nav className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/dashboard">Dashboard</Link>
          </Button>
          <Button variant="secondary" asChild>
            <Link href="/dashboard/new">
              <Plus />
              Create a nomination request
            </Link>
          </Button>
        </nav>
        <Suspense
          fallback={
            <Avatar>
              <AvatarFallback className="bg-gray-50">
                <LoadingSpinner />
              </AvatarFallback>
            </Avatar>
          }
        >
          <UserInfoWrapper />
        </Suspense>
      </header>
      <main className="flex flex-col">{children}</main>
    </div>
  );
}

async function UserInfoWrapper() {
  const session = await auth();
  if (!session?.user) return signIn();

  return <UserInfo session={session} />;
}

type AuthSession = {
  user: {
    name?: string | null;
    image?: string | null;
    id: string;
  };
  accessToken?: string;
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
      <PopoverContent className="m-2">
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
