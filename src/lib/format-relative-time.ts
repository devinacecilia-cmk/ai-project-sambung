export function formatRelativeTime(iso: string, now: number): string {
  const diffSeconds = Math.max(
    0,
    Math.round((now - new Date(iso).getTime()) / 1000),
  );
  if (diffSeconds < 5) return "JUST NOW";
  if (diffSeconds < 60) return `${diffSeconds}S AGO`;
  const diffMinutes = Math.round(diffSeconds / 60);
  if (diffMinutes < 60) return `${diffMinutes}M AGO`;
  const diffHours = Math.round(diffMinutes / 60);
  return `${diffHours}H AGO`;
}
