import { CalendarIcon, CreditIcon, QueueIcon, SettingsIcon } from "@/components/icons";

export interface NavItem {
  href: string;
  label: string;
  Icon: (props: { className?: string }) => JSX.Element;
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/queue", label: "Watches", Icon: QueueIcon },
  { href: "/calendar", label: "Calendar", Icon: CalendarIcon },
  { href: "/plan", label: "Plan", Icon: CreditIcon },
  { href: "/settings", label: "Settings", Icon: SettingsIcon },
];
