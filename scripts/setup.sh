#!/usr/bin/env bash
# One-command local setup and self-check. Idempotent: safe to run repeatedly.
# It does not touch n8n, Airtable or Gumroad; it only verifies this checkout.
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."

need() { command -v "$1" >/dev/null 2>&1 || { echo "error: '$1' is required but not installed" >&2; exit 1; }; }

need node
major="$(node -p 'process.versions.node.split(".")[0]')"
if [ "$major" -lt 18 ]; then
  echo "error: Node.js 18 or newer is required (found $(node -v))" >&2
  exit 1
fi
echo "node $(node -v) ok"

node -e 'JSON.parse(require("fs").readFileSync("gumroad-to-airtable.n8n.json","utf8"))'
echo "workflow JSON is valid"

node test.js

cat <<'MSG'

Setup check passed. Next steps (in n8n and Gumroad, see AI_SETUP.md):
  1. Import gumroad-to-airtable.n8n.json into n8n.
  2. Create the Airtable "Sales" table (fields are listed in README.md).
  3. Set n8n variables AIRTABLE_BASE_ID and GUMROAD_ACCESS_TOKEN and add the Airtable credential.
  4. Activate the workflow and paste the production webhook URL into Gumroad > Settings > Advanced > Ping.
MSG
