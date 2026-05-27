# Requirements Document

## Introduction

This specification covers a consolidated set of changes to the existing "Logistics Data Hub" (Trinetra Logistics) TanStack Start + React 19 + Tailwind + shadcn/ui project. The work spans four concerns delivered as a single feature:

1. **Lead-gating monetization** — Blur indicative quotes and partially mask the freight rate table until a visitor submits a lead form, with EmailJS as the lead-capture channel.
2. **Admin self-service editing** — Replace the demo admin view with a real, single-admin control panel that can edit, add, and remove freight rates, branches, and delivery stories. The previous member dashboard is removed and the admin landing page becomes the unified admin experience.
3. **Site cleanup** — Remove the Diesel Tracker, remove the customer signup/dashboard surface that paired with it, fix project file/structure issues, and apply UX polish (fade transitions, parallax-style scroll effects) without removing existing UI components.
4. **Free-tier-only auth and persistence** — Authenticate the single admin and persist admin edits without introducing any paid service. Both the recommended approach and the limitations are captured explicitly so the owner understands the tradeoffs.

The system MUST remain hostable on free infrastructure (no paid database, no paid backend). Where a free approach has known limitations (for example, leads visible only on the device they were captured on), the limitation is captured as an explicit non-functional requirement rather than hidden.

### Recommended Approaches (justification)

The following recommendations are made by this spec and are reflected in the requirements below. They exist here so the reasoning is auditable; the specific behavior is captured in EARS form in the Requirements section.

- **Auth — Recommended: bcryptjs hash committed to a JSON file in the repo, validated client-side.**
  Evaluated alternatives:
  - *Plaintext credentials JSON in repo* — rejected. Even in a private repo, a leaked clone or future repo-visibility change exposes credentials.
  - *Vite build-time env vars (`import.meta.env.VITE_*`)* — rejected as the sole mechanism. `VITE_*` values are inlined into the production bundle and are trivially recoverable from the shipped JS, so this is no stronger than committing a hash and is harder to rotate (requires a redeploy).
  - *Supabase Auth free tier / Cloudflare Workers KV* — rejected for v1. Both are viable free-tier options but introduce a network dependency, an account, and additional surface area for a single-admin scenario. They are noted as a future upgrade path (see NFR-1).
  - *Manual repo edits only (no in-app login)* — rejected because the user explicitly wants an admin UI.
  - *Recommended:* commit a `bcryptjs` hash of the admin password to `src/data/admin-credentials.json` (private repo). The login page hashes the entered password client-side and compares against the stored hash. This avoids ever shipping the plaintext password, but the spec is explicit (NFR-3) that any client-side-only auth in a SPA is bypassable by a determined attacker who can edit JS in the browser, so the threat model is "stop casual access," not "stop a motivated attacker."

- **Data persistence — Recommended: localStorage as the immediate store, with a one-click "Export current data as JSON" action so the owner can commit changes back to the repo.**
  Evaluated alternatives:
  - *localStorage only* — fails the user's stated requirement that admin edits must be visible to public visitors. Edits made on the admin's device do not propagate.
  - *GitHub API + PAT from the admin UI* — viable and free, but requires a Personal Access Token in the SPA. A PAT in `VITE_*` env or in localStorage is exfiltratable (see NFR-3). Captured as an optional future enhancement (NFR-1) with explicit security caveats.
  - *Supabase free tier / Cloudflare D1 / KV* — best long-term answer for shared persistence. Out of scope for v1 to honor the "no paid services, no new backend" constraint, but called out in NFR-1 as the upgrade path.
  - *Manual JSON edits in the repo by the owner* — works but defeats the purpose of an admin UI.
  - *Recommended:* the admin UI reads and writes to localStorage as the working copy, layered over the seed data in `src/data/mock.ts`. Each admin tab provides "Export JSON" (download the current dataset) and "Import JSON" (load a previously exported file) actions. To publish edits to public visitors, the owner exports the JSON, replaces the corresponding file under `src/data/`, and redeploys. This is honest about the constraint and keeps the deploy a single, cheap step. NFR-1 captures the upgrade path to Supabase / D1 when shared real-time persistence becomes a hard requirement.

- **Leads unification — Recommended: a single "Leads" view with a `source` filter (`enquiry` vs `quote-request`).**
  Both flows submit through the same EmailJS pipeline and write to the same client-side store. A unified table with a source filter and per-source column visibility removes duplicate code paths in the admin and matches how the owner will triage leads in practice.

## Glossary

