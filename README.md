# TableNow

**Hard-to-get reservations, handled.** A premium auto-booking concierge that
monitors Resy and OpenTable and books a table the moment a match opens — using
your own connected account. One credit equals one successful reservation, and a
credit is only ever used when we successfully book.

> Auto-booking only. No alerts-only mode, no resale, no fake accounts, no
> marketplace. A compliant, platform-aware product that feels like a private
> dining concierge.

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
app never branches on Resy vs OpenTable, so approved real integrations can drop
in later without touching the UI or the workflow.

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
4. **Resend** — add your API key and a verified from-address.

## Trust & compliance

- Books only with the user's **own** connected account.
- Never resells reservations or creates fake accounts.
- Never books a reservation the user didn't request.
- **Never consumes a credit unless a booking is confirmed.**
- Booking success is not guaranteed, and that's disclosed plainly.
- Users can pause or cancel any request; every attempt is kept in an audit
  trail (`booking_attempts`).
