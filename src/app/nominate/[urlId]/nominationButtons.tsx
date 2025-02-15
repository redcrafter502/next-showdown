"use client";

import { Button } from "@/components/ui/button";
import { DiamondMinus, DiamondPlus } from "lucide-react";
import { useEffect } from "react";
import { create } from "zustand";

type Nominations = {
  nominations: {
    traktId: number;
    count: number;
  }[];
  nominatedSeasons: number;
  registerNomination: (id: number) => void;
  incrementNominations: (id: number) => void;
  decrementNominations: (id: number) => void;
};

const useNominations = create<Nominations>((set) => ({
  nominations: [],
  nominatedSeasons: 0,
  registerNomination: (traktId) =>
    set((state) => {
      const existingNomination = state.nominations.find(
        (nomination) => nomination.traktId === traktId,
      );

      if (existingNomination) {
        return state; // No change if already nominated
      }

      return {
        nominations: [...state.nominations, { traktId, count: 0 }],
      };
    }),
  incrementNominations: (id) =>
    set((state) => {
      const nominations = state.nominations.map((nomination) => {
        if (nomination.traktId === id) {
          return { ...nomination, count: nomination.count + 1 };
        }
        return nomination;
      });

      return { nominations, nominatedSeasons: state.nominatedSeasons + 1 };
    }),
  decrementNominations: (id) =>
    set((state) => {
      const nominations = state.nominations.map((nomination) => {
        if (nomination.traktId === id) {
          const newCount = nomination.count - 1;
          return { ...nomination, count: Math.max(newCount, 0) };
        }
        return nomination;
      });

      return {
        nominations,
        nominatedSeasons: Math.max(state.nominatedSeasons - 1, 0),
      };
    }),
}));

export default function NominationButtons({
  nominatableSeasonCount,
  traktId,
}: {
  nominatableSeasonCount: number;
  traktId: number;
}) {
  const {
    nominations,
    nominatedSeasons,
    registerNomination,
    incrementNominations,
    decrementNominations,
  } = useNominations();

  useEffect(() => {
    registerNomination(traktId);
  }, [traktId, registerNomination]);

  const nomination = nominations.find(
    (nomination) => nomination.traktId === traktId,
  );

  return (
    <>
      <Button
        variant="default"
        disabled={nomination?.count === 0}
        onClick={() => decrementNominations(traktId)}
      >
        <DiamondMinus />
      </Button>
      {nomination?.count}
      <Button
        variant="default"
        disabled={nominatedSeasons >= nominatableSeasonCount}
        onClick={() => incrementNominations(traktId)}
      >
        <DiamondPlus />
      </Button>
    </>
  );
}
