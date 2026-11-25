# Changelog

All notable changes to this project are documented here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses [Semantic Versioning](https://semver.org/).

## [1.0.0] - 2026-11-25

### Added
- n8n workflow with a Gumroad Ping webhook path and a 6-hourly paginated backfill path.
- Idempotent Airtable upsert matched on `Sale ID`.
- `normalize.js` with unit tests and workflow integrity checks (`node test.js`).
- `scripts/setup.sh` one-command prerequisite check and self-test.
- `AI_SETUP.md` prompt and checklist for AI-assisted installation.
- Workflow diagram, sample Airtable table and test output images.
- CONTRIBUTING, SECURITY, issue templates and `.editorconfig`.
