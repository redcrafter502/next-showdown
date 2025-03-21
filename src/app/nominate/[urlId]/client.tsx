"use client";

import { Button } from "@/components/ui/button";
import { DiamondMinus, DiamondPlus } from "lucide-react";
import { changeCountOfNomination } from "./server";

export function NominationButton() {
  return (
    <>
      <Button
        variant="default"
        //disabled={nomination.count === 0}
        //onClick={async () => await decrementNomination(id)}
      >
        <DiamondMinus />
      </Button>
      {0}
      <Button
        variant="default"
        //disabled={nominatedSeasons >= nominatableSeasonCount}
        //onClick={async () => await incrementNomination(id)}
      >
        <DiamondPlus />
      </Button>
    </>
  );
}
