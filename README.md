# HMS Pro — Hostel Management System

A responsive React + TypeScript + Vite application backed by Supabase Auth and PostgreSQL.

## Included in this release

- Email/password signup and login with persistent sessions.
- Google OAuth sign-in initiation (requires provider credentials in Supabase/Google Cloud).
- First-run hostel onboarding; creator is assigned Owner through the secure `create_hostel` RPC.
- Multi-tenant hostel membership lookup and database row-level security.
- Profile page with editable display name and account email.
- Persistent light/dark theme preference.
- Residents: live list, search, add, edit, delete, room assignment and full-room validation.
- Rooms: live occupancy, create, edit, delete and capacity constraints in the UI.
- Meals: daily per-resident register with date stepper, bulk "all breakfast/lunch/dinner" actions and month navigation.
- Daily bazar ledger (food purchases) with categories, filters and CSV export.
- Meal advances ledger (bKash / Nagad / cash / bank) credited against each resident's charge.
- Meal settlement: automatic meal rate, per-resident statements, totals due/credit, CSV export and print-ready statement.
- Daily-cost analytics: daily average, month-end projection, food vs living split, category breakdown, configurable currency.
- Finance: income/expense ledger with create, edit, delete and live totals.
- Inventory: item register with quantity, unit, reorder threshold, create, edit and delete.
- Overview uses live resident, room and transaction data; empty states are shown instead of fake demo figures.
- Responsive desktop/mobile navigation, keyboard focus states, polished typography and form feedback.


## Changelog — v1.2.0

**Fixed**
- Bazar, Advances and Settlement pages were in the menu but never rendered, so their buttons did nothing. `App.tsx` now loads and saves bazar and advance records and renders all three pages.
- Meals date picker, previous/next-day buttons and the meal "Served" buttons now work: the month, role and bulk-save handlers they depend on were missing.
- Top bar month picker works on Overview, Meals, Bazar, Advances and Settlement.
- Overview shows the live meal rate from the settlement engine.
- Finance "Add transaction" no longer defaults to yesterday's date in Bangladesh before 6 AM (it used UTC; it now uses the local date).
- Removed the misleading "vs last month" text from Overview cards.
- `npm run typecheck` is clean again (it had 3 errors).

**Added**
- Live date and time in the top bar, a time-of-day greeting on Overview, and a "Date & time" column showing when each bazar purchase and advance payment was recorded.
- Modals close with Esc and focus the first field.
- New visual theme (`src/theme-pro.css`): bottle-green and turmeric palette, larger readable type, pill-style meal buttons, refined light and dark modes, responsive layout.

## Requirements

- Node.js 20 or later recommended
- npm
- Supabase project with the HMS Pro schema/migrations deployed

## Local setup

```bash
npm install
```

Copy `.env.example` to `.env.local` and set (use your own project values):


Never put a Supabase secret/service-role key in a browser app.

Start development:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

## Google OAuth setup (required to activate the Google button)

1. Open Google Cloud Console and create an OAuth client ID for a Web application.
2. In Supabase Dashboard → Authentication → Providers → Google, enable Google and enter the Google Client ID and Client Secret.
3. Copy the Supabase callback URL displayed on the Google provider settings screen into Google's Authorized redirect URIs.
4. In Supabase Authentication → URL Configuration, set the Site URL and add `http://localhost:5173` plus your deployed application URL to Additional Redirect URLs.
5. Save and test in a private browser window.

The app calls `supabase.auth.signInWithOAuth({ provider: 'google' })`. OAuth will not complete until the provider credentials and redirect URLs are configured in Supabase.

## Database changes made for this release

- `inventory_items` table with RLS enabled and four member/manager policies.
- Unique index for one meal record per hostel/resident/date.
- Unique case-insensitive room code per hostel.

The initial schema includes `hostels`, `hostel_members`, `rooms`, `residents`, `meal_entries`, and `transactions`, with role-based RLS. Do not run obsolete draft SQL from older ZIPs against the live project.

## Meal costing rule

For a selected billing month: **meal rate = daily bazar (food) cost ÷ total meals served** (breakfast + lunch + dinner).
**Resident charge = resident meals × meal rate.** Advances are credited: **balance = advances − charge** (negative = owes, positive = credit).
Rent, utilities and other living costs live in Finance and are never part of the meal-rate numerator. The logic is a pure, unit-tested module: `src/lib/mealMath.ts`.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite dev server |
| `npm run typecheck` | Strict TypeScript check |
| `npm test` | Run the Vitest unit suite (meal-rate engine, date helpers, CSV safety) |
| `npm run build` | Typecheck + production build |

## Quality

- Strict TypeScript, typed Supabase client, row-level security on every table, role checks in the UI that mirror database policies.
- 15 unit tests cover rate calculation, advances/balances, empty months, period boundaries, projections, leap years and CSV formula-injection.
- Manual QA scenarios and a multi-tenant RLS test matrix are in `docs/TEST_PLAN.md`.

## Roadmap

Invitation links / member administration, period close with locked entries, carry-forward balances between months, profile photos, audit log, automated end-to-end tests (Playwright).
=======
# HMS Pro – Smart Hostel & Mess Meal Management System

**Manage Your Meals. Track Your Expenses. Stay Financially Organized.**

HMS Pro is a smart, reliable, and user-friendly web application designed especially for bachelor students, hostel residents, and people living in shared mess accommodations.

Managing daily meal expenses, grocery costs, and monthly bills among multiple residents can be complicated. HMS Pro simplifies this entire process through an organized digital platform.

### Key Features

- **Daily Meal Management:** Track daily breakfast, lunch, and dinner consumption.
- **Automatic Meal Rate Calculation:** Calculate the daily meal rate based on total expenses and meal consumption.
- **Expense Tracking:** Record grocery purchases, food expenses, and other shared costs.
- **Individual Cost Breakdown:** Monitor each member's personal expenses, meal consumption, and outstanding balance.
- **Monthly Financial Reports:** Generate detailed monthly expense summaries and financial statements.
- **PDF Bill Generation:** Download professional monthly bills and individual financial reports in PDF format.
- **Member Management:** Manage mess members, contributions, payments, and balances.
- **Financial Transparency:** Keep every transaction organized so members can understand exactly where their money goes.

### Our Mission

Our mission is to make bachelor life and shared accommodation management easier by replacing complicated manual calculations and paper-based accounting with a smarter, more transparent, and reliable digital solution.

**HMS Pro – Making Bachelor Life Financially Smarter!**
