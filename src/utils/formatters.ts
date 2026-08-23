/**
 * Universal Indian Currency (INR - ₹) Formatter (§Indian Procurement Standards)
 */
export function formatINR(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) return '₹0';
  const isNegative = amount < 0;
  const absVal = Math.abs(Math.round(amount));
  return `${isNegative ? '-' : ''}₹${absVal.toLocaleString('en-IN')}`;
}

/**
 * Compact Indian Currency Notation (Lakhs & Crores)
 */
export function formatINRCompact(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) return '₹0';
  const isNegative = amount < 0;
  const absVal = Math.abs(amount);

  let formatted = '';
  if (absVal >= 10000000) {
    formatted = `${(absVal / 10000000).toFixed(2)} Cr`;
  } else if (absVal >= 100000) {
    formatted = `${(absVal / 100000).toFixed(2)} Lakh`;
  } else {
    formatted = `${Math.round(absVal).toLocaleString('en-IN')}`;
  }

  return `${isNegative ? '-' : ''}₹${formatted}`;
}


export const isBuyerSpectator = (p: any): boolean => {
  if (!p) return false;
  if (p.isAi) return false;
  const name = (p.name || '').toLowerCase();
  return (
    name.includes('director') ||
    name.includes('buyer') ||
    name.includes('procurement authority') ||
    name.includes('procurement directorate') ||
    name.includes('spectator')
  );
};
