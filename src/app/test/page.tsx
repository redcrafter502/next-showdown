import { auth } from "@/server/auth";
import Image from "next/image";

export default async function TestPage() {
    const session = await auth();

    console.log(session);

    if (!session?.user) return null

    return (
        <div>
             {JSON.stringify(session)}
             <Image
                /*src={session.user.image!}*/
                src="https://secure.gravatar.com/avatar/75b70743286d7d57e1a393a2edde0948?d=https%3A%2F%2Fwalter-r2.trakt.tv%2Fhotlink-ok%2Fplaceholders%2Fmedium%2Fzoidberg.png&r=pg&s=256"
                alt="User Avatar"
                width={400}
                height={400}
            />
        </div>
    )
}