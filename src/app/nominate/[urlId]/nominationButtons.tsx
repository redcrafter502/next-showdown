"use client";

import { Button } from "@/components/ui/button";
import { DiamondMinus, DiamondPlus } from "lucide-react";
import { create } from "zustand";

type Nominations = {
  nominations: number;
  incrementNominations: () => void;
  decrementNominations: () => void;
};

const useNominations = create<Nominations>((set) => ({
  nominations: 0,
  incrementNominations: () =>
    set((state) => ({ nominations: state.nominations + 1 })),
  decrementNominations: () =>
    set((state) => ({ nominations: state.nominations - 1 })),
}));

export default function NominationButtons() {
  const { nominations, incrementNominations, decrementNominations } =
    useNominations();

  return (
    <>
      <Button
        variant="default"
        disabled={nominations === 0}
        onClick={decrementNominations}
      >
        <DiamondMinus />
      </Button>
      {nominations}
      <Button
        variant="default"
        disabled={nominations >= 5}
        onClick={incrementNominations}
      >
        <DiamondPlus />
      </Button>
    </>
  );
}
