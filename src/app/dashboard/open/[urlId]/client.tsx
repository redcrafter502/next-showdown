"use client";

import { Button } from "@/components/ui/button";
import { Clipboard, Loader2 } from "lucide-react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";

export function UrlCopyButton({ url }: { url: string }) {
  async function copyUrlToClipboard() {
    await navigator.clipboard.writeText(url).catch((error) => {
      toast.error("Failed to copy URL to clipboard: " + error);
    });
    toast.success("URL copied to clipboard");
  }

  return (
    <Button variant="ghost" onClick={copyUrlToClipboard}>
      <Clipboard />
    </Button>
  );
}

export function CloseNominationRequestButton() {
  const data = useFormStatus();
  const loading = data.pending;

  return (
    <Button
      disabled={loading}
      variant="destructive"
      className="w-full"
      type="submit"
    >
      {loading ? (
        <Loader2 className="animate-spin" />
      ) : (
        <>Close nomination request</>
      )}
    </Button>
  );
}
