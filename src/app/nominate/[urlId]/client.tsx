"use client";

import { createContext, useContext } from "react";
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { DiamondMinus, DiamondPlus } from "lucide-react";
import { changeCountOfNomination } from "./server";

type DataContextType = {
  nominations: {
    id: number;
    count: number;
  }[];
  nominatedSeasons: number;

  incrementNomination: (id: number) => Promise<void>;
  decrementNomination: (id: number) => Promise<void>;
} | null;

const DataContext = createContext<DataContextType>(null);

export function useData() {
  return useContext(DataContext);
}

export function DataProvider({
  children,
  nominatableSeasonCount,
  defaultNominations,
  nominationRequestId,
}: {
  children: React.ReactNode;
  nominatableSeasonCount: number;
  defaultNominations: {
    id: number;
    count: number;
  }[];
  nominationRequestId: number;
}) {
  const [nominationCounts, setNominationCounts] = useState(defaultNominations);
  const nominatedSeasons = useMemo(
    () => nominationCounts.reduce((acc, cur) => acc + cur.count, 0),
    [nominationCounts],
  );

  const value = useMemo(
    () => ({
      nominations: nominationCounts,
      nominatedSeasons,

      incrementNomination: async (id: number) => {
        console.log("incrementing");
        let count;
        setNominationCounts((prev) => {
          return prev.map((nomination) => {
            if (nomination.id !== id) return nomination;
            count = Math.min(nomination.count + 1, nominatableSeasonCount);
            console.log("count 1", count);
            return {
              ...nomination,
              count: count,
            };
          });
        });
        console.log("count 2", count);
        if (count)
          await changeCountOfNomination(id, count, nominationRequestId);
      },
      decrementNomination: async (id: number) => {
        setNominationCounts((prev) => {
          return prev.map((nomination) => {
            if (nomination.id !== id) return nomination;
            return {
              ...nomination,
              count: Math.max(nomination.count - 1, 0),
            };
          });
        });
      },
    }),
    [
      nominationCounts,
      nominatedSeasons,
      nominatableSeasonCount,
      nominationRequestId,
    ],
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function NominationButton({
  nominatableSeasonCount,
  id,
}: {
  nominatableSeasonCount: number;
  id: number;
}) {
  const data = useData();
  if (!data) return <div>Loading...</div>;
  const {
    nominations,
    nominatedSeasons,
    incrementNomination,
    decrementNomination,
  } = data;

  const nomination = nominations.find((nomination) => nomination.id === id);

  if (!nomination) return <div>Loading...</div>;

  return (
    <>
      <Button
        variant="default"
        disabled={nomination.count === 0}
        onClick={async () => await decrementNomination(id)}
      >
        <DiamondMinus />
      </Button>
      {nomination.count}
      <Button
        variant="default"
        disabled={nominatedSeasons >= nominatableSeasonCount}
        onClick={async () => await incrementNomination(id)}
      >
        <DiamondPlus />
      </Button>
    </>
  );
}
