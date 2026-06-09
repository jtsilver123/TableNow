import Link from "next/link";
import { LinkButton } from "@/components/ui/button";
import { Leader } from "@/components/ui/leader";
import { Logo } from "@/components/ui/logo";
import { PlatformLogo } from "@/components/ui/platform-logo";
import { ProductPreview } from "@/components/landing/product-preview";
import { ALERT_COPY, VALUE_COPY } from "@/lib/plan";
import type { Platform } from "@/lib/types";

const HOW_IT_WORKS = [
  { n: "01", title: "Set your watch", body: "Tell us the restaurant, party size, and a wide range of nights and times that work." },
  { n: "02", title: "We watch the books", body: "We monitor Resy and OpenTable availability quietly, around the clock." },
  { n: "03", title: "We alert you the second a table opens", body: "Email the instant a matching table appears — often before you'd ever catch it." },
  { n: "04", title: "You book it in one tap", body: "Our alert links straight to the booking page. You confirm it yourself, on your own account." },
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
            <a href="#flexibility" className="transition hover:text-ink-900">Flexibility</a>
            <a href="#concierge" className="transition hover:text-ink-900">Concierge</a>
            <a href="#pricing" className="transition hover:text-ink-900">Pricing</a>
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
          <p className="eyebrow mb-6 animate-fade-in">Table availability alerts</p>
          <h1 className="mx-auto max-w-4xl text-display animate-fade-up">
            Be first to the <span className="italic text-sage-600">table.</span>
          </h1>
          <p className="mx-auto mt-7 max-w-2xl text-lg leading-relaxed text-ink-600">
            We watch Resy and OpenTable for the restaurants you want — with a far wider net than
            their search allows — and alert you the moment a table opens. You book it in one tap.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <LinkButton href="/signup" size="lg">Start watching free</LinkButton>
            <LinkButton href="#how" variant="secondary" size="lg">See how it works</LinkButton>
          </div>
          <p className="mt-6 text-[13px] text-ink-400">{ALERT_COPY}</p>
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
            <h2 className="text-4xl sm:text-5xl">Four quiet steps to the table</h2>
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

      {/* Flexibility — the core value prop */}
      <section id="flexibility" className="border-t border-line py-24">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 sm:px-8 md:grid-cols-2">
          <div>
            <p className="eyebrow mb-3">Flexibility</p>
            <h2 className="text-4xl sm:text-5xl">Cast a far wider net.</h2>
            <p className="mt-5 max-w-md text-lg text-ink-600">
              {VALUE_COPY} Resy and OpenTable make you pick one date, one time, one party size.
              We watch the whole range at once — so you catch openings you&apos;d otherwise miss.
            </p>
            <LinkButton href="/signup" className="mt-8">Start watching free</LinkButton>
          </div>
          <div className="card-surface p-7">
            <p className="eyebrow mb-4">One watch can cover</p>
            <Leader label="Dates" value="A full range, not one night" emphasis />
            <Leader label="Times" value="6:00 – 9:30 PM, not one slot" emphasis />
            <Leader label="Party size" value="2 or 3, whatever opens" />
            <Leader label="Seating" value="Dining room, bar, or counter" />
            <Leader label="Restaurants" value="As many as you like" emphasis />
          </div>
        </div>
      </section>

      {/* Concierge */}
      <section id="concierge" className="border-t border-line bg-ivory-50/60 py-24">
        <div className="mx-auto max-w-3xl px-5 text-center sm:px-8">
          <p className="eyebrow mb-3">Concierge</p>
          <h2 className="text-4xl sm:text-5xl">Describe the table you want.</h2>
          <p className="mx-auto mt-5 max-w-xl text-lg text-ink-600">
            We&apos;ll turn it into a watch. Just tell us in plain words.
          </p>
          <div className="mx-auto mt-10 max-w-lg space-y-3 text-left">
            <div className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-sm bg-sage-500 px-4 py-2.5 text-sm text-ivory-50">
              Watch Don Angie for 2 next Friday after 7.
            </div>
            <div className="w-fit max-w-[90%] rounded-2xl rounded-bl-sm border border-line bg-ivory-50 px-4 py-3 text-sm text-ink-700 shadow-card">
              Watching — <span className="font-medium text-ink-900">Don Angie, 2 guests, Friday 7:00–9:00 PM, on Resy.</span> I&apos;ll alert you the second a table opens.
            </div>
          </div>
        </div>
      </section>

      {/* Trust */}
      <section id="trust" className="border-t border-line py-24">
        <div className="mx-auto max-w-4xl px-5 text-center sm:px-8">
          <p className="eyebrow mb-3">Trust</p>
          <h2 className="text-4xl sm:text-5xl">You stay in control.</h2>
          <p className="mt-4 text-xl text-ink-600">We alert. You book. Always.</p>
          <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-line bg-line text-left sm:grid-cols-3">
            {[
              { t: "We never book for you", b: "We only watch availability and notify you. You book on your own account, in one tap." },
              { t: "No fake accounts, no resale", b: "We don't touch your login, never resell tables, and never act without you." },
              { t: "Cancel anytime", b: "Pause or delete a watch whenever you like. Nothing happens you didn't ask for." },
            ].map((item) => (
              <div key={item.t} className="bg-ivory-50 p-6">
                <h3 className="text-lg">{item.t}</h3>
                <p className="mt-2 text-sm text-ink-600">{item.b}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="border-t border-line bg-ivory-50/60 py-24">
        <div className="mx-auto max-w-4xl px-5 sm:px-8">
          <div className="mb-12 text-center">
            <p className="eyebrow mb-3">Pricing</p>
            <h2 className="text-4xl sm:text-5xl">Start free. Upgrade when you&apos;re hooked.</h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="card-surface p-7">
              <p className="eyebrow mb-2">Free</p>
              <p className="font-serif text-4xl text-ink-900">$0</p>
              <hr className="rule my-5" />
              <ul className="space-y-2.5 text-sm text-ink-600">
                {["Up to 3 active watches", "Email alerts", "One-tap booking links", "Standard check frequency"].map((f) => (
                  <li key={f}>· {f}</li>
                ))}
              </ul>
              <LinkButton href="/signup" variant="secondary" className="mt-6 w-full">Start free</LinkButton>
            </div>
            <div className="card-surface p-7 ring-2 ring-sage-300">
              <p className="eyebrow mb-2">Premium · $19/mo</p>
              <p className="font-serif text-4xl text-ink-900">$19<span className="text-lg text-ink-400">/mo</span></p>
              <hr className="rule my-5" />
              <ul className="space-y-2.5 text-sm text-ink-600">
                {["Unlimited watches", "Priority, high-frequency checks", "Widest flexibility", "SMS alerts (soon)"].map((f) => (
                  <li key={f}>· {f}</li>
                ))}
              </ul>
              <LinkButton href="/signup" className="mt-6 w-full">Go Premium</LinkButton>
            </div>
          </div>
        </div>
      </section>

      {/* Example requests */}
      <section className="border-t border-line bg-ivory-50/60 py-24">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="mb-12 text-center">
            <p className="eyebrow mb-3">Example watches</p>
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
            <LinkButton href="/signup" size="lg">Start watching free</LinkButton>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-line py-12">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-5 sm:flex-row sm:px-8">
          <Logo />
          <p className="text-center text-sm text-ink-400">
            Table availability alerts. We never book on your behalf — you stay in control.
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
