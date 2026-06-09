"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useHydrated } from "@/components/hydrated";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { Input, Label, Segmented, Select } from "@/components/ui/field";
import { CheckIcon } from "@/components/icons";
import { RestaurantAutocomplete } from "@/components/restaurant-autocomplete";
import { cn } from "@/lib/cn";
import { useStore } from "@/lib/store";
import type { Platform, SeatingPreference } from "@/lib/types";

const STEPS = ["Welcome", "City", "Preferences", "First watch"];

export default function OnboardingPage() {
  const hydrated = useHydrated();
  const router = useRouter();
  const authed = useStore((s) => s.authed);
  const user = useStore((s) => s.user);
  const completeOnboarding = useStore((s) => s.completeOnboarding);
  const updateUser = useStore((s) => s.updateUser);
  const createRequest = useStore((s) => s.createRequest);
  const pushToast = useStore((s) => s.pushToast);

  const [step, setStep] = useState(0);
  const [city, setCity] = useState("New York");
  const [partySize, setPartySize] = useState(2);
  const [window, setWindowPref] = useState({ start: "19:00", end: "21:00" });
  const [seating, setSeating] = useState<SeatingPreference>("any");
  const [notify, setNotify] = useState(true);
  const [first, setFirst] = useState({ restaurant_name: "", platform: "resy" as Platform });

  useEffect(() => {
    if (hydrated && !authed) router.replace("/signup");
  }, [hydrated, authed, router]);

  if (!hydrated || !authed) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-sage-500" />
      </div>
    );
  }

  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  function finish(createFirst: boolean) {
    completeOnboarding({ default_city: city, default_party_size: partySize });
    updateUser({});
    if (createFirst && first.restaurant_name.trim()) {
      const res = createRequest(
        {
          restaurant_name: first.restaurant_name.trim(),
          platform: first.platform,
          city,
          party_size: partySize,
          time_start: window.start,
          time_end: window.end,
          seating_preference: seating,
        },
        true,
      );
      pushToast(res.activated ? "success" : "info", res.message);
    }
    router.push("/queue");
  }

  return (
    <div className="min-h-screen">
      <header className="flex items-center justify-between px-5 py-5 sm:px-8">
        <Logo />
        <button onClick={() => finish(false)} className="text-sm text-ink-400 transition hover:text-ink-700">
          Skip for now
        </button>
      </header>

      {/* Progress */}
      <div className="mx-auto max-w-xl px-5">
        <div className="flex items-center gap-1.5">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={cn("h-1 flex-1 rounded-full transition-colors", i <= step ? "bg-sage-500" : "bg-line")}
            />
          ))}
        </div>
        <p className="mt-2 text-[11px] uppercase tracking-label text-sage-600">
          Step {step + 1} of {STEPS.length} · {STEPS[step]}
        </p>
      </div>

      <main className="mx-auto max-w-xl px-5 py-10">
        {step === 0 && (
          <Step title={`Welcome, ${user.name.split(" ")[0] || "there"}.`} subtitle="Watch the tables you want — we'll alert you the second one opens.">
            <div className="card-surface p-6">
              <p className="text-ink-600">
                TableNow watches Resy and OpenTable for the restaurants you want — with a far wider
                net than their search allows — and alerts you the moment a table opens. You book it
                yourself in one tap.
              </p>
              <ul className="mt-4 space-y-2 text-sm text-ink-600">
                {["Set a wider range than Resy or OpenTable allow", "Get alerted the second a table opens", "Book it in one tap on your own account"].map((t) => (
                  <li key={t} className="flex items-center gap-2">
                    <CheckIcon className="h-4 w-4 text-sage-600" /> {t}
                  </li>
                ))}
              </ul>
            </div>
            <NavRow onNext={next} nextLabel="Get started" />
          </Step>
        )}

        {step === 1 && (
          <Step title="Where do you dine?" subtitle="We'll default your watches to this city. You can change it any time.">
            <Label htmlFor="city">Default city</Label>
            <Select id="city" value={city} onChange={(e) => setCity(e.target.value)}>
              {["New York", "Los Angeles", "Chicago", "San Francisco", "Miami", "Austin", "Boston", "Washington DC"].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </Select>
            <NavRow onBack={back} onNext={next} />
          </Step>
        )}

        {step === 2 && (
          <Step title="Set your defaults" subtitle="These pre-fill every new watch. Optional, and changeable in Settings.">
            <div className="space-y-5">
              <div>
                <Label htmlFor="party">Default party size</Label>
                <Select id="party" value={String(partySize)} onChange={(e) => setPartySize(Number(e.target.value))}>
                  {[1, 2, 3, 4, 5, 6].map((n) => (
                    <option key={n} value={n}>{n} {n === 1 ? "guest" : "guests"}</option>
                  ))}
                </Select>
              </div>
              <div>
                <Label>Preferred dinner window</Label>
                <div className="grid grid-cols-2 gap-4">
                  <Input type="time" value={window.start} onChange={(e) => setWindowPref((w) => ({ ...w, start: e.target.value }))} />
                  <Input type="time" value={window.end} onChange={(e) => setWindowPref((w) => ({ ...w, end: e.target.value }))} />
                </div>
              </div>
              <div>
                <Label>Seating preference</Label>
                <Select value={seating} onChange={(e) => setSeating(e.target.value as SeatingPreference)}>
                  <option value="any">Any</option>
                  <option value="indoor">Indoor</option>
                  <option value="outdoor">Outdoor</option>
                  <option value="bar">Bar</option>
                  <option value="counter">Counter</option>
                </Select>
              </div>
              <div>
                <Label>Notifications</Label>
                <Segmented
                  value={notify ? "on" : "off"}
                  onChange={(v) => setNotify(v === "on")}
                  options={[
                    { value: "on", label: "Email me updates" },
                    { value: "off", label: "Off" },
                  ]}
                />
              </div>
            </div>
            <NavRow onBack={back} onNext={next} />
          </Step>
        )}

        {step === 3 && (
          <Step title="Create your first watch" subtitle="Start with the table you want most. We'll begin watching right away.">
            <div className="space-y-4">
              <div>
                <Label htmlFor="r">Restaurant</Label>
                <RestaurantAutocomplete
                  id="r"
                  value={first.restaurant_name}
                  autoFocus
                  onChange={(v) => setFirst((f) => ({ ...f, restaurant_name: v }))}
                  onSelect={(entry) => setFirst((f) => ({ ...f, restaurant_name: entry.name, platform: entry.platform }))}
                />
              </div>
              <div>
                <Label>Platform</Label>
                <Segmented
                  value={first.platform}
                  onChange={(platform) => setFirst((f) => ({ ...f, platform }))}
                  options={[
                    { value: "resy", label: "Resy" },
                    { value: "opentable", label: "OpenTable" },
                  ]}
                />
              </div>
              <p className="rounded-xl border border-sage-200 bg-sage-50 px-4 py-3 text-sm text-ink-700">
                We&apos;ll alert you the moment a matching table opens — then you book it in one tap.
              </p>
            </div>
            <div className="mt-8 flex items-center justify-between">
              <button onClick={back} className="text-sm text-ink-500 hover:text-ink-800">Back</button>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => finish(false)}>Do this later</Button>
                <Button onClick={() => finish(true)} disabled={!first.restaurant_name.trim()}>Create &amp; finish</Button>
              </div>
            </div>
          </Step>
        )}
      </main>
    </div>
  );
}

function Step({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="animate-fade-up">
      <h1 className="font-serif text-4xl text-ink-900">{title}</h1>
      <p className="mt-2 text-ink-500">{subtitle}</p>
      <div className="mt-8">{children}</div>
    </div>
  );
}

function NavRow({ onBack, onNext, nextLabel = "Continue" }: { onBack?: () => void; onNext: () => void; nextLabel?: string }) {
  return (
    <div className="mt-8 flex items-center justify-between">
      {onBack ? (
        <button onClick={onBack} className="text-sm text-ink-500 hover:text-ink-800">Back</button>
      ) : (
        <span />
      )}
      <Button onClick={onNext}>{nextLabel}</Button>
    </div>
  );
}
