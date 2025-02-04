import { Button } from "@/components/ui/button";
import { signOut } from "@/server/auth";

export default function SignOutPage() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
            <form
                action={async () => {
                    "use server";
                    await signOut();
                }}
            >
                <Button type="submit">SignOut</Button>
            </form>
        </main>
    )
}