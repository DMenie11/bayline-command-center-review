# BayLine Shared Review Preview

This workspace is now shaped as a protected Next.js App Router review build for Vercel. It replaces the browser-only localStorage prototype with Clerk-backed sign-in, Neon/Postgres shared storage through Drizzle, server-side role checks, customer-safe report responses, and admin-only internal exports.

The original static prototype is preserved in `prototype-static/` for reference and later JSON import testing.

## What Reviewers Will Use

- One Vercel preview URL.
- Vercel deployment protection in front of the preview.
- Clerk invite-only sign-in inside the app.
- A blank shared database by default. No demo data auto-loads.
- Mixed reviewer roles:
  - `admin`: full review access, role assignment, internal rates, margin, exports.
  - `operator`: can create and edit operational WMS/TMS records.
  - `viewer`: read-only internal review access.
  - `customer`: read-only portal access scoped to assigned customer records.

Customer users are filtered on the server. They do not receive carrier costs, carrier rate IDs, client markup fields, margin, or internal notes in customer report responses.

## Required Environment Variables

Set these in Vercel for Preview and Production before deploying:

```text
DATABASE_URL=
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
INITIAL_ADMIN_EMAILS=owner@example.com,ops@example.com
```

Optional later:

```text
BLOB_READ_WRITE_TOKEN=
NEXT_PUBLIC_MAPBOX_TOKEN=
UPS_CLIENT_ID=
UPS_CLIENT_SECRET=
FEDEX_CLIENT_ID=
FEDEX_CLIENT_SECRET=
USPS_CLIENT_ID=
USPS_CLIENT_SECRET=
```

## First Deployment Checklist

1. Create or link a Vercel project from this folder.
2. Provision Clerk and Neon/Postgres, preferably through Vercel Marketplace so environment variables sync automatically.
3. Add `INITIAL_ADMIN_EMAILS` with the first admin reviewer email address.
4. Run the Drizzle migration against the preview database.
5. Deploy a Vercel preview.
6. Enable Vercel deployment protection on the preview URL.
7. Invite reviewers through Clerk.
8. Have the first admin sign in, then use the Admin tab to assign reviewer roles and customer/warehouse scope.

## GitHub + Vercel Preview Route

Use this route when the local machine does not have `git`, `npm`, or the Vercel CLI available:

1. Create a GitHub repository named `bayline-command-center-review`.
2. Upload the project files from this workspace, excluding anything matched by `.gitignore`.
3. Import that GitHub repository into Vercel as `bayline-command-center-review`.
4. Add Neon/Postgres and Clerk from Vercel Marketplace to the same project.
5. Confirm the Vercel build command is `npm run vercel-build`; this runs Drizzle schema push before `next build`.
6. Set `INITIAL_ADMIN_EMAILS` to the Vercel account email that will sign in first.
7. Deploy a Preview deployment from the `main` branch and enable Deployment Protection before sending the URL to reviewers.

## Local Commands

```bash
npm install
npm run db:generate
npm run db:migrate
npm run db:push
npm run typecheck
npm run lint
npm run build
npm run dev
```

## Data Import

The shared review environment starts blank. Admins can later POST an exported local prototype JSON file to:

```text
/api/import/local-json
```

The importer currently handles warehouses, customers, TMS carriers, and basic TMS loads. It writes an audit log entry and preserves the blank-by-default behavior for normal review previews.

## Protected Routes And Exports

- App routes and API routes require Clerk auth through middleware.
- `/api/admin/export` requires `admin` role and includes internal carrier cost and margin fields.
- `/api/customer/reports` returns customer-safe TMS load data with internal fields removed.
- User profiles are created on first sign-in as `viewer`, unless the email matches `INITIAL_ADMIN_EMAILS`.

## Reviewer Feedback Checklist

- Can the reviewer sign in and reach the shared command center?
- Does the workspace start blank?
- Can an admin create the first warehouse, customer, SKU, bay, WMS shipment, carrier, rate, and load?
- Can an admin assign operator, viewer, and customer roles?
- Can an operator create operational records without seeing admin exports?
- Can a customer reviewer see only their customer portal data?
- Do customer report responses hide carrier costs, markup, margin, and internal notes?
- Do multiple reviewers see the same records after refresh?
