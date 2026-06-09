"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Leader } from "@/components/ui/leader";
import { CloseButton } from "@/components/ui/overlay";
import { PlatformLogo } from "@/components/ui/platform-logo";
import { ConciergeIcon, SendIcon, SparkIcon } from "@/components/icons";
import { FLEXIBILITY_LABEL } from "@/lib/status";
import { formatDateRange, formatPartySize, formatTimeWindow } from "@/lib/format";
import { ALERT_COPY } from "@/lib/plan";
import { cn } from "@/lib/cn";
import { useStore } from "@/lib/store";
import { useUi } from "@/lib/ui-store";
import type { ConciergeMessage, ReservationRequest } from "@/lib/types";

const PROMPTS = [
  "Watch Don Angie for 2 next Friday after 7.",
  "Try Tatiana any night next week for 2.",
  "Make my Lilia watch easier to catch.",
  "What does my plan include?",
];

function ConciergeBody({ onClose }: { onClose?: () => void }) {
  const messages = useStore((s) => s.conciergeMessages);
  const send = useStore((s) => s.sendConcierge);
  const [text, setText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length]);

  function submit(value: string) {
    const v = value.trim();
    if (!v) return;
    send(v);
    setText("");
  }

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center justify-between border-b border-line px-5 py-4">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-sage-100 text-sage-600">
            <ConciergeIcon className="h-[18px] w-[18px]" />
          </span>
          <div>
            <p className="text-sm font-medium text-ink-900">Concierge</p>
            <p className="text-[11px] text-ink-400">Describe the table you want</p>
          </div>
        </div>
        {onClose && <CloseButton onClick={onClose} />}
      </header>

      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
        {messages.length === 0 ? (
          <div className="pt-2">
            <div className="rounded-2xl rounded-bl-sm border border-line bg-ivory-50 px-4 py-3 text-sm text-ink-700">
              Tell me the table you&apos;re after and I&apos;ll set up a watch. I can also make a watch
              easier to catch, pause watches, or explain your plan.
            </div>
            <div className="mt-4 space-y-2">
              {PROMPTS.map((p) => (
                <button
                  key={p}
                  onClick={() => submit(p)}
                  className="flex w-full items-center gap-2 rounded-xl border border-line bg-ivory-50 px-3.5 py-2.5 text-left text-[13px] text-ink-600 transition hover:border-sage-300 hover:bg-sage-50 focus-ring"
                >
                  <SparkIcon className="h-3.5 w-3.5 flex-none text-sage-500" />
                  {p}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((m) => <MessageBubble key={m.id} message={m} onClose={onClose} />)
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit(text);
        }}
        className="border-t border-line p-3"
      >
        <div className="flex items-end gap-2 rounded-xl border border-line bg-ivory-50 p-1.5 focus-within:border-sage-300 focus-within:ring-2 focus-within:ring-sage-200">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit(text);
              }
            }}
            rows={1}
            placeholder="Describe a table…"
            className="max-h-28 flex-1 resize-none bg-transparent px-2.5 py-2 text-sm text-ink-800 placeholder:text-ink-400 focus:outline-none"
          />
          <Button type="submit" size="sm" disabled={!text.trim()} className="h-9 w-9 flex-none !px-0">
            <SendIcon className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}

function MessageBubble({ message, onClose }: { message: ConciergeMessage; onClose?: () => void }) {
  if (message.role === "user") {
    return (
      <div className="ml-auto w-fit max-w-[88%] rounded-2xl rounded-br-sm bg-sage-500 px-4 py-2.5 text-sm text-ivory-50">
        {message.content}
      </div>
    );
  }
  return (
    <div className="space-y-3">
      <div className="w-fit max-w-[92%] rounded-2xl rounded-bl-sm border border-line bg-ivory-50 px-4 py-3 text-sm text-ink-700">
        {message.content}
      </div>
      {message.structured_payload && (
        <ConfirmationCard payload={message.structured_payload} onClose={onClose} />
      )}
    </div>
  );
}

function ConfirmationCard({
  payload,
  onClose,
}: {
  payload: Partial<ReservationRequest>;
  onClose?: () => void;
}) {
  const createRequest = useStore((s) => s.createRequest);
  const pushToast = useStore((s) => s.pushToast);
  const openEditModal = useUi((s) => s.openEditModal);
  const [added, setAdded] = useState(false);

  function addToQueue() {
    const res = createRequest(payload, true);
    setAdded(true);
    pushToast(res.activated ? "success" : "info", res.message);
  }

  return (
    <div className="card-surface overflow-hidden">
      <div className="border-b border-line bg-ivory-100 px-4 py-2.5">
        <p className="eyebrow">Proposed request</p>
      </div>
      <div className="px-4 py-2">
        <Leader label="Restaurant" value={payload.restaurant_name ?? "—"} emphasis />
        <Leader label="Platform" value={<PlatformLogo platform={payload.platform ?? "resy"} className="text-[13px]" />} />
        <Leader label="Party" value={payload.party_size ? formatPartySize(payload.party_size) : "—"} />
        {payload.date_start && (
          <Leader
            label="When"
            value={formatDateRange({ date_start: payload.date_start, date_end: payload.date_end ?? payload.date_start })}
          />
        )}
        {payload.time_start && payload.time_end && (
          <Leader label="Time" value={formatTimeWindow({ time_start: payload.time_start, time_end: payload.time_end })} />
        )}
        {payload.flexibility_level && (
          <Leader label="Flexibility" value={FLEXIBILITY_LABEL[payload.flexibility_level]} />
        )}
      </div>
      <div className="border-t border-line px-4 py-2.5 text-[11px] text-ink-400">{ALERT_COPY}</div>
      <div className="flex gap-2 border-t border-line p-3">
        {added ? (
          <p className="flex items-center gap-1.5 px-2 text-[13px] text-sage-600">Added to your queue.</p>
        ) : (
          <>
            <Button size="sm" onClick={addToQueue} className="flex-1">
              Add watch
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                openEditModal("", payload);
                onClose?.();
              }}
            >
              Edit
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

/** Desktop right rail + mobile drawer. */
export function ConciergePanel() {
  const mobileOpen = useUi((s) => s.conciergeMobileOpen);
  const setMobile = useUi((s) => s.setConciergeMobile);

  return (
    <>
      {/* Desktop right rail */}
      <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-[360px] flex-none border-l border-line bg-ivory-50/40 xl:block">
        <ConciergeBody />
      </aside>

      {/* Mobile FAB */}
      <button
        onClick={() => setMobile(true)}
        className="fixed bottom-20 right-5 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-sage-500 text-ivory-50 shadow-float transition hover:bg-sage-600 focus-ring xl:hidden"
        aria-label="Open concierge"
      >
        <ConciergeIcon className="h-5 w-5" />
      </button>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex justify-end xl:hidden">
          <div className="absolute inset-0 bg-ink-900/30 backdrop-blur-[2px] animate-fade-in" onClick={() => setMobile(false)} />
          <div className="relative z-10 flex h-full w-full max-w-md animate-slide-in flex-col bg-ivory-50 shadow-drawer">
            <ConciergeBody onClose={() => setMobile(false)} />
          </div>
        </div>
      )}
    </>
  );
}