- **Public_Visitor**: An unauthenticated user browsing the public site.
- **Admin_User**: The single authenticated owner/operator of the site. There is exactly one admin identity.
- **Lead**: A record produced when a Public_Visitor submits the lead capture form. Carries a `source` discriminator of either `enquiry` (from the home page FreightEstimator gate or the freight rates page gate) or `quote-request` (from the existing Get Quote page).
- **Lead_Capture_Form**: The form that collects the visitor's name, company, mobile, email, and (where applicable) the in-flight rate context. Used by both the FreightEstimator unlock flow and the freight rates page unlock flow.
- **EmailJS_Service**: The third-party EmailJS free-tier service that delivers Lead submissions to the owner's email.
- **FreightEstimator**: The home-page rate calculator component (`src/components/FreightEstimator.tsx`).
- **Freight_Rates_Page**: The public freight rate dashboard at `/freight-rates`.
- **Admin_Panel**: The single admin landing page at `/admin`. The previous `/dashboard` route is removed and its responsibilities are merged here.
- **Diesel_Tracker**: The existing `/diesel-rates` route, its data, and its references. Removed entirely by this spec.
- **Lead_Store**: The client-side (browser localStorage) persistent record of submitted Leads under a single key. Read by the Admin_Panel.
- **Editable_Dataset**: A dataset (Freight Rates, Branches, Delivery Stories) that the Admin_User can edit through the Admin_Panel. Backed by localStorage at runtime and by a JSON seed file at build time.
- **Seed_Data**: The initial values for each Editable_Dataset, shipped in the repository under `src/data/`.
- **Reveal_State**: The boolean flag indicating whether the current Public_Visitor has submitted a Lead in the current browser. Used to decide whether prices are blurred or shown. Persisted in localStorage.
- **Admin_Session**: The authenticated state for the Admin_User in the current browser. Persisted in localStorage with an expiry timestamp.
- **Login_Throttle**: The client-side rate-limit applied to failed admin login attempts.
- **Credential_Hash**: The bcryptjs hash of the admin password, committed to the private repository.

## Requirements

### Requirement 1: Home Page Indicative Rate Lead-Gating

**User Story:** As a site owner, I want the indicative rate produced by the FreightEstimator to appear blurred until the visitor submits a lead form, so that I capture contact details before revealing pricing.

#### Acceptance Criteria

1. WHEN a Public_Visitor clicks "Get Indicative Rate" in the FreightEstimator AND the Reveal_State for that browser is `false`, THE FreightEstimator SHALL render the computed price range using a CSS blur filter such that the digits are not legibly readable.
2. WHEN the Reveal_State is `false` AND an indicative rate has been computed, THE FreightEstimator SHALL render a primary action button labeled "Fill the form to unlock final quote" in place of the previous "Sign Up to Unlock Final Quote" / "View Detailed Rates" button.
3. WHEN the Public_Visitor activates the "Fill the form to unlock final quote" button, THE FreightEstimator SHALL open the Lead_Capture_Form as a modal dialog populated with the in-flight estimator inputs (`from`, `to`, `weight`, `vehicle`, `category`, computed `low`, `high`, `perTon`).
4. WHEN the Lead_Capture_Form submission to EmailJS_Service succeeds, THE System SHALL set the Reveal_State to `true`, persist it in localStorage under the key `trinetra_lead_revealed`, close the dialog, and return the Public_Visitor to the home page with the previously blurred indicative rate now rendered without the blur filter.
5. WHEN the Reveal_State is `true` AND an indicative rate has been computed, THE FreightEstimator SHALL render the price range without any blur filter and SHALL replace the unlock button with a confirmation label such as "Quote details sent to your email".
6. IF the Lead_Capture_Form submission to EmailJS_Service fails for any reason, THEN THE System SHALL leave the Reveal_State as `false`, keep the dialog open, and display an inline error message indicating the submission could not be delivered and inviting a retry.
7. THE FreightEstimator SHALL persist the Reveal_State across page reloads in the same browser by reading and writing the `trinetra_lead_revealed` localStorage key on mount and on successful submission.

### Requirement 2: Freight Rates Page Partial Masking and Lead-Gating

**User Story:** As a site owner, I want the public freight rates table to show a small free preview and mask the rest until the visitor submits a lead form, so that the table doubles as a lead magnet.

#### Acceptance Criteria

