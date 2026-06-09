# TableNow

**Be first to the table.** A premium table-availability alert service that
watches Resy and OpenTable for the restaurants you want — with a far wider net
than their native search allows (date ranges, broad time windows, flexible
party sizes) — and alerts you the moment a table opens. **You book it yourself
in one tap** via a deep link to the platform's booking page.

> Alert-and-notify only. We never book on your behalf, never touch your login,
> never resell tables, and never create fake accounts. You stay in control.

**Plans:** Free (up to 3 active watches) and Premium ($19/mo — unlimited
watches, faster checks, widest flexibility).

---

## Run it locally

```bash
npm install
npm run dev
# open http://localhost:3000
```

That's it — **the whole app runs out of the box with no backend or accounts.**
It uses a realistic in-browser demo store seeded with sample requests, bookings,
and credits, and a simulated booking engine so you can watch a request go from
**Searching → Booked**.

- **Sign up** to experience a fresh account (1 free credit, first booking free).
- **Sign in** to drop into a populated sample account.

## What's built

All 13 MVP screens:

1. Landing page · 2. Sign up / sign in · 3. Onboarding · 4. Queue dashboard ·
5. Add-request modal · 6. Request detail drawer · 7. Calendar · 8. Concierge
panel · 9. Credits · 10. Connections · 11. Settings · 12. Empty states ·
13. Success / failure states.

## Tech stack

| Layer | Choice |
| --- | --- |
| App | Next.js (App Router) · React · TypeScript |
| Styling | Tailwind CSS — warm ivory / sage / charcoal menu-inspired design system |
| State (demo) | Zustand store that simulates the backend |
| Database + Auth | **Supabase** (Postgres + Auth) — see [`supabase/schema.sql`](supabase/schema.sql) |
| Hosting | **Vercel** |
| Payments | **Stripe** (credit packages) — stubbed until keys are added |
| Email | **Resend** (transactional) — stubbed until keys are added |

The booking rules (credits, status, the booking workflow, and the platform
adapters) live in [`src/lib`](src/lib) as pure, framework-agnostic logic, so the
demo store and the live Supabase backend run **identical rules**.

### Platform adapters

`src/lib/adapters` defines a shared `PlatformAdapter` interface with
`MockResyAdapter` and `MockOpenTableAdapter`. They simulate every scenario — no
availability, a match, a successful booking, a failed booking, a disconnected
account, an unavailable restaurant, and a time-window mismatch. The rest of the
app never branches on Resy vs OpenTable.

When `NEXT_PUBLIC_USE_LIVE_AVAILABILITY=true`, the registry swaps in
`LiveAvailabilityAdapter`. It calls the authenticated
`supabase/functions/check-availability` gateway, which keeps provider
credentials off the static GitHub Pages frontend and normalizes live slots into
the same adapter contract.

## Live provider availability

Live checks require a stable provider restaurant ID on every watch:

- OpenTable: the restaurant RID supplied through the approved partner integration.
- Resy: the venue ID supplied through an approved Resy partner integration.

### OpenTable

OpenTable provides a documented OAuth 2.0 partner API and a real-time Single
Search Availability API. Production access requires OpenTable approval and a
signed agreement. Once approved:

1. Set the Edge Function secrets `OPENTABLE_CLIENT_ID`,
   `OPENTABLE_CLIENT_SECRET`, and the partner-provided
   `OPENTABLE_API_BASE_URL`.
2. Optionally set `OPENTABLE_OAUTH_BASE_URL` and `OPENTABLE_REFERRAL_ID`.
3. Add the restaurant RID when creating each live watch.

See the [OpenTable API documentation](https://docs.opentable.com/) and
[partner application](https://www.opentable.com/restaurant-solutions/api-partners/become-a-partner/).

### Resy

Resy does not publish a public diner availability API, and its terms prohibit
automated crawling and scraping. TableNow therefore does not call
reverse-engineered Resy endpoints. Configure `RESY_PARTNER_AVAILABILITY_URL`
and, when required, `RESY_PARTNER_API_TOKEN` only after receiving an approved
partner endpoint. That endpoint should accept the watch request and return the
normalized `AvailabilityResult` shape from `src/lib/adapters/types.ts`.

```json
{
  "available": true,
  "slots": [
    {
      "date": "2026-06-12",
      "time": "19:30",
      "seating": "dining room",
      "partySize": 2,
      "bookUrl": "https://resy.com/..."
    }
  ],
  "reason": "match_found"
}
```

See [Resy's Terms of Service](https://resy.com/terms).

### Deploy the gateway

```bash
supabase link --project-ref your-project-id
supabase secrets set --env-file ./supabase/functions/.env
supabase functions deploy check-availability
```

Then configure the GitHub repository variables
`NEXT_PUBLIC_USE_SUPABASE=true`, `NEXT_PUBLIC_SUPABASE_URL`, and
`NEXT_PUBLIC_USE_LIVE_AVAILABILITY=true`. Set `NEXT_PUBLIC_APP_URL` to the
deployed site URL for OAuth redirects, and add the
`NEXT_PUBLIC_SUPABASE_ANON_KEY` repository secret. Live calls require a signed-in
Supabase user by default; `ALLOW_ANONYMOUS_AVAILABILITY=true` exists only for
local testing.

## Going live (when you're ready — ~10 minutes of your time)

Nothing below is needed to use the app; it's for making it persistent and
public. See [`.env.example`](.env.example) for every variable.

1. **Supabase** — create a free project, run [`supabase/schema.sql`](supabase/schema.sql)
   in the SQL editor, then set `NEXT_PUBLIC_USE_SUPABASE=true` plus the URL and
   keys. The schema includes Row Level Security and an atomic
   `book_reservation()` function that confirms a booking and consumes exactly
   one credit in a single transaction (no double-booking, no double-charge).
2. **Vercel** — import the repo, add the same env vars, deploy.
3. **Stripe** — add your keys + the four credit-package price IDs.
4. **Live availability** — deploy `check-availability`, set approved provider
   credentials, and enable `NEXT_PUBLIC_USE_LIVE_AVAILABILITY`.
5. **Resend** — add your API key and a verified from-address.

## Trust & compliance

- Books only with the user's **own** connected account.
- Never resells reservations or creates fake accounts.
- Never books a reservation the user didn't request.
- **Never consumes a credit unless a booking is confirmed.**
- Booking success is not guaranteed, and that's disclosed plainly.
- Users can pause or cancel any request; every attempt is kept in an audit
  trail (`booking_attempts`).
