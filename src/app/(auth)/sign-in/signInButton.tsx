"use client";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";

export function SignInButton() {
  const data = useFormStatus();
  const isLoading = data.pending;

  return (
    <Button type="submit" className="w-full" disabled={isLoading}>
      {isLoading ? (
        <Loader2 className="animate-spin" />
      ) : (
        <>
          <Image
            src="/trakt-logo-square.svg"
            alt="Trakt Logo"
            width={20}
            height={20}
          />
          SignIn with Trakt
        </>
      )}
    </Button>
  );
}
