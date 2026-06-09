"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input, Label, Segmented, Select } from "@/components/ui/field";
import { Modal } from "@/components/ui/overlay";
import { useHydrated } from "@/components/hydrated";
import { useStore } from "@/lib/store";

export default function SettingsPage() {
  const hydrated = useHydrated();
  const router = useRouter();
  const user = useStore((s) => s.user);
  const updateUser = useStore((s) => s.updateUser);
  const logout = useStore((s) => s.logout);
  const deleteAccount = useStore((s) => s.deleteAccount);
  const pushToast = useStore((s) => s.pushToast);

  const [name, setName] = useState(user.name);
  const [city, setCity] = useState(user.default_city);
  const [party, setParty] = useState(user.default_party_size);
  const [win, setWin] = useState({ start: "19:00", end: "21:00" });
  const [notify, setNotify] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(false);

  function save() {
    updateUser({ name, default_city: city, default_party_size: party });
    pushToast("success", "Settings saved.");
  }

  if (!hydrated) return <div className="px-8 py-7" />;

  return (
    <div className="mx-auto max-w-2xl px-5 py-7 sm:px-8">
      <p className="eyebrow mb-2">Settings</p>
      <h2 className="font-serif text-3xl text-ink-900">Your preferences</h2>

      {/* Profile */}
      <Section title="Profile">
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={user.email} disabled className="opacity-60" />
          </div>
        </div>
      </Section>

      {/* Defaults */}
      <Section title="Defaults">
        <div className="space-y-4">
          <div>
            <Label htmlFor="city">Default city</Label>
            <Select id="city" value={city} onChange={(e) => setCity(e.target.value)}>
              {["New York", "Los Angeles", "Chicago", "San Francisco", "Miami", "Austin", "Boston", "Washington DC"].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="party">Default party size</Label>
            <Select id="party" value={String(party)} onChange={(e) => setParty(Number(e.target.value))}>
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <option key={n} value={n}>{n} {n === 1 ? "guest" : "guests"}</option>
              ))}
            </Select>
          </div>
          <div>
            <Label>Preferred time window</Label>
            <div className="grid grid-cols-2 gap-4">
              <Input type="time" value={win.start} onChange={(e) => setWin((w) => ({ ...w, start: e.target.value }))} />
              <Input type="time" value={win.end} onChange={(e) => setWin((w) => ({ ...w, end: e.target.value }))} />
            </div>
          </div>
        </div>
      </Section>

      {/* Notifications */}
      <Section title="Notifications">
        <Label hint="Email only for now">Booking updates</Label>
        <Segmented
          value={notify ? "on" : "off"}
          onChange={(v) => setNotify(v === "on")}
          options={[
            { value: "on", label: "Email me" },
            { value: "off", label: "Off" },
          ]}
        />
        <p className="mt-2 text-[12px] text-ink-400">
          We&apos;ll email you the moment a table opens, and when a watch expires or is paused.
        </p>
      </Section>

      <div className="mt-6 flex justify-end">
        <Button onClick={save}>Save changes</Button>
      </div>

      {/* Billing + Legal */}
      <Section title="Billing & legal">
        <div className="divide-y divide-line">
          <Row label="Plan & billing" action={<Link href="/plan" className="text-sm font-medium text-sage-600 hover:text-sage-700">Manage</Link>} />
          <Row label="Terms of service" action={<span className="text-sm text-ink-400">View</span>} />
          <Row label="Privacy policy" action={<span className="text-sm text-ink-400">View</span>} />
          <Row label="Compliant-use policy" action={<span className="text-sm text-ink-400">View</span>} />
        </div>
      </Section>

      {/* Account */}
      <Section title="Account">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button variant="secondary" onClick={() => { logout(); router.push("/login"); }}>
            Sign out
          </Button>
          <button onClick={() => setConfirmDelete(true)} className="text-sm text-clay-600 hover:text-clay-700">
            Delete account
          </button>
        </div>
      </Section>

      <Modal open={confirmDelete} onClose={() => setConfirmDelete(false)} title="Delete account?" subtitle="This removes your requests, bookings, and credit history. This can't be undone.">
        <div className="flex justify-end gap-3 px-6 py-5">
          <Button variant="secondary" onClick={() => setConfirmDelete(false)}>Keep account</Button>
          <Button variant="danger" onClick={() => { deleteAccount(); router.push("/"); }}>Delete account</Button>
        </div>
      </Modal>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h3 className="mb-3 font-serif text-xl text-ink-900">{title}</h3>
      <div className="card-surface p-5">{children}</div>
    </section>
  );
}

function Row({ label, action }: { label: string; action: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
      <span className="text-sm text-ink-700">{label}</span>
      {action}
    </div>
  );
}