1. WHILE the Reveal_State is `false`, THE Freight_Rates_Page SHALL render the first two rows of the filtered freight-rate result set with the `rate` and `dieselImpact` columns shown in full.
2. WHILE the Reveal_State is `false`, THE Freight_Rates_Page SHALL render every row beyond the first two with the `rate` and `dieselImpact` cell contents replaced by the literal string "***" and SHALL render a small lock icon adjacent to each masked cell.
3. WHILE the Reveal_State is `false`, THE Freight_Rates_Page SHALL render below the freight-rate table a primary action button labeled "Submit form to get full details" in place of the previous "Login to View Detailed Rates" CTA card.
4. WHEN the Public_Visitor activates the "Submit form to get full details" button, THE Freight_Rates_Page SHALL open the Lead_Capture_Form as a modal dialog with `source` set to `enquiry` and `context` set to "freight-rates".
5. WHEN the Lead_Capture_Form submission to EmailJS_Service succeeds, THE System SHALL set the Reveal_State to `true`, persist it under `trinetra_lead_revealed`, close the dialog, and re-render the freight-rate table with all rows fully populated.
6. WHILE the Reveal_State is `true`, THE Freight_Rates_Page SHALL render every row of the filtered freight-rate result set with no masked cells and SHALL hide the unlock CTA below the table.
7. WHEN the filtered result set has two or fewer rows AND the Reveal_State is `false`, THE Freight_Rates_Page SHALL still render the unlock CTA so that the visitor is prompted to submit a Lead before the filter is changed to a broader query.
8. THE Freight_Rates_Page SHALL preserve all existing filter controls (From, To, Truck, Load, Search) without visual or behavioral regression when the gating layer is added.

### Requirement 3: Lead Capture Form and EmailJS Submission

**User Story:** As a site owner, I want every lead-gating surface to use a single Lead_Capture_Form that submits to EmailJS and stores a copy locally, so that the owner receives an email per lead and the admin panel can show the lead history.

#### Acceptance Criteria

1. THE Lead_Capture_Form SHALL collect the following fields, validated with `react-hook-form` and `zod`: `name` (required, 2–100 chars), `company` (required, 1–100 chars), `mobile` (required, matches Indian mobile pattern `^[+]?[0-9 ]{8,15}$`), `email` (required, valid email), `city` (optional, 0–60 chars), `monthlyShipments` (optional, 0–60 chars), `routes` (optional, 0–200 chars), and a hidden `context` payload describing the originating surface and any pre-filled rate inputs.
2. WHEN the Public_Visitor submits the Lead_Capture_Form with valid data, THE System SHALL invoke `emailjs.send(serviceId, templateId, payload, publicKey)` using the EmailJS_Service browser SDK with credentials read from Vite environment variables `VITE_EMAILJS_SERVICE_ID`, `VITE_EMAILJS_TEMPLATE_ID`, and `VITE_EMAILJS_PUBLIC_KEY`.
3. WHEN the EmailJS_Service `send` call resolves successfully, THE System SHALL append a record `{ id, createdAt, source: "enquiry" | "quote-request", context, ...formFields }` to the Lead_Store under the localStorage key `trinetra_leads`.
4. WHEN the EmailJS_Service `send` call resolves successfully, THE System SHALL display a Sonner success toast with the message "Lead submitted. We will reach out shortly." and SHALL invoke the success callback supplied by the calling surface (FreightEstimator unlock, Freight_Rates_Page unlock, or Get Quote submission).
5. IF any required EmailJS environment variable is missing at runtime, THEN THE System SHALL still record the Lead in the Lead_Store, SHALL display a Sonner warning toast indicating that the email delivery is not configured, and SHALL still set the Reveal_State to `true` so the user-visible flow is not blocked by an owner configuration miss.
6. IF the EmailJS_Service `send` call rejects, THEN THE System SHALL display a Sonner error toast with a retry-friendly message, SHALL NOT append to the Lead_Store, and SHALL NOT change the Reveal_State.
7. THE Lead_Capture_Form SHALL preserve current shadcn `Form`, `Input`, `Label`, `Select`, `Textarea`, and `Button` components so that the existing accessible labelling and focus management remain intact.

### Requirement 4: Get Quote Page Migrated to Unified Lead Pipeline

**User Story:** As a site owner, I want the existing Get Quote page to write into the same Lead_Store and EmailJS pipeline as the new lead-gating surfaces, so that I have one place to triage everything.

#### Acceptance Criteria

1. WHEN the Public_Visitor submits the Get Quote form, THE System SHALL invoke the same EmailJS_Service `send` call described in Requirement 3 with the form payload and `source` set to `quote-request`.
2. WHEN the EmailJS submission resolves successfully, THE System SHALL append the record to the Lead_Store under `trinetra_leads` with `source: "quote-request"` and SHALL retain the existing success confirmation UI shown on `/get-quote`.
3. THE System SHALL stop writing Get Quote submissions to the legacy `trinetra_quotes` localStorage key once Requirement 4 is implemented.
4. WHERE a `trinetra_quotes` array exists in localStorage at runtime, THE System SHALL one-time-migrate its records into `trinetra_leads` with `source: "quote-request"` on first load of the Admin_Panel and SHALL delete the legacy key after migration.
5. THE Get Quote page SHALL retain every existing input field and validation rule with no regression.

### Requirement 5: Removal of Diesel Tracker

**User Story:** As a site owner, I want the Diesel Tracker removed from the site, so that visitors do not see a feature I no longer want to offer.

#### Acceptance Criteria

