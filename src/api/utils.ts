/** Round to cents so floating-point noise does not fail money assertions. */
export const cents = (n: number): number => Math.round(n * 100) / 100;

/** A date in ParaBank's MM-DD-YYYY path format (defaults to today). */
export function todayMMDDYYYY(d = new Date()): string {
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${mm}-${dd}-${d.getFullYear()}`;
}
