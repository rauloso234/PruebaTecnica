const euros = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const percent = new Intl.NumberFormat("es-ES", { maximumFractionDigits: 2 });

const date = new Intl.DateTimeFormat("es-ES", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

export const maxAmountCents = 99_999_999_999;

export function parseEuroCents(input: string): number | null {
  const match = /^(\d{1,9})(?:[,.](\d{1,2}))?$/.exec(input.trim());
  if (!match) return null;
  const cents = Number(match[1]) * 100 + Number((match[2] ?? "").padEnd(2, "0"));
  return cents <= maxAmountCents ? cents : null;
}

export function euroInput(cents: number): string {
  const value = BigInt(cents);
  return `${value / 100n},${(value % 100n).toString().padStart(2, "0")}`;
}

export function formatEuro(cents: number | bigint): string {
  const value = BigInt(cents);
  const absolute = value < 0n ? -value : value;
  const amount = absolute / 100n;
  const signedAmount = value < 0n ? (amount === 0n ? -0 : -amount) : amount;
  const fraction = (absolute % 100n).toString().padStart(2, "0");
  return euros.formatToParts(signedAmount).map((part) => part.type === "fraction" ? fraction : part.value).join("");
}

export function formatPercent(value: number): string {
  return `${percent.format(value)} %`;
}

export function formatDate(value: string): string {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? "Fecha no disponible" : date.format(parsed);
}
