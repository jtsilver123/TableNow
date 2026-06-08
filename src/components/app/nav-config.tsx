import {
  CalendarIcon,
  ConnectionIcon,
  CreditIcon,
  QueueIcon,
  SettingsIcon,
} from "@/components/icons";

export interface NavItem {
  href: string;
  label: string;
  Icon: (props: { className?: string }) => JSX.Element;
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/queue", label: "Queue", Icon: QueueIcon },
  { href: "/calendar", label: "Calendar", Icon: CalendarIcon },
  { href: "/credits", label: "Credits", Icon: CreditIcon },
  { href: "/connections", label: "Connections", Icon: ConnectionIcon },
  { href: "/settings", label: "Settings", Icon: SettingsIcon },
];
