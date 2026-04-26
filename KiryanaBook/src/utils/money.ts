// Money helpers: keep rupee math precise.
// Rule: any user-facing rupee amount is rounded to 2 decimals using paisa-integer math.
// Use toPaisa() before adding/subtracting; fromPaisa() to display.

export const toPaisa = (rupees: number | string | null | undefined): number => {
  const n = typeof rupees === 'string' ? parseFloat(rupees) : Number(rupees);
  if (!isFinite(n)) return 0;
  // round to nearest paisa to kill float noise
  return Math.round(n * 100);
};

export const fromPaisa = (paisa: number): number => {
  if (!isFinite(paisa)) return 0;
  return Math.round(paisa) / 100;
};

// Sum a list of {price, qty} rupee values precisely.
export const sumLineItems = (
  items: { price: number | string; qty: number | string }[]
): number => {
  let totalPaisa = 0;
  for (const i of items) {
    const p = toPaisa(i.price);
    const q = Number(i.qty) || 0;
    totalPaisa += p * q;
  }
  return fromPaisa(totalPaisa);
};

// Apply a discount (rupees) to a subtotal (rupees) safely.
export const applyDiscount = (subtotal: number, discount: number | string): number => {
  const sub = toPaisa(subtotal);
  const dis = Math.max(0, toPaisa(discount));
  return fromPaisa(Math.max(0, sub - dis));
};

// Parse a discount input — guards NaN / negatives.
export const parseDiscount = (raw: string | number | null | undefined): number => {
  if (raw === '' || raw == null) return 0;
  const n = typeof raw === 'string' ? parseFloat(raw) : Number(raw);
  if (!isFinite(n) || n < 0) return 0;
  return fromPaisa(toPaisa(n));
};

// Format for display.
export const formatRs = (rupees: number): string => {
  const n = fromPaisa(toPaisa(rupees));
  return n.toLocaleString('en-PK', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
};
