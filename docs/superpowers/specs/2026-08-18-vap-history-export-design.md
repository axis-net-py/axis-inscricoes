# VAP Historical Data + Excel Export Design

## Goal

Expand Axis Inscrições into a multi-event CRM that preserves historical training data while keeping live events form-driven. Import the supplied Método VAP — Vendas de Alta Performance spreadsheet as a one-time historical dataset, and add per-event Excel export for CRM users.

## Scope

### In scope
- Create a historical event for Método VAP — Vendas de Alta Performance.
- Import the 99 spreadsheet registrations supplied by the user.
- Preserve source data from Jotform, including original submission date, company, role, phone, discovery source, optional discovery detail, payment proof URL, terms acceptance, and payment method.
- Add a formal payment method attribute to payment records.
- Mark imported records with an explicit historical import origin.
- Keep LAP 18 fully form-driven; no import button on the LAP 18 public form or event screen.
- Add an Excel `.xlsx` export action to the authenticated CRM, scoped to the selected event.
- Preserve room for a future consolidated contact view across events.

### Out of scope
- A generic self-service import UI.
- Importing arbitrary spreadsheets from the CRM.
- Migrating old Jotform proof files into Vercel Blob.
- Changing the LAP 18 public form to collect new fields solely because the VAP spreadsheet had them.

## Current data model observations

The CRM already separates:
- `events`: event metadata.
- `contacts`: person identity and core company/contact attributes.
- `registrations`: event-specific responses and attribution.
- `payments`: amount, currency, status, proof URL/filename, notes.

The existing model is suitable for historical VAP data with a small extension for payment method and explicit import metadata.

## Source spreadsheet

File: `FORMULARIO_DE_INSCRIPCIÓN_VEND2026-08-04_09_33_39.xlsx`

Observed columns:
1. Submission Date
2. Nome completo
3. Empresa ou Organização
4. Cargo ou Função atual
5. Telefone
6. Como você ficou sabendo deste treinamento?
7. Outro - Como você ficou sabendo deste treinamento?
8. Anexe seu comprovante de pagamento aqui.
9. Declaração de Conformidade
10. Método de Pagamento
11. Unnamed duplicate/normalized name column

The unnamed final column will not become a CRM field; the canonical name is taken from `Nome completo`, while the extra value can be retained in import metadata only if it differs materially.

## Event model

Create one historical event:
- Name: `Método VAP — Vendas de Alta Performance`
- Slug: `vap-2026`
- Status: `historical`
- Source system: Jotform historical import

Event date/location metadata should use information available from the VAP project and supplied historical material. Missing fields should remain null rather than being invented.

## Contact matching and deduplication

Primary matching key: normalized phone number.

Rules:
- Keep the original phone string in import metadata for auditability.
- Store a normalized phone in `contacts.phone` using digits and country prefix when confidently inferable.
- Do not merge two rows solely by similar names.
- If the normalized phone already exists in CRM, reuse the contact and create a new event registration.
- If two VAP spreadsheet rows normalize to the same phone, flag the duplicate during dry-run and resolve before final insert.

## Historical registration mapping

For each source row:
- `contacts.first_name` / `last_name`: derived conservatively from full name.
- `contacts.company`: Empresa ou Organização.
- `contacts.role_title`: Cargo ou Função atual.
- `contacts.phone`: normalized phone.
- `registrations.event_id`: VAP historical event.
- `registrations.status`: `imported`.
- `registrations.discovery_source`: source column.
- `registrations.discovery_source_other`: optional source detail.
- `registrations.terms_accepted`: true when the supplied declaration indicates acceptance.
- `registrations.created_at`: original Submission Date where parseable.
- `registrations.answers`: preserve original import metadata including original phone, raw full name, source row number, source filename, and any source values that do not have a first-class CRM field.

## Payment mapping

Extend `payments` with `method`.

For each VAP registration:
- `method`: imported payment method such as `Transferência` or `Efetivo`.
- `proof_url`: preserve the historical Jotform URL when present.
- `proof_filename`: derive from the URL when possible.
- `status`: use a neutral imported status unless payment confirmation can be inferred safely from the source.
- Amount/currency should not be fabricated if the spreadsheet does not carry authoritative values; event defaults may be used only if confirmed by VAP source materials.

## Import auditability

Imported registrations must be distinguishable from form submissions. Store:
- source = `IMPORTADO_JOTFORM`
- source file name
- source row number
- imported_at timestamp
- original submission date

The import is a controlled one-time operation performed by the development workflow, not exposed as a CRM button.

## CRM event experience

The admin dashboard should support event selection/filtering. VAP appears as a historical event alongside LAP 18.

For a selected event, expose an `Exportar Excel` action. The export must not mix events unless a future consolidated export is explicitly added.

## Excel export

Generate `.xlsx` server-side for the currently selected event.

Columns should include, in a stable order:
- Event
- Registration ID
- Registration status
- Submission date
- First name
- Last name
- Full name
- Phone
- Email
- Company
- Role
- Discovery source
- Discovery detail
- Expectation
- Accessibility
- Dietary restriction
- Payment method
- Payment status
- Payment currency
- Payment amount
- Payment proof URL
- Terms accepted
- Language
- UTM source
- UTM medium
- UTM campaign
- UTM content
- UTM term
- Referrer
- Import source

The workbook should have a styled header, frozen first row, autofilter/table behavior, sensible widths, date formatting, and hyperlink-compatible proof URLs.

## Security

- Export route is admin-authenticated using the existing session mechanism.
- No public endpoint exposes the registration dataset.
- Existing private Blob handling remains unchanged.
- Historical Jotform URLs are treated as legacy references and are not assumed to be permanently accessible.

## Verification

Before production import:
1. Dry-run all 99 rows.
2. Report parsed rows, malformed phones, duplicate normalized phones, missing mandatory identity values, payment-method distribution, and proof-URL count.
3. Apply schema change through a Neon temporary migration branch.
4. Verify schema in the temporary branch and request migration approval before applying to main.
5. Import in a single transaction with idempotency protection.
6. Verify VAP registration count and spot-check several records.
7. Test Excel export for VAP and LAP 18.
8. Confirm LAP 18 registration flow remains unchanged.
