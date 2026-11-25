// Normalises one Gumroad sale (Ping webhook body or /v2/sales API item) into one Airtable row.
function normalizeSale(s) {
  const cents = s.price !== undefined ? Number(s.price) : Math.round(Number(String(s.formatted_display_price || '0').replace(/[^0-9.]/g, '')) * 100);
  return {
    'Sale ID': String(s.sale_id || s.id),
    'Email': String(s.email || s.purchaser_email || '').trim().toLowerCase(),
    'Transaction Date': new Date(s.sale_timestamp || s.created_at).toISOString(),
    'Amount': Math.round(cents) / 100,
    'Currency': String(s.currency || 'usd').toUpperCase(),
    'Product ID': String(s.product_id || s.product_permalink || ''),
    'Product Name': String(s.product_name || ''),
    'Refunded': String(s.refunded) === 'true',
    'Source': s.sale_timestamp ? 'webhook' : 'backfill',
  };
}
module.exports = { normalizeSale };