1. THE System SHALL remove the route file `src/routes/diesel-rates.tsx` from the codebase.
2. THE System SHALL remove every navigation link to `/diesel-rates` from `SiteHeader`, `SiteFooter`, and any in-page CTAs.
3. THE System SHALL remove the `dieselRates` export and `DieselRate` type from `src/data/mock.ts` along with any imports of those symbols.
4. THE System SHALL remove the "Diesel Rates" tab and its `<DataTable>` invocation from the Admin_Panel.
5. WHEN any other page or component (for example the LogisticsTicker) references diesel-rate data, THE System SHALL update those references to either use a static placeholder or remove the dependency without introducing a build error.
6. WHEN a Public_Visitor or Admin_User navigates directly to the URL `/diesel-rates`, THE System SHALL render the standard 404 / not-found view produced by TanStack Router for unknown routes.

### Requirement 6: Removal of Customer Login, Signup, and Member Dashboard

**User Story:** As a site owner, I want to remove the customer login, signup, and member dashboard surfaces, so that the only authenticated surface in the application is the Admin_Panel.

#### Acceptance Criteria

1. THE System SHALL remove the route file `src/routes/dashboard.tsx`.
2. THE System SHALL remove the route file `src/routes/signup.tsx`.
3. THE System SHALL retain `src/routes/login.tsx` ONLY as the admin login surface and SHALL remove every reference to a customer signup link from the login page.
4. THE System SHALL remove the customer-user portion of the existing `useAuth` hook (the `user`, `login`, and `logout` operations associated with `trinetra_user`) and replace it with the Admin_User-only auth contract defined in Requirement 9.
5. THE System SHALL remove every navigation link to `/dashboard` and `/signup` from `SiteHeader`, `SiteFooter`, and any component CTAs (including the FreightEstimator pre-existing "Sign Up to Unlock Final Quote" link, which is replaced by Requirement 1).
6. WHEN a visitor navigates directly to `/dashboard` or `/signup`, THE System SHALL render the standard 404 / not-found view produced by TanStack Router.
7. THE System SHALL one-time-clear any legacy `trinetra_user` localStorage key on application bootstrap so that previously-stored fake "customer" sessions do not leak into the new flows.

### Requirement 7: Admin_Panel as the Single Admin Landing Page

**User Story:** As the Admin_User, I want clicking "Admin" to take me directly to a full operations page, so that there is no extra "Dashboard" hop and no duplicated views.

#### Acceptance Criteria

1. WHEN the Admin_User navigates to `/admin` AND the Admin_Session is valid, THE Admin_Panel SHALL render the unified admin operations view described by Requirements 8 through 12.
2. WHEN the Admin_User navigates to `/admin` AND the Admin_Session is missing or expired, THE Admin_Panel SHALL redirect to `/login` and SHALL preserve the originally requested path so that the user is returned to `/admin` after a successful login.
3. THE Admin_Panel SHALL retain the existing `Tabs` layout and SHALL expose exactly the following tabs in this order: "Leads", "Freight Rates", "Branches", "Delivery Stories".
4. THE Admin_Panel SHALL retain the existing summary `Stat` cards row and SHALL show counts for Leads (total), Freight Rate rows, Branch rows, and Delivery Story rows. The previous "Diesel Rates" stat is removed.
5. THE System SHALL remove the existing demo footer text "Demo admin uses local storage. Connect Lovable Cloud to persist data across users and devices." and replace it with the persistence advisory specified in Requirement 13.

### Requirement 8: Unified Leads View with Source Filter

**User Story:** As the Admin_User, I want a single Leads tab that shows both home-page enquiries and quote-request submissions filtered by source, so that I can triage them in one place.

#### Acceptance Criteria

1. THE Admin_Panel "Leads" tab SHALL read from the Lead_Store under `trinetra_leads` and SHALL render every record sorted by `createdAt` descending.
2. THE Admin_Panel "Leads" tab SHALL render a source filter control with options "All", "Enquiry", and "Quote Request" and SHALL filter the displayed rows according to the current selection.
3. WHEN the source filter is "All", THE Admin_Panel SHALL render columns: Created, Source, Name, Company, Mobile, Email, Context Summary.
4. WHEN the source filter is "Enquiry", THE Admin_Panel SHALL render columns: Created, Name, Company, Mobile, Email, City, Monthly Shipments, Routes, Origin (FreightEstimator | Freight Rates).
5. WHEN the source filter is "Quote Request", THE Admin_Panel SHALL render columns: Created, Name, Company, Mobile, Pickup, Delivery, Material, Weight, Truck, Loading Date, Remarks.
6. THE Admin_Panel "Leads" tab SHALL provide an "Export Leads (JSON)" action that downloads the current filtered Leads array as a JSON file named `trinetra-leads-{YYYY-MM-DD}.json`.
7. THE Admin_Panel "Leads" tab SHALL provide a per-row "Delete" action that, after a `AlertDialog` confirmation, removes the Lead from the Lead_Store.
8. WHILE the Lead_Store is empty for the current source filter, THE Admin_Panel SHALL render the empty-state copy "No leads yet for this filter."

