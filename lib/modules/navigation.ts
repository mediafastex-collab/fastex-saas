import type { LucideIcon } from "lucide-react";
import {
  BadgeIndianRupee,
  BriefcaseBusiness,
  Building2,
  ClipboardList,
  CreditCard,
  FileText,
  Settings,
  LayoutDashboard,
  Network,
  Package2,
  ReceiptIndianRupee,
  ShieldCheck,
  KeyRound,
  UserRoundSearch,
  Target,
  Wallet
} from "lucide-react";

export type PlatformRole =
  | "platform_owner"
  | "platform_admin"
  | "main_admin"
  | "agency"
  | "agency_owner"
  | "agency_admin"
  | "team_member";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
};

export type NavGroup = {
  label: string;
  items: NavItem[];
};

export function getAdminNavigation(): NavGroup[] {
  return [
    {
      label: "Overview",
      items: [{ label: "Dashboard", href: "/admin", icon: LayoutDashboard }]
    },
    {
      label: "Platform",
      items: [
        { label: "Customers", href: "/admin/customers", icon: Building2, badge: "Live" },
        { label: "Subscriptions", href: "/admin/subscriptions", icon: Wallet },
        { label: "Audit & Support", href: "/admin/support", icon: ShieldCheck },
        { label: "Settings", href: "/admin/settings", icon: Settings }
      ]
    }
  ];
}

export function getWorkspaceNavigation(role: PlatformRole): NavGroup[] {
  const core: NavGroup[] = [
    {
      label: "Overview",
      items: [{ label: "Dashboard", href: "/workspace", icon: LayoutDashboard }]
    },
    {
      label: "Client Operations",
      items: [
        { label: "Clients",      href: "/workspace/clients",     icon: BriefcaseBusiness },
        { label: "Contacts",     href: "/workspace/contacts",    icon: Building2 },
        { label: "Credentials",  href: "/workspace/credentials", icon: KeyRound },
        { label: "Team Members", href: "/workspace/team",        icon: UserRoundSearch }
      ]
    },
    {
      label: "Delivery",
      items: [
        { label: "Services",     href: "/workspace/services",    icon: Network },
        { label: "Packages",     href: "/workspace/packages",    icon: Package2 },
        { label: "Onboarding",   href: "/workspace/onboarding",  icon: ClipboardList },
        { label: "Checklist Templates", href: "/workspace/checklists", icon: ClipboardList },
        { label: "Frameworks",   href: "/workspace/frameworks",   icon: FileText }
      ]
    }
  ];

  if (role !== "team_member") {
    core.push({
      label: "Finance",
      items: [
        { label: "Finance Master", href: "/workspace/finance",    icon: BadgeIndianRupee },
        { label: "Invoices",       href: "/workspace/invoices",   icon: ReceiptIndianRupee },
        { label: "Quotations",     href: "/workspace/quotations", icon: FileText },
        { label: "Payments",       href: "/workspace/payments",   icon: CreditCard }
      ]
    });
  }

  core.push({
    label: "CRM",
    items: [
      { label: "Leads", href: "/workspace/leads", icon: Target },
      { label: "Activity", href: "/workspace/activity", icon: FileText }
    ]
  });

  return core;
}
