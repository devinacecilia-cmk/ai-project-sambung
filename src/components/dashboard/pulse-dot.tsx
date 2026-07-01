export function PulseDot({ tone = "success" }: { tone?: "success" | "error" }) {
  const color = tone === "error" ? "bg-red-500" : "bg-emerald-500";
  const ping = tone === "error" ? "bg-red-400" : "bg-emerald-400";

  return (
    <span className="relative flex size-2">
      <span
        className={`absolute inline-flex size-full animate-ping rounded-full ${ping} opacity-75`}
      />
      <span className={`relative inline-flex size-2 rounded-full ${color}`} />
    </span>
  );
}
