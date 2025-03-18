"use client";

import { createContext, useContext } from "react";
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { DiamondMinus, DiamondPlus } from "lucide-react";

type DataContextType = {
  nominations: {
    traktId: number;
    count: number;
  }[];
  nominatedSeasons: number;

  incrementNomination: (traktId: number) => void;
  decrementNomination: (traktId: number) => void;
} | null;

const DataContext = createContext<DataContextType>(null);

export function useData() {
  return useContext(DataContext);
}

export function DataProvider({
  children,
  nominatableSeasonCount,
  defaultNominations,
}: {
  children: React.ReactNode;
  nominatableSeasonCount: number;
  defaultNominations: {
    traktId: number;
    count: number;
  }[];
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

      incrementNomination: (traktId: number) => {
        setNominationCounts((prev) => {
          return prev.map((nomination) => {
            if (nomination.traktId !== traktId) return nomination;
            return {
              ...nomination,
              count: Math.min(nomination.count + 1, nominatableSeasonCount),
            };
          });
        });
      },
      decrementNomination: (traktId: number) => {
        setNominationCounts((prev) => {
          return prev.map((nomination) => {
            if (nomination.traktId !== traktId) return nomination;
            return {
              ...nomination,
              count: Math.max(nomination.count - 1, 0),
            };
          });
        });
      },
    }),
    [nominationCounts, nominatedSeasons, nominatableSeasonCount],
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function NominationButton({
  nominatableSeasonCount,
  traktId,
}: {
  nominatableSeasonCount: number;
  traktId: number;
}) {
  const data = useData();
  if (!data) return <div>Loading...</div>;
  const {
    nominations,
    nominatedSeasons,
    incrementNomination,
    decrementNomination,
  } = data;

  const nomination = nominations.find(
    (nomination) => nomination.traktId === traktId,
  );

  if (!nomination) return <div>Loading...</div>;

  return (
    <>
      <Button
        variant="default"
        disabled={nomination.count === 0}
        onClick={() => decrementNomination(traktId)}
      >
        <DiamondMinus />
      </Button>
      {nomination.count}
      <Button
        variant="default"
        disabled={nominatedSeasons >= nominatableSeasonCount}
        onClick={() => incrementNomination(traktId)}
      >
        <DiamondPlus />
      </Button>
    </>
  );
}
