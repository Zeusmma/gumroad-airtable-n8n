const assert = require('assert'); const { normalizeSale } = require('./normalize');
const ping = { sale_id: 'ABC123==', sale_timestamp: '2026-11-20T10:15:00Z', product_id: 'p1', product_name: 'Notion Template', email: 'Buyer@Example.com ', price: '1999', currency: 'usd', refunded: 'false' };
const r = normalizeSale(ping);
assert.strictEqual(r['Sale ID'], 'ABC123=='); assert.strictEqual(r['Email'], 'buyer@example.com');
assert.strictEqual(r['Amount'], 19.99); assert.strictEqual(r['Currency'], 'USD'); assert.strictEqual(r['Refunded'], false); assert.strictEqual(r['Source'], 'webhook');
const api = { id: 'XYZ', created_at: '2026-11-21T08:00:00Z', product_id: 'p2', product_name: 'Course', email: 'a@example.com', price: 4900, currency: 'eur', refunded: true };
const b = normalizeSale(api);
assert.strictEqual(b['Sale ID'], 'XYZ'); assert.strictEqual(b['Amount'], 49); assert.strictEqual(b['Refunded'], true); assert.strictEqual(b['Source'], 'backfill');
console.log('all tests passed');

// Workflow integrity: valid JSON, every connection points at a real node, and both Code nodes embed the tested function.
const fs = require('fs');
const wf = JSON.parse(fs.readFileSync(__dirname + '/gumroad-to-airtable.n8n.json', 'utf8'));
const names = new Set(wf.nodes.map((n) => n.name));
for (const [from, c] of Object.entries(wf.connections)) {
  assert.ok(names.has(from), 'unknown source node: ' + from);
  for (const t of c.main.flat()) assert.ok(names.has(t.node), 'unknown target node: ' + t.node);
}
const src = fs.readFileSync(__dirname + '/normalize.js', 'utf8');
const fn = src.slice(src.indexOf('function normalizeSale'), src.indexOf('module.exports')).trim();
const codeNodes = wf.nodes.filter((n) => n.type === 'n8n-nodes-base.code');
assert.strictEqual(codeNodes.length, 2);
for (const n of codeNodes) assert.ok(n.parameters.jsCode.includes(fn), n.name + ' is out of sync with normalize.js');
console.log('workflow checks passed');
