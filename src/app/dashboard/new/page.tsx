import { auth } from "@/server/auth";
import { redirect } from "next/navigation";
//import { env } from "@/env";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default async function NewPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/sign-in");
  }

  async function newAction(data: FormData) {
    "use server";
    console.log(data);
  }

  return (
    <form action={newAction} className="flex flex-col gap-4">
      <h1>New</h1>
      <div className="flex gap-4">
        <div>
          <Label htmlFor="name-input">Name</Label>
          <Input name="name" placeholder="Name" id="name-input" />
        </div>
        <Button>New</Button>
      </div>
      <List accessToken={session.accessToken} />
    </form>
  );
}

async function List({ accessToken }: { accessToken?: string }) {
  if (!accessToken) {
    return <div>There was an error getting the Access Token!</div>;
  }

  const lists = await getListsForUser(accessToken);

  return (
    <div className="flex flex-col gap-4">
      <RadioGroup name="list" required>
        {lists.map((list, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2.5">
                {list.name}
                <a href={list.share_link}>
                  <ExternalLink size="15" />
                  <span className="sr-only">View this list on Trakt</span>
                </a>
                <Badge variant="secondary">{list.privacy}</Badge>
              </CardTitle>
              <CardDescription>
                {list.description || "<no description for list found>"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <RadioGroupItem
                  value={index.toString()}
                  id={`new-list-select-${index}`}
                />
                <Label htmlFor={`new-list-select-${index}`}>
                  Select this list as basis for choosing your new show
                </Label>
              </div>
            </CardContent>
            <CardFooter>
              {list.item_count} Items | Created at {list.created_at}
            </CardFooter>
          </Card>
        ))}
      </RadioGroup>
    </div>
  );
}

async function getListsForUser(accessToken?: string) {
  /*const resp = await fetch(`https://api.trakt.tv/users/me/lists/`, {
    method: "GET",
    headers: {
      "trakt-api-version": "2",
      "trakt-api-key": env.AUTH_TRAKT_ID,
      Authorization: accessToken,
    },
  }).catch((err) => {
    console.log("Fetch error", err);
  });

  const data: unknown = await resp?.json();*/
  // Mock data
  return [
    {
      name: "Test",
      description: "",
      privacy: "private",
      share_link: "https://trakt.tv/lists/30576030",
      type: "personal",
      display_numbers: false,
      allow_comments: true,
      sort_by: "rank",
      sort_how: "asc",
      created_at: "2025-02-04T11:48:30.000Z",
      updated_at: "2025-02-04T11:50:23.000Z",
      item_count: 6,
      comment_count: 0,
      likes: 0,
      ids: { trakt: 30576030, slug: "test" },
      user: {
        username: "redcrafter502",
        private: false,
        name: "redcrafter502",
        vip: false,
        vip_ep: false,
        ids: { slug: "redcrafter502" },
      },
    },
    {
      name: "Test Link",
      description: "",
      privacy: "link",
      share_link:
        "https://trakt.tv/lists/share/a602e5e8738126195c1bc4f7aee1db88",
      type: "personal",
      display_numbers: false,
      allow_comments: true,
      sort_by: "rank",
      sort_how: "asc",
      created_at: "2025-02-04T16:52:13.000Z",
      updated_at: "2025-02-04T16:52:13.000Z",
      item_count: 0,
      comment_count: 0,
      likes: 0,
      ids: { trakt: 30577400, slug: "test-link" },
      user: {
        username: "redcrafter502",
        private: false,
        name: "redcrafter502",
        vip: false,
        vip_ep: false,
        ids: { slug: "redcrafter502" },
      },
    },
  ];
}
