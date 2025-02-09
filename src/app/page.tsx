import { Button } from "@/components/ui/button";
import { signIn } from "@/server/auth";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
      <Button
        onClick={async () => {
          "use server";
          await signIn();
        }}
      >
        Sign In
      </Button>
    </main>
  );
}
