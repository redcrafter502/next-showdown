import { Button } from "@/components/ui/button";
import { auth, signIn } from "@/server/auth";
import { redirect } from "next/navigation";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
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
    </main>
  );
}
