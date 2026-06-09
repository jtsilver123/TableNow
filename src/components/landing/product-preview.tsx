import { Logo } from "@/components/ui/logo";
import { PlatformLogo } from "@/components/ui/platform-logo";
import {
  CalendarIcon,
  ConciergeIcon,
  ConnectionIcon,
  CreditIcon,
  QueueIcon,
  SettingsIcon,
} from "@/components/icons";

/**
 * Static, editorial mockup of the in-app queue — shown on the landing page so
 * visitors can see what the product looks like before signing up. Purely
 * presentational; mirrors the real dashboard layout.
 */
const MINI_CARDS = [
  { name: "Don Angie", hood: "West Village", platform: "resy" as const, meta: "2 guests · Fri · 7–9 PM", status: "Watching", tone: "active" as const },
  { name: "Tatiana", hood: "Lincoln Center", platform: "resy" as const, meta: "2 guests · any night next week", status: "Watching", tone: "active" as const },
  { name: "Carbone", hood: "Greenwich Village", platform: "resy" as const, meta: "2 guests · Sat · 8 PM", status: "Table found", tone: "success" as const },
];

const NAV = [QueueIcon, CalendarIcon, CreditIcon, ConnectionIcon, SettingsIcon];

export function ProductPreview() {
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-ivory-50 shadow-float">
      {/* Browser chrome */}
      <div className="flex items-center gap-2 border-b border-line bg-ivory-100 px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-clay-200" />
        <span className="h-2.5 w-2.5 rounded-full bg-ivory-300" />
        <span className="h-2.5 w-2.5 rounded-full bg-sage-200" />
        <div className="ml-3 hidden flex-1 rounded-md bg-ivory-50 px-3 py-1 text-[11px] text-ink-400 ring-1 ring-line sm:block">
          app.tablenow.co/queue
        </div>
      </div>

      <div className="flex">
        {/* Mini sidebar */}
        <aside className="hidden w-44 flex-none flex-col border-r border-line bg-ivory-50/70 p-4 md:flex">
          <Logo />
          <div className="mt-6 space-y-1">
            {NAV.map((Icon, i) => (
              <div
                key={i}
                className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[12px] ${
                  i === 0 ? "bg-ivory-50 font-medium text-ink-900 ring-1 ring-line" : "text-ink-400"
                }`}
              >
                <Icon className={`h-4 w-4 ${i === 0 ? "text-sage-600" : ""}`} />
                {["Queue", "Calendar", "Credits", "Connections", "Settings"][i]}
              </div>
            ))}
          </div>
        </aside>

        {/* Queue */}
        <div className="min-w-0 flex-1 p-4 sm:p-5">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-[11px] font-medium uppercase tracking-label text-sage-600">Your watches</p>
            <span className="rounded-full bg-sage-100 px-2 py-0.5 text-[10px] font-medium text-sage-700">Premium</span>
          </div>
          <div className="space-y-2.5">
            {MINI_CARDS.map((c) => (
              <div key={c.name} className="rounded-xl border border-line bg-ivory-50 p-3.5">
                <div className="flex items-start justify-between">
                  <div className="min-w-0">
                    <p className="font-serif text-[15px] text-ink-900">{c.name}</p>
                    <p className="flex items-center gap-1 text-[11px] text-ink-400">
                      {c.hood} · <PlatformLogo platform={c.platform} className="text-[11px]" />
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                      c.tone === "success"
                        ? "bg-sage-500 text-ivory-50"
                        : "bg-sage-100 text-sage-700"
                    }`}
                  >
                    {c.tone === "active" && <span className="h-1 w-1 animate-pulse-soft rounded-full bg-sage-500" />}
                    {c.status}
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between border-t border-line pt-2">
                  <span className="text-[11px] text-ink-500">{c.meta}</span>
                  <span className="text-[10px] text-ink-400">
                    {c.tone === "success" ? "Tap to book on Resy" : "We'll alert you"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Concierge rail */}
        <aside className="hidden w-56 flex-none flex-col border-l border-line bg-ivory-50/40 p-4 lg:flex">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-sage-100 text-sage-600">
              <ConciergeIcon className="h-4 w-4" />
            </span>
            <span className="text-[12px] font-medium text-ink-900">Concierge</span>
          </div>
          <div className="mt-4 space-y-2">
            <div className="ml-auto w-fit max-w-[90%] rounded-xl rounded-br-sm bg-sage-500 px-2.5 py-1.5 text-[11px] text-ivory-50">
              Book Don Angie for 2 next Friday after 7
            </div>
            <div className="w-fit max-w-[95%] rounded-xl rounded-bl-sm border border-line bg-ivory-50 px-2.5 py-1.5 text-[11px] text-ink-600">
              Added — Don Angie, 2 guests, Fri 7–9 PM on Resy. Watching now.
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
