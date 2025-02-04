import { signIn } from "@/server/auth";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { SignInButton } from "@/app/(auth)/sign-in/signInButton";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function SignInPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
      <div className="flex max-w-md flex-col gap-4">
        <Card>
          <CardHeader>
            <CardTitle>SignIn</CardTitle>
            <CardDescription>
              Sign In to easily find the next show to watch!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              action={async () => {
                "use server";
                await signIn("trakt", { redirectTo: "/test" });
              }}
            >
              <SignInButton />
            </form>
          </CardContent>
          <CardFooter>
            <p>Made with ❤️ by redcrafter502!</p>
          </CardFooter>
        </Card>
        <Link href="/">
          <Button variant="secondary" className="w-full">
            <ArrowLeft />
            Go back to Homepage
          </Button>
        </Link>
      </div>
    </main>
  );
}
