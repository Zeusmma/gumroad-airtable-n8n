# Set up with an AI assistant

Give the prompt below to your AI coding assistant (Claude Code, Cursor, Copilot Chat, or similar) from inside a checkout of this repository. It installs nothing risky: the repository itself has no runtime dependencies, so the assistant only verifies the checkout and then guides you through the n8n, Airtable and Gumroad steps that need your accounts.

## Copy-paste prompt

```text
You are setting up the project in the current directory: an n8n workflow that writes every
Gumroad sale into an Airtable table (live webhook plus a scheduled backfill).

Rules:
- Read README.md and AI_SETUP.md first.
- Never invent API keys, base IDs or URLs. Ask me for every credential and wait for my answer.
- Never paste secrets into files that are tracked by git, into logs or into chat output.
- Run each command shown in AI_SETUP.md, show me the output, and stop if a step fails.

Do this:
1. Run the prerequisite checks (step 1 in AI_SETUP.md).
2. Run ./scripts/setup.sh and confirm the output ends with "Setup check passed".
3. Walk me through steps 3 to 8 of AI_SETUP.md one at a time (Airtable table, n8n import,
   variables, credential, activation, Gumroad Ping URL). After each step ask me to confirm.
4. Run the verification steps (step 9) with me and report PASS or FAIL for each.
5. Finish with a short summary of what was configured and what I still have to do by hand.
```

## Checklist

### 1. Prerequisites

| Need | Check | Expected |
|---|---|---|
| Node.js 18 or newer (20 recommended) | `node -v` | `v18.x` or higher |
| git | `git --version` | any recent version |
| An n8n instance (cloud or self-hosted) | open its URL | you can sign in |
| An Airtable account | open airtable.com | you can sign in |
| A Gumroad account with at least one product | open gumroad.com | you can sign in |

n8n must be able to receive public HTTPS requests (n8n Cloud does this by default; for self-hosted n8n set `WEBHOOK_URL` and expose the instance, for example behind a reverse proxy). n8n variables (`$vars`) require an n8n plan or edition that includes the Variables feature.

### 2. Verify the checkout

```sh
./scripts/setup.sh
```

Expected output (the Node version differs):

```text
node v20.x.x ok
workflow JSON is valid
all tests passed
workflow checks passed

Setup check passed. Next steps ...
```

Windows: run the same steps in Git Bash or WSL, or run `node test.js` directly.

### 3. Create the Airtable table

Create a base and a table named exactly `Sales` with these fields (names are case-sensitive):

| Field | Type |
|---|---|
| Sale ID | Single line text (primary field) |
| Email | Email |
| Transaction Date | Date, with time |
| Amount | Currency |
| Currency | Single line text |
| Product ID | Single line text |
| Product Name | Single line text |
| Refunded | Checkbox |
| Source | Single select with options `webhook` and `backfill` |

### 4. Collect the values you need (ask the user, never guess)

| Value | Where to find it | Used for |
|---|---|---|
| Airtable base ID (starts with `app`) | Airtable base URL, or the API docs page of the base | n8n variable `AIRTABLE_BASE_ID` |
| Airtable personal access token | airtable.com/create/tokens, scopes `data.records:read`, `data.records:write`, `schema.bases:read`, restricted to this base | n8n credential "Airtable Personal Access Token" |
| Gumroad access token | Gumroad Settings > Advanced > Applications > create an application, then generate an access token | n8n variable `GUMROAD_ACCESS_TOKEN` |

### 5. Import the workflow into n8n

n8n editor: Workflows > Add workflow > menu (three dots) > Import from file > choose `gumroad-to-airtable.n8n.json`. The imported workflow has 9 nodes (see `docs/images/workflow.png`).

### 6. Add the variables and the credential

1. n8n Settings > Variables: add `AIRTABLE_BASE_ID` and `GUMROAD_ACCESS_TOKEN`.
2. Create the credential "Airtable Personal Access Token" and paste the token.
3. Open both Airtable nodes ("Upsert to Airtable (by Sale ID)" and "Upsert backfill (by Sale ID)") and select that credential.

### 7. Activate and copy the webhook URL

Open the node "Gumroad Ping (webhook)", copy the **Production URL** (path `gumroad-sale`, method POST), then switch the workflow to Active.

### 8. Point Gumroad at the webhook

Gumroad Settings > Advanced > Ping endpoint: paste the Production URL and save.

### 9. Verify end to end

| Check | How | Expected |
|---|---|---|
| Live capture | Buy your own product (or a $0 test product) | A new row appears in `Sales` within seconds, `Source` = `webhook` |
| No duplicates | In Gumroad use "Resend ping" for the same sale, or POST the same body twice | Still exactly one row for that `Sale ID` |
| Backfill | In n8n open the workflow and click "Execute workflow" on the manual trigger | Rows for sales of the last 30 days exist, `Source` = `backfill` for rows that were missing |
| Count | Compare the row count with the Gumroad dashboard for the same period | Counts match |

### Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| `./scripts/setup.sh`: "Node.js 18 or newer is required" | Old Node | Install Node 20 from nodejs.org or with a version manager |
| Webhook never fires | Workflow not active, or the test URL was used | Activate the workflow and use the Production URL, not the Test URL |
| Gumroad shows ping failures | n8n not reachable from the internet | Check `WEBHOOK_URL`, DNS, TLS certificate |
| `Cannot read properties of undefined` in a Code node | Webhook body is empty | Confirm the Ping URL ends with `/webhook/gumroad-sale` and the method is POST |
| Airtable node: "Field ... does not exist" | Field name typo or missing field | Match the field names in step 3 exactly |
| Airtable node: 403 or "NOT_AUTHORIZED" | Token lacks scopes or base access | Recreate the token with the scopes in step 4 and add this base |
| Expression error on `$vars.AIRTABLE_BASE_ID` | Variable missing or Variables feature not available | Create the variables, or replace the expressions with literal values in the two Airtable nodes and the HTTP node |
| Backfill returns 401 | Bad Gumroad token | Generate a new access token and update the variable |
| Duplicate rows | `Sale ID` is not the primary field, or the match column was changed | Restore the field type and the match column `Sale ID` in both Airtable nodes |

### Uninstall and cleanup

1. Deactivate and delete the workflow in n8n.
2. Remove the Ping endpoint in Gumroad Settings > Advanced.
3. Delete the n8n variables and the credential; revoke the Airtable token and the Gumroad access token.
4. Delete the Airtable table or base if you no longer need the data.
5. Delete this checkout. It installs nothing outside its own folder.
