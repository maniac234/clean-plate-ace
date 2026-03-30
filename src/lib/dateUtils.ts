/**
 * Safely format a date string (YYYY-MM-DD) to pt-BR locale
 * without timezone shift issues.
 */
export function formatDateBR(value?: string | null): string {
  if (!value) return "—";
  // For date-only strings (YYYY-MM-DD), split and format manually
  // to avoid timezone conversion issues
  const parts = value.split("T")[0].split("-");
  if (parts.length === 3) {
    const [y, m, d] = parts;
    return `${d.padStart(2, "0")}/${m.padStart(2, "0")}/${y}`;
  }
  return "—";
}
