import { signIn } from "@/server/auth";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { SignInButton } from "@/app/(home)/sign-in/signInButton";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function SignInPage() {
  return (
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
              await signIn("trakt", { redirectTo: "/dashboard" }); // TODO: redirect to callback url from search params
            }}
          >
            <SignInButton />
          </form>
        </CardContent>
        <CardFooter>
          <p>Made with ❤️ by redcrafter502!</p>
        </CardFooter>
      </Card>

      <Button variant="secondary" className="w-full" asChild>
        <Link href="/">
          <ArrowLeft />
          Go back to Homepage
        </Link>
      </Button>
    </div>
  );
}
