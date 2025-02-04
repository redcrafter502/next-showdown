"use client";
import { Button } from "@/components/ui/button";
import { Loader2, LogOutIcon } from "lucide-react";
import { useFormStatus } from "react-dom";

export default function SignOutButton() {
  const data = useFormStatus();
  const isLoading = data.pending;

  return (
    <Button className="w-full" disabled={isLoading}>
      {isLoading ? (
        <Loader2 className="animate-spin" />
      ) : (
        <>
          <LogOutIcon />
          Logout
        </>
      )}
    </Button>
  );
}
