import { Button } from "@/components/ui/button";
import { auth, signIn } from "@/server/auth";
import { redirect } from "next/navigation";

export default function HomePage() {
  return (
    <Button
      onClick={async () => {
        "use server";
        const session = await auth();

        if (!session) {
          await signIn();
        }

        redirect("/dashboard");
      }}
    >
      Get Started
    </Button>
  );
}
