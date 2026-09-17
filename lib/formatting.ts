const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function fmtDate(iso: string): string {
  const p = String(iso || "").split("-");
  if (p.length < 3) return iso || "";
  return `${p[2]} ${MONTHS[parseInt(p[1], 10) - 1] ?? ""} ${p[0]}`;
}

export function readingTime(md: string): string {
  const words = String(md || "").split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.round(words / 210))} min`;
}