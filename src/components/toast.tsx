"use client";

import { useEffect } from "react";
import { cn } from "@/lib/cn";
import { useStore, type ToastMessage } from "@/lib/store";

const TONE: Record<ToastMessage["tone"], string> = {
  success: "border-sage-200 bg-sage-50 text-sage-700",
  info: "border-line bg-ivory-50 text-ink-700",
  warning: "border-clay-200 bg-clay-100 text-clay-600",
};

function Toast({ toast }: { toast: ToastMessage }) {
  const dismiss = useStore((s) => s.dismissToast);
  useEffect(() => {
    const t = setTimeout(() => dismiss(toast.id), 4200);
    return () => clearTimeout(t);
  }, [toast.id, dismiss]);

  return (
    <div
      className={cn(
        "pointer-events-auto flex items-start gap-3 rounded-xl border px-4 py-3 text-sm shadow-float animate-fade-up",
        TONE[toast.tone],
      )}
    >
      <span className="mt-0.5 flex h-4 w-4 flex-none items-center justify-center">
        {toast.tone === "success" ? (
          <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none">
            <path d="M3.5 8.5l3 3 6-7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : (
          <span className="h-1.5 w-1.5 rounded-full bg-current" />
        )}
      </span>
      <p className="flex-1 leading-snug">{toast.text}</p>
      <button onClick={() => dismiss(toast.id)} aria-label="Dismiss" className="text-current/50 hover:text-current">
        <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none">
          <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}

export function ToastHost() {
  const toasts = useStore((s) => s.toasts);
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[60] mx-auto flex w-full max-w-sm flex-col gap-2 px-4 sm:bottom-6">
      {toasts.map((t) => (
        <Toast key={t.id} toast={t} />
      ))}
    </div>
  );
}
