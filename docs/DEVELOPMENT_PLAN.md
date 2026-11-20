# HMS Pro Development Plan

## Product goal
A multi-tenant hostel and mess management system. Every hostel is a tenant. Users may belong to one or more hostels, with a role scoped to each membership.

## Phase 1 — Foundation
- Vite + React + TypeScript
- Shared layout and navigation
- Demo dashboard and module previews
- Supabase client configuration
- Initial relational schema and RLS baseline

## Phase 2 — Identity and tenant lifecycle
- Sign up, sign in, sign out, password reset
- Create hostel via atomic database function
- Invite members through a trusted invitation flow
- No client-side role escalation
- Test tenant isolation with at least two users and two hostels

## Phase 3 — Core operations
- Residents and room assignment
- Room capacity enforcement
- Daily meal entry and editing
- Transaction ledger and audit events

## Phase 4 — Financial calculations  ✅ meal rate, statements, advances & exports shipped (period close pending)
- Monthly totals and resident balances
- Meal rate from approved shared kitchen expenses / total meals
- Clear rules for deposits, refunds, carry-forward balances, and corrections

## Phase 5 — Expansion
- Inventory and suppliers
- Maintenance complaints
- Notices and notifications
- Reports and exports
- Platform super-admin

## Quality gates
Each feature needs:
1. A defined user story and acceptance criteria
2. Input validation
3. Authorization enforced server-side / in RLS
4. Loading, empty, and error states
5. Tests for success and unauthorized access
6. Documentation
