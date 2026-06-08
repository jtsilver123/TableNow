import Link from "next/link";
import { LinkButton } from "@/components/ui/button";
import { Leader } from "@/components/ui/leader";
import { Logo } from "@/components/ui/logo";
import { PlatformLogo } from "@/components/ui/platform-logo";
import { ProductPreview } from "@/components/landing/product-preview";
import { CREDIT_COPY } from "@/lib/credits";
import type { Platform } from "@/lib/types";

const HOW_IT_WORKS = [
  { n: "01", title: "Create your request", body: "Tell us the restaurant, party size, and the nights that work." },
  { n: "02", title: "Connect Resy or OpenTable", body: "We book using your own profile — never a fake account." },
  { n: "03", title: "We monitor availability", body: "Our concierge watches the books quietly, around the clock." },
  { n: "04", title: "We auto-book when a table opens", body: "The moment a matching table appears, it's yours." },
  { n: "05", title: "You only use a credit when we succeed", body: "No table, no charge. It's that simple." },
];

const EXAMPLES: { name: string; platform: Platform; detail: string; hood: string }[] = [
  { name: "Don Angie", platform: "resy", detail: "2 guests · Friday · 7:00–9:00 PM", hood: "West Village" },
  { name: "Tatiana", platform: "resy", detail: "2 guests · any weekday next week", hood: "Lincoln Center" },
  { name: "Cote", platform: "opentable", detail: "4 guests · Saturday dinner", hood: "Flatiron" },
  { name: "Lilia", platform: "resy", detail: "2 guests · this weekend", hood: "Williamsburg" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-line/70 bg-ivory-100/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
          <Logo />
          <nav className="hidden items-center gap-8 text-sm text-ink-600 md:flex">
            <a href="#how" className="transition hover:text-ink-900">How it works</a>
            <a href="#credits" className="transition hover:text-ink-900">Credits</a>
            <a href="#concierge" className="transition hover:text-ink-900">Concierge</a>
            <a href="#trust" className="transition hover:text-ink-900">Trust</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/login" className="hidden text-sm text-ink-600 transition hover:text-ink-900 sm:block">
              Sign in
            </Link>
            <LinkButton href="/signup" size="sm">Get started</LinkButton>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-6xl px-5 pb-20 pt-20 text-center sm:px-8 sm:pt-28">
          <p className="eyebrow mb-6 animate-fade-in">A private dining concierge</p>
          <h1 className="mx-auto max-w-4xl text-display animate-fade-up">
            Hard-to-get reservations, <span className="italic text-sage-600">handled.</span>
          </h1>
          <p className="mx-auto mt-7 max-w-2xl text-lg leading-relaxed text-ink-600">
            Tell us where you want to go, connect your Resy or OpenTable account, and we&apos;ll
            automatically book when a table opens. Your first successful reservation is free.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <LinkButton href="/signup" size="lg">Get your first booking free</LinkButton>
            <LinkButton href="#how" variant="secondary" size="lg">See how it works</LinkButton>
          </div>
          <p className="mt-6 text-[13px] text-ink-400">{CREDIT_COPY}</p>
        </div>

        {/* Product preview — a look at the in-app queue */}
        <div className="mx-auto -mb-16 max-w-5xl px-5 sm:px-8">
          <p className="mb-4 text-center text-[12px] uppercase tracking-label text-ink-400">
            A look inside
          </p>
          <div className="animate-fade-up">
            <ProductPreview />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="border-t border-line bg-ivory-50/60 pt-24">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="mb-14 text-center">
            <p className="eyebrow mb-3">How it works</p>
            <h2 className="text-4xl sm:text-5xl">Five quiet steps to the table</h2>
          </div>
          <ol className="mx-auto max-w-3xl divide-y divide-line">
            {HOW_IT_WORKS.map((step) => (
              <li key={step.n} className="flex gap-6 py-7">
                <span className="font-serif text-2xl text-sage-400">{step.n}</span>
                <div>
                  <h3 className="text-xl">{step.title}</h3>
                  <p className="mt-1 text-ink-600">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
        <div className="h-24" />
      </section>

      {/* Credits */}
      <section id="credits" className="border-t border-line py-24">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 sm:px-8 md:grid-cols-2">
          <div>
            <p className="eyebrow mb-3">Credits</p>
            <h2 className="text-4xl sm:text-5xl">One credit equals one successful reservation.</h2>
            <p className="mt-5 max-w-md text-lg text-ink-600">
              No subscriptions, no surprises. You hold credits, and we only ever spend one when a
              table is confirmed in your name.
            </p>
            <LinkButton href="/signup" className="mt-8">Start with a free booking</LinkButton>
          </div>
          <div className="card-surface p-7">
            <p className="eyebrow mb-4">The rules, plainly</p>
            <Leader label="New members" value="1 free credit" emphasis />
            <Leader label="First booking" value="Always free" emphasis />
            <Leader label="Failed attempt" value="0 credits" />
            <Leader label="Paused or expired" value="0 credits" />
            <Leader label="Successful booking" value="1 credit" emphasis />
            <hr className="rule my-4" />
            <p className="text-sm text-ink-500">{CREDIT_COPY}</p>
          </div>
        </div>
      </section>

      {/* Concierge */}
      <section id="concierge" className="border-t border-line bg-ivory-50/60 py-24">
        <div className="mx-auto max-w-3xl px-5 text-center sm:px-8">
          <p className="eyebrow mb-3">Concierge</p>
          <h2 className="text-4xl sm:text-5xl">Describe the table you want.</h2>
          <p className="mx-auto mt-5 max-w-xl text-lg text-ink-600">
            We&apos;ll turn it into an auto-booking request. Just tell us in plain words.
          </p>
          <div className="mx-auto mt-10 max-w-lg space-y-3 text-left">
            <div className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-sm bg-sage-500 px-4 py-2.5 text-sm text-ivory-50">
              Book me Don Angie for 2 next Friday after 7.
            </div>
            <div className="w-fit max-w-[90%] rounded-2xl rounded-bl-sm border border-line bg-ivory-50 px-4 py-3 text-sm text-ink-700 shadow-card">
              Here&apos;s your request — <span className="font-medium text-ink-900">Don Angie, 2 guests, Friday 7:00–9:00 PM, on Resy.</span> Add it to your queue whenever you&apos;re ready.
            </div>
          </div>
        </div>
      </section>

      {/* Trust */}
      <section id="trust" className="border-t border-line py-24">
        <div className="mx-auto max-w-4xl px-5 text-center sm:px-8">
          <p className="eyebrow mb-3">Trust</p>
          <h2 className="text-4xl sm:text-5xl">No resale. No fake accounts.</h2>
          <p className="mt-4 text-xl text-ink-600">No credit used unless we book.</p>
          <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-line bg-line text-left sm:grid-cols-3">
            {[
              { t: "Your own account", b: "We book using your connected Resy or OpenTable profile — never a fake one." },
              { t: "Only what you ask", b: "We never book a reservation you didn't request, and you can pause anytime." },
              { t: "Honest billing", b: "A credit is consumed only when a booking is confirmed. Every attempt is logged." },
            ].map((item) => (
              <div key={item.t} className="bg-ivory-50 p-6">
                <h3 className="text-lg">{item.t}</h3>
                <p className="mt-2 text-sm text-ink-600">{item.b}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Example requests */}
      <section className="border-t border-line bg-ivory-50/60 py-24">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="mb-12 text-center">
            <p className="eyebrow mb-3">Example requests</p>
            <h2 className="text-4xl sm:text-5xl">Tables our members are after</h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {EXAMPLES.map((ex) => (
              <div key={ex.name} className="card-surface flex flex-col p-6 transition hover:-translate-y-0.5 hover:shadow-float">
                <div className="mb-3 flex items-center justify-between">
                  <PlatformLogo platform={ex.platform} className="text-sm" />
                  <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-sage-500" />
                </div>
                <h3 className="font-serif text-2xl">{ex.name}</h3>
                <p className="text-sm text-ink-400">{ex.hood}</p>
                <hr className="rule my-4" />
                <p className="mt-auto text-sm text-ink-600">{ex.detail}</p>
              </div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <LinkButton href="/signup" size="lg">Get your first booking free</LinkButton>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-line py-12">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-5 sm:flex-row sm:px-8">
          <Logo />
          <p className="text-center text-sm text-ink-400">
            A compliant reservation concierge. We never resell tables or create fake accounts.
          </p>
          <div className="flex gap-6 text-sm text-ink-500">
            <Link href="/login" className="transition hover:text-ink-900">Sign in</Link>
            <Link href="/signup" className="transition hover:text-ink-900">Get started</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