### Requirement 9: Single-Admin Authentication

**User Story:** As the Admin_User, I want to log in to the admin panel using my email and password without paying for a backend, so that only I can edit site data.

#### Acceptance Criteria

1. THE System SHALL store the Credential_Hash and admin email in a JSON file at `src/data/admin-credentials.json` containing exactly `{ "email": string, "passwordHash": string, "algo": "bcryptjs", "rounds": 10 }`.
2. THE System SHALL NOT store, log, transmit, or commit the plaintext admin password under any circumstance, in any environment.
3. WHEN the Admin_User submits the `/login` form, THE System SHALL invoke `bcryptjs.compare(enteredPassword, storedHash)` in the browser AND SHALL compare the entered email to the stored email using a constant-time string comparison.
4. WHEN both comparisons succeed, THE System SHALL create an Admin_Session record `{ email, expiresAt }` with `expiresAt = now + 8 hours`, persist it in localStorage under the key `trinetra_admin_session`, set the in-memory auth state, and navigate to `/admin`.
5. IF either comparison fails, THEN THE System SHALL display the inline error "Invalid email or password.", SHALL NOT create a session, and SHALL increment the Login_Throttle counter described in Requirement 10.
6. WHEN the Admin_User clicks "Logout" from the Admin_Panel, THE System SHALL delete the `trinetra_admin_session` key, clear the in-memory auth state, and navigate to `/`.
7. WHILE the current time is greater than the Admin_Session `expiresAt`, THE System SHALL treat the session as missing and SHALL force a redirect to `/login` from any admin-only route.
8. WHERE Vite environment variables `VITE_ADMIN_EMAIL` and `VITE_ADMIN_PASSWORD_HASH` are present at build time, THE System SHALL prefer those values over the JSON file so that the owner can rotate credentials by redeploying without committing a new JSON.
9. THE System SHALL replace the existing `useAuth` hook with a new `useAdminAuth` hook exposing `{ admin, login, logout, isAuthenticated, expiresAt }`, and SHALL update all consumers accordingly.

### Requirement 10: Login Rate-Limiting and Hardening

**User Story:** As the Admin_User, I want the login page to throttle repeated failed attempts, so that a casual brute-force attempt against the SPA login is slowed down.

#### Acceptance Criteria

1. THE System SHALL maintain a Login_Throttle counter in localStorage under `trinetra_login_throttle` with shape `{ failures: number, blockedUntil: number | null }`.
2. WHEN a login attempt fails, THE System SHALL increment `failures` by 1.
3. IF `failures` reaches 5 within a rolling 15-minute window, THEN THE System SHALL set `blockedUntil` to `now + 15 minutes` AND SHALL reject further submissions on this device until that timestamp passes, displaying the time remaining.
4. WHEN a login attempt succeeds, THE System SHALL reset `failures` to 0 and `blockedUntil` to null.
5. WHILE `blockedUntil` is in the future, THE login form Submit button SHALL be disabled and SHALL render the message "Too many failed attempts. Try again in N minutes."
6. THE System SHALL avoid revealing whether the email or the password was wrong; both failure modes return the same generic error from Requirement 9 acceptance criterion 5.

### Requirement 11: Admin Editing of Freight Rates

**User Story:** As the Admin_User, I want to edit, add, and remove freight rate rows in the admin panel, so that I can keep the public rate table current without redeploying.

#### Acceptance Criteria

1. THE Admin_Panel "Freight Rates" tab SHALL render every row in the Editable_Dataset for freight rates as an editable table with columns: From, To, Vehicle, Load Type, Rate (₹), Diesel Impact, Updated.
2. WHEN the Admin_User activates the "Edit" action on a row, THE Admin_Panel SHALL open an inline or dialog form pre-populated with that row's values, validated by zod with the same field constraints as the `FreightRate` type.
3. WHEN the Admin_User activates the "Add Row" action, THE Admin_Panel SHALL open the same form with empty defaults and append the saved row to the Editable_Dataset on submit.
4. WHEN the Admin_User activates the "Remove" action on a row, THE Admin_Panel SHALL prompt with a shadcn `AlertDialog` and SHALL delete the row from the Editable_Dataset only on confirmation.
5. WHEN any Editable_Dataset for freight rates is mutated, THE System SHALL persist the full updated array to localStorage under `trinetra_freight_rates` AND SHALL update the `updated` field of any inserted or modified row to today's date in `YYYY-MM-DD` format.
6. WHEN the public Freight_Rates_Page or the FreightEstimator reads freight rate data, THE System SHALL prefer the Editable_Dataset from localStorage over the Seed_Data from `src/data/mock.ts`, falling back to the Seed_Data only if the localStorage value is missing or fails schema validation.
7. THE Admin_Panel "Freight Rates" tab SHALL provide "Export JSON" and "Import JSON" actions that respectively download the current dataset as `freight-rates.json` and replace the dataset from a user-selected JSON file (after a confirmation dialog).
8. IF an imported JSON file fails schema validation, THEN THE System SHALL reject the import, display an error toast naming the failing field, and leave the existing dataset unchanged.

