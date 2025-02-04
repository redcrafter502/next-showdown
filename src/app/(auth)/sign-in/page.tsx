import { signIn } from "@/server/auth";

export default function SignInOPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
      <form
        action={async () => {
          "use server";
          await signIn("trakt");
        }}
      >
        <button type="submit">SignIn with Trakt</button>
      </form>
    </main>
  );
}
