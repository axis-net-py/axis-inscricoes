# VAP Historical Import + Excel Export Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Import 99 historical Método VAP registrations into Axis Inscrições and add secure per-event Excel export without adding a user-facing import workflow.

**Architecture:** Extend the existing multi-event CRM with one historical VAP event and a small payment schema addition. Keep historical import as a controlled idempotent data migration/script, while export is an authenticated server endpoint that serializes the selected event dataset into `.xlsx`.

**Tech Stack:** Next.js 16, React 19, Neon Postgres, Node test runner, Vercel, `xlsx`-capable server library selected for runtime compatibility.

**Spec:** `docs/superpowers/specs/2026-08-18-vap-history-export-design.md`

## Global Constraints

- LAP 18 remains form-driven; no import button is added to the current event.
- VAP is a separate historical event.
- Historical source is explicitly labeled `IMPORTADO_JOTFORM`.
- Do not fabricate missing VAP amounts, dates, venues, or other metadata.
- Old Jotform proof URLs are preserved as legacy references, not migrated to Blob.
- Export is admin-authenticated and scoped to one event.
- Import must be idempotent and transactional.

---

### Task 1: Profile and normalize the VAP source workbook

**Files:**
- Create: `scripts/vap-import-data.json` or generated normalized fixture excluded from secrets
- Create: `tests/vap-import.test.mjs`
- Create: `lib/vap-import.mjs`

**Interfaces:**
- Produces: `normalizeVapRow(row, rowNumber)` and `profileVapRows(rows)`.
- Produces normalized records consumed by Task 3.

- [ ] **Step 1: Write failing tests for phone normalization, name splitting, terms mapping, payment method mapping, and source audit metadata.**
- [ ] **Step 2: Run `npm test` and confirm the new tests fail for missing implementation.**
- [ ] **Step 3: Implement the minimal pure normalization functions.**
- [ ] **Step 4: Run tests and confirm they pass.**
- [ ] **Step 5: Parse all 99 workbook rows and produce a dry-run profile: valid rows, duplicate normalized phones, malformed phones, missing identity fields, payment method counts, proof URL count.**
- [ ] **Step 6: Commit normalization and profiling code.**

### Task 2: Extend payment schema safely

**Files:**
- Modify: database schema via Neon migration workflow
- Modify: `lib/db.js` if payment reads/writes need the new field
- Test: database verification query on temporary branch

**Interfaces:**
- Produces: `payments.method` available to import and export.

- [ ] **Step 1: Prepare a Neon database migration that adds payment method support without modifying existing data.**
- [ ] **Step 2: Verify the new field exists on the temporary migration branch.**
- [ ] **Step 3: Present migration ID, branch name/ID, and result to the user and obtain explicit approval.**
- [ ] **Step 4: Apply the approved migration to main through `complete_database_migration`.**
- [ ] **Step 5: Verify the production schema.**

### Task 3: Create historical VAP event and import registrations

**Files:**
- Create: `scripts/import-vap.mjs`
- Modify: `lib/vap-import.mjs`
- Test: `tests/vap-import.test.mjs`

**Interfaces:**
- Consumes normalized VAP rows from Task 1.
- Produces one `vap-2026` event, contacts, registrations, and payments.

- [ ] **Step 1: Write a failing test for deterministic import keys/idempotency logic.**
- [ ] **Step 2: Implement event lookup/create logic for `vap-2026`.**
- [ ] **Step 3: Implement contact reuse by normalized phone and registration creation by event + import source row identity.**
- [ ] **Step 4: Implement payment creation with method and legacy proof URL.**
- [ ] **Step 5: Run a database dry-run that performs no writes and compare counts with Task 1 profile.**
- [ ] **Step 6: Execute the final import in one transaction.**
- [ ] **Step 7: Verify exactly the expected historical registration count and spot-check records with/without transfer proof, cash payment, alternate discovery source, and pre-existing contact match.**
- [ ] **Step 8: Re-run the import to verify idempotency produces zero duplicate registrations.**
- [ ] **Step 9: Commit import tooling and any required data-access changes.**

### Task 4: Add reusable event export query

**Files:**
- Modify: `lib/db.js`
- Create: `lib/export.mjs`
- Test: `tests/export.test.mjs`

**Interfaces:**
- Produces: `getEventExportRows(eventId)` and `buildEventWorkbook(event, rows)`.

- [ ] **Step 1: Write failing tests defining stable export column order and null handling.**
- [ ] **Step 2: Implement the joined event/contact/registration/payment query.**
- [ ] **Step 3: Implement flattening of structured registration data into export rows.**
- [ ] **Step 4: Run tests and confirm stable columns for both historical and live registrations.**
- [ ] **Step 5: Commit export data layer.**

### Task 5: Generate secure `.xlsx` downloads

**Files:**
- Modify: `package.json`
- Create: `app/api/admin/events/[id]/export/route.js`
- Modify/Create: `lib/export.mjs`
- Test: `tests/export.test.mjs`

**Interfaces:**
- HTTP GET `/api/admin/events/:id/export` returns an Excel attachment for authenticated admin sessions.

- [ ] **Step 1: Write failing unit tests for workbook filename, header order, date values, and exported row values.**
- [ ] **Step 2: Add the minimal Excel-generation dependency compatible with Vercel Node runtime.**
- [ ] **Step 3: Implement workbook formatting: styled header, first-row freeze, filter/table, sensible column widths, date format, proof URLs.**
- [ ] **Step 4: Implement authenticated route and `Content-Disposition` filename using event slug.**
- [ ] **Step 5: Run tests and `npm run build`.**
- [ ] **Step 6: Commit export endpoint.**

### Task 6: Add Exportar Excel to CRM event view

**Files:**
- Modify: current admin dashboard/event UI files under `app/admin`
- Test: existing tests plus build verification

**Interfaces:**
- UI links selected event to `/api/admin/events/{id}/export`.

- [ ] **Step 1: Locate existing event selection/filter state and add a testable export-link helper if necessary.**
- [ ] **Step 2: Add `Exportar Excel` button only in authenticated CRM UI.**
- [ ] **Step 3: Ensure VAP appears as historical event and LAP 18 remains unchanged.**
- [ ] **Step 4: Run all tests and production build.**
- [ ] **Step 5: Commit UI integration.**

### Task 7: Production verification

**Files:**
- No new production files unless a defect is found.

- [ ] **Step 1: Confirm latest Vercel deployment is READY.**
- [ ] **Step 2: Test CRM login and selected-event navigation.**
- [ ] **Step 3: Export VAP Excel and verify 99 historical rows plus header.**
- [ ] **Step 4: Export LAP 18 and verify only LAP 18 registrations are present.**
- [ ] **Step 5: Submit one test LAP 18 registration only if safe, or validate existing form endpoint without creating unwanted production data.**
- [ ] **Step 6: Confirm no public import UI exists and no registration data is publicly downloadable.**
