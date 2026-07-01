"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="bg-background flex grow items-center justify-center px-6">
      <div className="flex max-w-md flex-col items-center gap-5 text-center">
        <p className="text-muted-foreground text-sm font-medium">
          Something went wrong
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">
          This route could not be rendered.
        </h1>
        <p className="text-muted-foreground">
          Try again, or check the console for the captured error.
        </p>
        <Button onClick={reset}>Try again</Button>
      </div>
    </main>
  );
}
