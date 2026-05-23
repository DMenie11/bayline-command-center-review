export function dollarsToCents(value: FormDataEntryValue | null | undefined) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? Math.round(parsed * 100) : 0;
}

export function pctToBps(value: FormDataEntryValue | null | undefined) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? Math.round(parsed * 100) : 0;
}

export function formatCurrency(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format((cents || 0) / 100);
}

export function formatPct(bps: number) {
  return `${((bps || 0) / 100).toLocaleString("en-US", { maximumFractionDigits: 2 })}%`;
}
