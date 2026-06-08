"use client";

import { useEffect } from "react";
import { cn } from "@/lib/cn";

function useLockBody(open: boolean) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);
}

function useEscape(open: boolean, onClose: () => void) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);
}

/** Centered modal dialog. */
export function Modal({
  open,
  onClose,
  children,
  title,
  subtitle,
  className,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
}) {
  useLockBody(open);
  useEscape(open, onClose);
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div
        className="absolute inset-0 bg-ink-900/30 backdrop-blur-[2px] animate-fade-in"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          "relative z-10 w-full max-w-lg animate-fade-up rounded-t-2xl bg-ivory-50 shadow-float ring-1 ring-line sm:rounded-2xl",
          "max-h-[92vh] overflow-y-auto",
          className,
        )}
      >
        {(title || subtitle) && (
          <header className="border-b border-line px-6 pb-4 pt-6">
            {title && <h2 className="text-2xl">{title}</h2>}
            {subtitle && <p className="mt-1 text-sm text-ink-500">{subtitle}</p>}
          </header>
        )}
        {children}
      </div>
    </div>
  );
}

/** Right-side drawer (request detail). */
export function Drawer({
  open,
  onClose,
  children,
  className,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  useLockBody(open);
  useEscape(open, onClose);
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-ink-900/30 backdrop-blur-[2px] animate-fade-in" onClick={onClose} />
      <aside
        role="dialog"
        aria-modal="true"
        className={cn(
          "relative z-10 flex h-full w-full max-w-md animate-slide-in flex-col bg-ivory-50 shadow-drawer ring-1 ring-line",
          className,
        )}
      >
        {children}
      </aside>
    </div>
  );
}

export function CloseButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label="Close"
      className="flex h-9 w-9 items-center justify-center rounded-full text-ink-400 transition hover:bg-ivory-200 hover:text-ink-700 focus-ring"
    >
      <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none">
        <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    </button>
  );
}