### Requirement 12: Admin Editing of Branches

**User Story:** As the Admin_User, I want to edit, add, and remove branch entries, so that the Branches page and contact information stay current.

#### Acceptance Criteria

1. THE Admin_Panel "Branches" tab SHALL render every Branch row in the Editable_Dataset with columns: Name, City, State, Head Office (badge), Contact Person, Phone, Email, Routes (count), Industries (count).
2. WHEN the Admin_User activates "Edit" on a Branch row, THE Admin_Panel SHALL open a dialog form covering every field of the `Branch` type, including arrays for `routes` and `industries` edited as comma-separated tokens.
3. WHEN the Admin_User activates "Add Branch", THE Admin_Panel SHALL open the same form with empty defaults and a uniqueness check on `slug`.
4. IF a submitted Branch form contains a `slug` that already exists in the Editable_Dataset (and is not the row being edited), THEN THE System SHALL block the save, attach a field-level error to `slug`, and leave the dataset unchanged.
5. WHEN the Admin_User activates "Remove" on a Branch row, THE Admin_Panel SHALL prompt with a shadcn `AlertDialog` and SHALL delete the row only on confirmation.
6. WHEN the Editable_Dataset for branches is mutated, THE System SHALL persist the full updated array to localStorage under `trinetra_branches`.
7. WHEN any public-facing surface reads branch data (Branches page, FreightEstimator city options, footer contact list), THE System SHALL prefer the Editable_Dataset from localStorage over the Seed_Data, falling back to the Seed_Data only if the localStorage value is missing or fails schema validation.
8. THE Admin_Panel "Branches" tab SHALL provide "Export JSON" and "Import JSON" actions matching the contract in Requirement 11 acceptance criteria 7 and 8.

### Requirement 13: Admin Editing of Delivery Stories

**User Story:** As the Admin_User, I want to edit, add, and remove delivery stories, so that the Deliveries page reflects fresh case studies.

#### Acceptance Criteria

1. THE Admin_Panel "Delivery Stories" tab SHALL render every Delivery row in the Editable_Dataset with columns: Industry, Route, Load, Challenge, Solution, Result.
2. WHEN the Admin_User activates "Edit" on a Delivery row, THE Admin_Panel SHALL open a dialog form covering every field of the `Delivery` type with `Textarea` controls for the long-text fields (Challenge, Solution, Result) and a 600-character soft limit per field.
3. WHEN the Admin_User activates "Add Story", THE Admin_Panel SHALL open the same form with empty defaults.
4. WHEN the Admin_User activates "Remove" on a Delivery row, THE Admin_Panel SHALL prompt with a shadcn `AlertDialog` and SHALL delete the row only on confirmation.
5. WHEN the Editable_Dataset for delivery stories is mutated, THE System SHALL persist the full updated array to localStorage under `trinetra_deliveries`.
6. WHEN the public Deliveries page reads delivery story data, THE System SHALL prefer the Editable_Dataset from localStorage over the Seed_Data, falling back to the Seed_Data only if the localStorage value is missing or fails schema validation.
7. THE Admin_Panel "Delivery Stories" tab SHALL provide "Export JSON" and "Import JSON" actions matching the contract in Requirement 11 acceptance criteria 7 and 8.

### Requirement 14: Persistence Advisory in the Admin_Panel

**User Story:** As the Admin_User, I want the admin panel to clearly state how persistence works in this free-tier setup, so that I am not surprised when edits do not appear for visitors on other devices.

#### Acceptance Criteria

1. THE Admin_Panel SHALL render a persistent advisory banner with the text "Edits are saved locally in this browser. To publish to public visitors, use Export JSON on each tab and replace the corresponding file under src/data/, then redeploy." and SHALL render it above the tabs strip.
2. THE Admin_Panel SHALL render a "Last edited (this device)" timestamp for each Editable_Dataset, derived from the most recent mutation.
3. THE Admin_Panel SHALL provide a single "Export All (JSON)" action that bundles the current Freight Rates, Branches, and Delivery Stories into one JSON file named `trinetra-data-{YYYY-MM-DD}.json` for the owner to commit.

### Requirement 15: Project Structure Cleanup

**User Story:** As a senior SDE pass on the codebase, I want unused files, dead imports, and stale demo references removed without removing any UI components or shadcn elements, so that the project is easier to maintain.

#### Acceptance Criteria

