/** Thin line icons, sized 1em, inheriting currentColor. Calm and minimal. */
type P = { className?: string };
const s = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function QueueIcon({ className }: P) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...s}>
      <path d="M4 7h11M4 12h16M4 17h9" />
      <circle cx="19" cy="7" r="1.4" fill="currentColor" stroke="none" />
    </svg>
  );
}
export function CalendarIcon({ className }: P) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...s}>
      <rect x="3.5" y="5" width="17" height="15" rx="2.5" />
      <path d="M3.5 9.5h17M8 3.5v3M16 3.5v3" />
    </svg>
  );
}
export function CreditIcon({ className }: P) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...s}>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v8M9.5 10h3.2a1.5 1.5 0 0 1 0 3H10m0 0h3" />
    </svg>
  );
}
export function ConnectionIcon({ className }: P) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...s}>
      <path d="M9 15l6-6M8.5 13l-1.8 1.8a3 3 0 0 0 4.2 4.2L12.7 17M15.5 11l1.8-1.8a3 3 0 0 0-4.2-4.2L11.3 7" />
    </svg>
  );
}
export function SettingsIcon({ className }: P) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...s}>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 3v2.5M12 18.5V21M21 12h-2.5M5.5 12H3M18.4 5.6l-1.8 1.8M7.4 16.6l-1.8 1.8M18.4 18.4l-1.8-1.8M7.4 7.4 5.6 5.6" />
    </svg>
  );
}
export function ConciergeIcon({ className }: P) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...s}>
      <path d="M12 4a6 6 0 0 1 6 6c0 1.7-.5 2.6-1.3 3.7-.5.7-.7 1.2-.7 2.3v.5H8v-.5c0-1.1-.2-1.6-.7-2.3C6.5 12.6 6 11.7 6 10a6 6 0 0 1 6-6Z" />
      <path d="M9.5 20h5" />
    </svg>
  );
}
export function PlusIcon({ className }: P) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...s}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}
export function SearchIcon({ className }: P) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...s}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="M20 20l-4-4" />
    </svg>
  );
}
export function CheckIcon({ className }: P) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...s}>
      <path d="M5 12.5l4.5 4.5L19 6.5" />
    </svg>
  );
}
export function SendIcon({ className }: P) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...s}>
      <path d="M4.5 12 19 5l-4 14-3.5-5.5L4.5 12Z" />
    </svg>
  );
}
export function PauseIcon({ className }: P) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...s}>
      <path d="M9 5v14M15 5v14" />
    </svg>
  );
}
export function SparkIcon({ className }: P) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...s}>
      <path d="M12 4l1.6 4.4L18 10l-4.4 1.6L12 16l-1.6-4.4L6 10l4.4-1.6L12 4Z" />
    </svg>
  );
}
