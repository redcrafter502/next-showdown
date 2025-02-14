import { auth, signIn } from "@/server/auth";
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
import { z } from "zod";
import { db } from "@/server/db";
import { nominationRequestsTable, seasonsTable } from "@/server/db/schema";
import { redirect } from "next/navigation";

const createNominationFormSchema = z.object({
  name: z.string(),
  nominatableSeasonCount: z.coerce.number().positive().int(),
  list: z.string(),
});

export default async function NewPage() {
  const session = await auth();

  if (!session?.user) {
    await signIn();
    return;
  }

  async function createNominationRequest(formData: FormData) {
    "use server";

    const formValues = createNominationFormSchema.safeParse({
      name: formData.get("name"),
      nominatableSeasonCount: formData.get("nominatable-season-count"),
      list: formData.get("list"),
    });

    // TODO: error management
    if (!formValues.success) return;

    const session = await auth();
    if (!session?.user) return;

    const seasons = await getSeasonsForList(
      formValues.data.list,
      session.accessToken,
    );

    const nominationRequest = await db
      .insert(nominationRequestsTable)
      .values({
        name: formValues.data.name,
        listName: formValues.data.list,
        traktUserId: session.user.id,
        nominatableSeasonCount: formValues.data.nominatableSeasonCount,
      })
      .returning({
        urlId: nominationRequestsTable.urlId,
        id: nominationRequestsTable.id,
      });

    const seasonsPromises = seasons.map((season) =>
      db.insert(seasonsTable).values({
        nominationRequestId: nominationRequest[0]?.id,
        traktSeasonId: season.id,
        title: season.show.title,
        year: season.show.year,
        seasonNumber: season.season.number,
      }),
    );
    await Promise.all(seasonsPromises);

    redirect(`/dashboard/open/${nominationRequest[0]?.urlId}`);
  }

  return (
    <form action={createNominationRequest} className="mt-4 flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Create a new Nomination Request</h1>
      <div className="flex items-end gap-4">
        <div>
          <Label htmlFor="name-input">Name</Label>
          <Input
            name="name"
            placeholder="Name"
            id="name-input"
            maxLength={255}
          />
        </div>
        <div>
          <Label htmlFor="nominatable-season-count-input">
            Nominatable Season Count
          </Label>
          <Input
            name="nominatable-season-count"
            type="number"
            min={1}
            required
            placeholder="Nominatable Season Count"
            id="nominatable-season-count-input"
          />
        </div>
        <Button>Create and get link</Button>
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
                  value={list.name}
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

async function getListsForUser(_accessToken: string) {
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

  const data: unknown = await resp?.json();
  return data;*/
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

/* eslint-disable */
async function getSeasonsForList(_listName: string, _accessToken: string) {
  /*const resp = await fetch(
    `https://api.trakt.tv/users/me/lists/${listName}/items/season`,
    {
      method: "GET",
      headers: {
        "trakt-api-version": "2",
        "trakt-api-key": env.AUTH_TRAKT_ID,
        Authorization: accessToken,
      },
    },
  ).catch((err) => {
    console.log("Fetch error", err);
  });

  const data: unknown = await resp?.json();
  return data;*/

  // Mock Data
  return [
    {
      rank: 1,
      id: 1169288812,
      listed_at: "2025-02-04T11:49:02.000Z",
      notes: null,
      type: "season",
      season: {
        number: 24,
        ids: { trakt: 1500, tvdb: 488447, tmdb: 3605, tvrage: null },
      },
      show: {
        title: "The Simpsons",
        year: 1989,
        ids: {
          trakt: 455,
          slug: "the-simpsons",
          tvdb: 71663,
          imdb: "tt0096697",
          tmdb: 456,
          tvrage: null,
        },
      },
    },
    {
      rank: 2,
      id: 1169288954,
      listed_at: "2025-02-04T11:49:47.000Z",
      notes: null,
      type: "season",
      season: {
        number: 4,
        ids: { trakt: 1480, tvdb: 2738, tmdb: 3585, tvrage: null },
      },
      show: {
        title: "The Simpsons",
        year: 1989,
        ids: {
          trakt: 455,
          slug: "the-simpsons",
          tvdb: 71663,
          imdb: "tt0096697",
          tmdb: 456,
          tvrage: null,
        },
      },
    },
    {
      rank: 3,
      id: 1169288960,
      listed_at: "2025-02-04T11:49:53.000Z",
      notes: null,
      type: "season",
      season: {
        number: 7,
        ids: { trakt: 1483, tvdb: 2741, tmdb: 3588, tvrage: null },
      },
      show: {
        title: "The Simpsons",
        year: 1989,
        ids: {
          trakt: 455,
          slug: "the-simpsons",
          tvdb: 71663,
          imdb: "tt0096697",
          tmdb: 456,
          tvrage: null,
        },
      },
    },
    {
      rank: 4,
      id: 1169288967,
      listed_at: "2025-02-04T11:49:56.000Z",
      notes: null,
      type: "season",
      season: {
        number: 11,
        ids: { trakt: 1487, tvdb: 2729, tmdb: 3592, tvrage: null },
      },
      show: {
        title: "The Simpsons",
        year: 1989,
        ids: {
          trakt: 455,
          slug: "the-simpsons",
          tvdb: 71663,
          imdb: "tt0096697",
          tmdb: 456,
          tvrage: null,
        },
      },
    },
    {
      rank: 5,
      id: 1169289012,
      listed_at: "2025-02-04T11:50:20.000Z",
      notes: null,
      type: "season",
      season: {
        number: 7,
        ids: { trakt: 2089, tvdb: 468993, tmdb: 1875, tvrage: null },
      },
      show: {
        title: "Futurama",
        year: 1999,
        ids: {
          trakt: 614,
          slug: "futurama",
          tvdb: 73871,
          imdb: "tt0149460",
          tmdb: 615,
          tvrage: null,
        },
      },
    },
    {
      rank: 6,
      id: 1169289017,
      listed_at: "2025-02-04T11:50:23.000Z",
      notes: null,
      type: "season",
      season: {
        number: 2,
        ids: { trakt: 2084, tvdb: 6589, tmdb: 1869, tvrage: null },
      },
      show: {
        title: "Futurama",
        year: 1999,
        ids: {
          trakt: 614,
          slug: "futurama",
          tvdb: 73871,
          imdb: "tt0149460",
          tmdb: 615,
          tvrage: null,
        },
      },
    },
  ];
}
/* eslint-enable */