1. THE System SHALL remove all imports, types, and code paths made dead by Requirements 5 and 6 (Diesel Tracker removal and customer login/signup/dashboard removal).
2. THE System SHALL NOT remove any file under `src/components/ui/`.
3. THE System SHALL NOT remove `LogisticsTicker`, `FreightEstimator`, `SiteHeader`, `SiteFooter`, or `SiteLayout` components, and SHALL preserve each component's external API where consumers remain.
4. THE System SHALL update `src/data/mock.ts` to remove the `DieselRate` type, the `dieselRates` array, the `trustMetrics` and `deliveryCounters` arrays only if they are unused after the cleanup, and SHALL leave any still-referenced exports untouched.
5. THE System SHALL update `src/routeTree.gen.ts` and `src/router.tsx` to reflect the removed routes; if the route tree is generated, the System SHALL re-run the generator rather than hand-editing.
6. THE System SHALL run `eslint .` and SHALL leave the project with zero new lint errors introduced by this work.
7. THE System SHALL run `tsc --noEmit` (or the equivalent through `vite build`) and SHALL leave the project with zero new type errors introduced by this work.

### Requirement 16: UX Polish — Fade Transitions

**User Story:** As a Public_Visitor, I want pages and cards to fade in smoothly, so that the site feels polished without being distracting.

#### Acceptance Criteria

1. WHEN a TanStack Router route transition occurs, THE System SHALL apply a fade-in transition to the outgoing-page-replaced content with a duration between 150ms and 300ms.
2. WHEN a section card mounts in the viewport on the home page, THE System SHALL apply a fade-in plus a small upward translate (no greater than 16px) using a CSS transition or `tw-animate-css` utility classes.
3. THE System SHALL respect the `prefers-reduced-motion: reduce` media query AND SHALL disable both the route fade and the card fade animations when that preference is set, replacing them with an instant transition.
4. THE System SHALL NOT introduce animation libraries beyond what is already installed (`tw-animate-css` is acceptable; `framer-motion` is not introduced by this requirement).
5. THE System SHALL NOT animate any form field, modal, or interactive control in a way that delays focus reaching the first input by more than 100ms.

### Requirement 17: UX Polish — Parallax Scroll Effects

**User Story:** As a Public_Visitor, I want the home page hero and key section cards to have a subtle parallax effect, so that the page feels more dynamic.

#### Acceptance Criteria

1. WHILE the Public_Visitor scrolls the home page, THE System SHALL translate the hero background layer at a rate between 0.2x and 0.5x of the scroll delta to produce a parallax effect.
2. WHILE the Public_Visitor scrolls the home page, THE System SHALL translate at most three section-card decorative layers at a rate between 0.05x and 0.2x of the scroll delta.
3. THE System SHALL implement the parallax effect using a single `IntersectionObserver` plus a throttled (`requestAnimationFrame`) scroll handler, and SHALL NOT introduce any new dependency.
4. THE System SHALL respect the `prefers-reduced-motion: reduce` media query AND SHALL disable all parallax translation when that preference is set.
5. THE System SHALL NOT apply parallax effects to text content that the visitor must read (paragraphs, table cells, form labels).
6. WHEN the viewport width is below the Tailwind `md` breakpoint, THE System SHALL disable parallax translation to avoid layout jitter on small devices.

### Requirement 18: Accessibility and Visual Continuity

**User Story:** As a Public_Visitor using assistive technology or a keyboard, I want the new gating, animations, and admin surfaces to remain accessible and to look like the rest of the site.

#### Acceptance Criteria

1. WHEN a price is rendered with the blur filter, THE System SHALL set `aria-hidden="true"` on the blurred span AND SHALL provide a visually-hidden replacement text such as "Indicative rate hidden. Submit the lead form to view." for screen reader users.
2. WHEN a freight-rate cell is rendered with the "***" mask, THE System SHALL set the cell's `aria-label` to "Locked, submit lead form to view".
3. THE Lead_Capture_Form dialog SHALL trap focus inside the dialog when open, return focus to the triggering button when closed, and label every field via the existing shadcn `Label` component.
4. THE Admin_Panel forms (Edit Row, Add Row dialogs for each Editable_Dataset) SHALL meet the same focus-trap and label-association rules.
5. THE System SHALL preserve the existing color tokens (`navy`, `accent`, `secondary`, etc.) and SHALL NOT introduce new contrast ratios below WCAG AA for normal text.
6. THE System SHALL preserve the existing typography classes (`font-display`, `font-mono`) on every surface modified by this spec.

## Non-Functional Requirements

### NFR-1: Free-Tier-Only Hosting Constraint

