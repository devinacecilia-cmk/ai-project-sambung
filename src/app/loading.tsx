import { Spinner } from "@/components/ui/spinner";

export default function Loading() {
  return (
    <main className="bg-background flex grow items-center justify-center">
      <Spinner className="text-muted-foreground size-6" />
    </main>
  );
}
