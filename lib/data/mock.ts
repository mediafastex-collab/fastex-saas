import type { PlatformRole } from "@/lib/modules/navigation";

export const workspaceSummary = {
  organizationName: "Fastex Media",
  activeClients: 34,
  monthlyRecurringRevenue: 868000,
  overdueInvoices: 6,
  onboardingTasksToday: 9,
  onboardingTasksWeek: 24,
  teamMembers: 8
};

export const adminSummary = {
  totalOrganizations: 42,
  totalPaidSubscriptions: 31,
  monthlyPlatformRevenue: 182000,
  supportFlags: 5
};

export const pendingCustomers = [
  {
    id: "org_01",
    companyName: "Media Fastex",
    ownerName: "Rohan Jain",
    email: "mediafastex@gmail.com",
    status: "Pending",
    role: "agency_owner"
  },
  {
    id: "org_02",
    companyName: "ScaleMint",
    ownerName: "Neha Kapoor",
    email: "neha@scalemint.io",
    status: "Approved",
    role: "agency_admin"
  }
];

export const activeModules = [
  { label: "Clients", description: "Organization-scoped client records, contacts, addresses, and statuses." },
  { label: "Services", description: "Service catalog, pricing anchors, onboarding template branches, and package mapping." },
  { label: "Packages", description: "Multi-service plans with recurring price, setup fee, and included deliverables." },
  { label: "Onboarding", description: "Client-wise phases, deadlines, priorities, assignments, and due-today dashboards." },
  { label: "Invoices & Payments", description: "Quotations, invoices, payment records, MRR, ARR, and outstanding finance tracking." }
];

export const permissionMatrix: Array<{
  role: PlatformRole;
  canManageClients: boolean;
  canManageFinance: boolean;
  canSeePlatformAdmin: boolean;
}> = [
  { role: "platform_owner", canManageClients: true, canManageFinance: true, canSeePlatformAdmin: true },
  { role: "platform_admin", canManageClients: true, canManageFinance: true, canSeePlatformAdmin: true },
  { role: "agency_owner", canManageClients: true, canManageFinance: true, canSeePlatformAdmin: false },
  { role: "agency_admin", canManageClients: true, canManageFinance: true, canSeePlatformAdmin: false },
  { role: "team_member", canManageClients: false, canManageFinance: false, canSeePlatformAdmin: false }
];