1. THE System SHALL run end-to-end on free-tier infrastructure for v1: a static SPA build hosted on a free static host (e.g., the existing Cloudflare setup, GitHub Pages, or Netlify free tier) AND the EmailJS free tier for lead delivery.
2. THE System SHALL NOT introduce any dependency on a paid database, paid authentication provider, paid serverless platform, or paid storage tier.
3. WHERE the owner later chooses to upgrade beyond the free tier, THE System SHALL be structured so that swapping the localStorage-backed `useEditableDataset` and the `useAdminAuth` hooks for Supabase free tier (or Cloudflare D1 + Workers KV via the already-installed `@cloudflare/vite-plugin`) requires only those two hook implementations to change. This is an architectural seam, not a v1 deliverable.

### NFR-2: Persistence Honesty

1. THE System SHALL prominently disclose in the Admin_Panel (Requirement 14) that admin edits persist only in the editing browser until the owner exports the JSON and commits it back to the repository.
2. THE System SHALL prominently disclose in the Admin_Panel "Leads" tab that Leads are visible on the Admin_User's browser only when EmailJS delivery is the canonical record. The localStorage Lead_Store is a convenience cache, not a system of record.
3. WHEN the Admin_User accesses the Admin_Panel for the first time on a new device, THE System SHALL display a one-time toast explaining that historical Leads from other devices will not appear here unless they were imported via "Import JSON".

### NFR-3: SPA-Only Auth Security Caveats

1. THE System SHALL document in the repository README that the admin login is a client-side check inside a SPA AND that any client-side check can be bypassed by an attacker who can edit JavaScript in their own browser; the boundary that actually protects data is the absence of a writable backend, not the login form.
2. THE System SHALL document that the Credential_Hash and the EmailJS public key are visible in the shipped JS bundle, that this is acceptable for these specific values (a bcryptjs hash is not a credential, and the EmailJS public key is designed to be public), AND that any future backend secret (PAT, Supabase service key) MUST NOT be added as a `VITE_*` variable.
3. THE System SHALL set the bcryptjs cost factor to 10 rounds, balancing cracking cost against the latency of running bcryptjs in the browser.
4. THE System SHALL NOT log the entered password, the hash, or the session token to the browser console under any code path.
5. THE System SHALL store the Admin_Session in localStorage with an explicit `expiresAt` (Requirement 9) rather than relying on session-cookie semantics, because no backend issues cookies.
6. THE System SHALL set a `Content-Security-Policy` meta tag (or hosting-level header where supported) that disables inline script execution for any host that supports it; on Cloudflare Pages this SHALL be configured via `_headers` if the project ships there.

### NFR-4: Accessibility Continuity

1. THE System SHALL preserve the WCAG AA contrast ratios of every shadcn component currently in use.
2. THE System SHALL keep the keyboard tab order logical on every modified surface (FreightEstimator, Freight_Rates_Page, Lead_Capture_Form, Admin_Panel tabs).
3. THE System SHALL respect `prefers-reduced-motion: reduce` for every animation introduced by Requirements 16 and 17.
4. THE System SHALL ensure that every new interactive control (unlock buttons, source filter, edit/add/remove buttons) has a visible focus ring matching the existing shadcn `focus-visible` style.

### NFR-5: Performance and Bundle Size

1. THE System SHALL keep the production bundle (excluding lazy chunks) within +20% of the current size after this work, measured by `vite build` output.
2. THE System SHALL load the EmailJS browser SDK lazily (dynamic `import()`) only when the Lead_Capture_Form is opened or when the Get Quote form is submitted, so that the home page does not pay the SDK cost up front.
3. THE System SHALL load `bcryptjs` only on the `/login` route (dynamic `import()` inside the route component), so the public site does not ship the hashing library.

### NFR-6: Configuration and Environment

1. THE System SHALL document in the repository README the four required Vite environment variables: `VITE_EMAILJS_SERVICE_ID`, `VITE_EMAILJS_TEMPLATE_ID`, `VITE_EMAILJS_PUBLIC_KEY`, and the optional pair `VITE_ADMIN_EMAIL` / `VITE_ADMIN_PASSWORD_HASH`.
2. THE System SHALL ship a `.env.example` file enumerating the same variables with placeholder values, and SHALL NOT commit a real `.env`.
3. WHERE no EmailJS variables are configured, THE System SHALL still build and run, falling back to the Lead_Store-only behavior described in Requirement 3 acceptance criterion 5.

### NFR-7: Testability

1. THE System SHALL expose the lead-gating logic, the Editable_Dataset hooks, and the auth hook as pure-ish modules with explicit dependencies (a `Storage` interface for localStorage and a `now: () => number` function), so that they are unit-testable without a browser.
2. THE System SHALL keep the EmailJS adapter behind an interface (`sendLead(payload): Promise<void>`) so that tests can substitute a fake adapter.
3. THE System SHALL be exercisable end-to-end via `vite build && vite preview` without any external service available, in which case lead submissions SHALL fall back to the Lead_Store-only path described in Requirement 3 acceptance criterion 5.
