# HMS Pro — Test Plan

## 1. Automated (Vitest) — `npm test`
Meal rate, charges, advances/balances, no-meals month, period filtering, inactive residents, projections, leap years, CSV escaping & formula-injection guard.

## 2. Manual functional cases
| ID | Area | Steps | Expected |
| --- | --- | --- | --- |
| M-01 | Meals | Open Meals, toggle Lunch for a resident | Row saves, total shows 1 / 3, no duplicate row on refresh |
| M-02 | Meals | Click "All dinner" | Every active resident marked, one record per resident/date |
| M-03 | Meals | Step to previous day, then back | Correct day's data loads; cannot pick a future date |
| M-04 | Meals | Mark a resident Inactive | Resident disappears from the register, past meals remain in Settlement |
| B-01 | Bazar | Add purchase with quantity 0 or amount 0 | Validation error, nothing saved |
| B-02 | Bazar | Add, edit, delete purchase | Ledger and Settlement meal rate update immediately |
| B-03 | Bazar | Export CSV | File opens in Excel with Bangla text intact; text cells starting with `=` are prefixed with `'` |
| A-01 | Advances | Record payment for resident | Appears in ledger; balance in Settlement increases by amount |
| S-01 | Settlement | Month with bazar but no meals | Warning banner, rate shows "—", no divide-by-zero |
| S-02 | Settlement | Bazar 1000, 5 meals | Rate 200.00; resident with 3 meals charged 600.00 |
| S-03 | Settlement | Change month with the top bar | All pages reload for that month; next-month arrow disabled for current month |
| S-04 | Settlement | Print statement | Sidebar/topbar hidden, table readable in black & white |
| F-01 | Finance | Add Rent expense | Appears in "living costs"; meal rate unchanged |
| X-01 | Settings | Switch currency to USD | Every amount re-renders in USD after reload |
| U-01 | UI | Mobile width 375px, light/dark | No horizontal page scroll; tables scroll inside their panel; contrast readable |

## 3. Security / multi-tenant (use two accounts, two hostels)
| ID | Check | Expected |
| --- | --- | --- |
| R-01 | User B queries hostel A's `daily_bazar` via the API | 0 rows |
| R-02 | User B inserts `meal_advances` with hostel A's id | Rejected by RLS |
| R-03 | `resident` role tries to insert/delete bazar | Rejected; UI hides the buttons |
| R-04 | `accountant` role deletes a bazar row | Rejected (delete is owner/manager only) |
| R-05 | Resident id from another hostel in an advance | Rejected by composite foreign key |
| R-06 | Service-role key present in the bundle? | Must not be (only the publishable key is used) |

## 4. Known gaps (tracked)
Period close/locking, member invitations, Playwright E2E suite.
