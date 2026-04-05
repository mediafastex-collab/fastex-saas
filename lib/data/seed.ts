export type ServiceRecord = {
  id: string;
  name: string;
  icon: string;
};

export type TeamMemberRecord = {
  id: string;
  name: string;
  role: string; // job title
  workspaceRole: "owner" | "admin" | "manager" | "team_member";
  email: string;
  phone?: string;
};

export type LeadStage = "New Lead" | "Contacted" | "Meeting Scheduled" | "Proposal Sent" | "Won" | "Lost";

export type FollowupRecord = {
  id: string;
  leadId: string;
  date: string;
  type: "Call" | "Email" | "Meeting" | "WhatsApp";
  notes: string;
  nextFollowupDate: string;
  outcome: string;
};

export type LeadRecord = {
  id: string;
  name: string;
  company: string;
  phone: string;
  email: string;
  source: string;
  stage: LeadStage;
  assignedTo: string;
  notes: string;
  followups: FollowupRecord[];
  createdAt: string;
};

export type PackageRecord = {
  id: string;
  services: string[];
  name: string;
  price: number;
  billing: string;
  features: string[];
};

export type ClientRecord = {
  id: string;
  name: string;
  company: string;
  industry: string;
  city: string;
  billingAddress: string;
  primaryEmail: string;
  whatsapp: string;
  services: string[];
  packageIds: string[];
  teamMemberIds: string[];
  mrr: number;
  status: string;
  obStatus: string;
  obPct: number;
  start: string;
  tenureDuration: number; // months
  notes: string;
};

export type ContactRecord = {
  id: string;
  clientId: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  preferred: string;
  last: string;
};

export type TaskRecord = {
  id: string;
  clientId: string;
  service: string;
  name: string;
  phase: string;
  due: string;
  priority: "High" | "Medium" | "Low";
  done: boolean;
  assignedTo: string;
  taskStatus: "Pending" | "In Progress" | "Awaiting Approval" | "Approved" | "Done" | "Rejected";
  submittedForApproval: boolean;
  approvalNote: string;
};

export type InvoiceItem = {
  description: string;
  qty: number;
  rate: number;
};

export type InvoiceRecord = {
  id: string;
  num: string;
  clientId: string;
  issue: string;
  due: string;
  duePreset?: string;
  status: string;
  theme: string;
  gstEnabled: boolean;
  discount: number;
  notes: string;
  companyName?: string;
  companyAddress?: string;
  companyLogoUrl?: string;
  billingAddress?: string;
  bankDetails?: string;
  paymentQrUrl?: string;
  items: InvoiceItem[];
};

export type QuotationRecord = {
  id: string;
  num: string;
  clientId: string;
  issue: string;
  validUntil: string;
  status: string;
  theme: string;
  discount: number;
  notes: string;
  items: InvoiceItem[];
};

export type PaymentRecord = {
  id: string;
  clientId: string;
  invoiceId: string;
  amount: number;
  date: string;
  method: string;
  reference: string;
  status: string;
};

export type WorkspaceSettingsRecord = {
  companyName: string;
  companyAddress: string;
  companyLogoUrl: string;
  defaultBankDetails: string;
  defaultPaymentQrUrl: string;
};

export type ActivityRecord = {
  id: string;
  clientId: string;
  title: string;
  type: string;
  date: string;
  outcome: string;
  next: string;
};

export type ChecklistTemplateRecord = {
  id: string;
  service: string;
  name: string;
  phase: string;
  priority: "High" | "Medium" | "Low";
  defaultDueDays: number;
};

export type FrameworkRecord = {
  id: string;
  type: string;
  name: string;
  content: string;
};

export type CredentialRecord = {
  id: string;
  clientId: string;
  platform: string;
  label: string;
  username: string;
  password: string;
  url: string;
  notes: string;
};

export type CustomerRecord = {
  id: string;
  name: string;
  company: string;
  email: string;
  mobile: string;
  role: string;
  status: string;
};

export const crmStages = ["New Lead", "Call Done", "Client Meeting", "Deal Lost", "Deal Won"];
export const frameworkTypes = ["Onboarding", "Offboarding", "Invoice Sent", "Payment Received", "Payment Pending"];

export const services: ServiceRecord[] = [
  { id: "svc1", name: "LinkedIn Personal Branding", icon: "💼" },
  { id: "svc2", name: "LinkedIn Lead Generation", icon: "🎯" },
  { id: "svc3", name: "Marketing Lead Generation", icon: "📢" },
  { id: "svc4", name: "Email Marketing", icon: "✉️" },
  { id: "svc5", name: "WhatsApp Marketing", icon: "💬" }
];

export const teamMembers: TeamMemberRecord[] = [
  { id: "tm1", name: "Aagam Shah",  role: "Founder",               workspaceRole: "owner",       email: "aagam@fastexmedia.com", phone: "+91 99131 66462" },
  { id: "tm2", name: "Riya Patel",  role: "Account Manager",        workspaceRole: "manager",     email: "riya@fastexmedia.com",  phone: "+91 98765 00001" },
  { id: "tm3", name: "Dev Mehra",   role: "Performance Marketer",   workspaceRole: "team_member", email: "dev@fastexmedia.com",   phone: "+91 98765 00002" }
];

export const leads: LeadRecord[] = [
  { id: "l1", name: "Raj Desai",   company: "InnovateTech",   phone: "+91 98765 11111", email: "raj@innovatetech.in",  source: "LinkedIn",  stage: "Meeting Scheduled", assignedTo: "tm2", notes: "Looking for full LinkedIn growth + lead gen combo.", createdAt: "2026-03-20", followups: [{ id: "f1", leadId: "l1", date: "2026-03-22", type: "Call",      notes: "Initial discovery call completed.",       nextFollowupDate: "2026-03-28", outcome: "Positive" }, { id: "f2", leadId: "l1", date: "2026-03-28", type: "Meeting", notes: "Strategy session scheduled.",               nextFollowupDate: "2026-04-02", outcome: "Interested" }] },
  { id: "l2", name: "Meera Kapoor", company: "StyleBrand",    phone: "+91 98765 22222", email: "meera@stylebrand.in",  source: "Referral",  stage: "Contacted",         assignedTo: "tm1", notes: "Wants personal brand on LinkedIn.", createdAt: "2026-03-25", followups: [{ id: "f3", leadId: "l2", date: "2026-03-25", type: "WhatsApp", notes: "Sent intro message, awaiting reply.",      nextFollowupDate: "2026-03-29", outcome: "Awaiting Response" }] },
  { id: "l3", name: "Suresh Nair",  company: "BuildCo",       phone: "+91 98765 33333", email: "suresh@buildco.in",    source: "Website",   stage: "Proposal Sent",     assignedTo: "tm2", notes: "Interested in B2B ads package.", createdAt: "2026-03-18", followups: [{ id: "f4", leadId: "l3", date: "2026-03-20", type: "Email",    notes: "Sent detailed proposal with pricing.",     nextFollowupDate: "2026-03-31", outcome: "Reviewing" }] },
  { id: "l4", name: "Anita Verma",  company: "EduTech Corp",  phone: "+91 98765 44444", email: "anita@edutech.in",     source: "LinkedIn",  stage: "New Lead",          assignedTo: "tm3", notes: "Inbound from content post.", createdAt: "2026-03-29", followups: [] },
  { id: "l5", name: "Vijay Rao",    company: "RetailChain",   phone: "+91 98765 55555", email: "vijay@retailchain.in", source: "Cold Outreach", stage: "Won",           assignedTo: "tm1", notes: "Signed retention engine package.", createdAt: "2026-03-10", followups: [{ id: "f5", leadId: "l5", date: "2026-03-15", type: "Meeting", notes: "Final pitch done, commercials agreed.",    nextFollowupDate: "", outcome: "Won" }] }
];

export const packages: PackageRecord[] = [
  { id: "sp1", services: ["LinkedIn Personal Branding"], name: "Authority Builder", price: 35000, billing: "Monthly", features: ["Profile optimization", "Banner direction", "12 content ideas", "Weekly review"] },
  { id: "sp2", services: ["LinkedIn Lead Generation"], name: "Outbound Engine", price: 45000, billing: "Monthly", features: ["ICP build", "Automation setup", "Prospect list", "Reply SOP"] },
  { id: "sp3", services: ["Marketing Lead Generation"], name: "B2B Ads Accelerator", price: 60000, billing: "Monthly", features: ["Meta ads strategy", "Tracking setup", "Creative matrix", "Weekly optimization"] },
  { id: "sp4", services: ["Email Marketing", "WhatsApp Marketing"], name: "Retention Engine", price: 48000, billing: "Monthly", features: ["Email automation", "WhatsApp flows", "Audience segmentation", "Analytics"] },
  { id: "sp5", services: ["LinkedIn Personal Branding", "LinkedIn Lead Generation"], name: "LinkedIn Growth Suite", price: 52000, billing: "Monthly", features: ["Profile authority", "Outbound setup", "Message system", "Weekly reporting"] }
];

export const clients: ClientRecord[] = [
  { id: "c1", name: "Ravi Mehta",  company: "TechStart Pvt Ltd",   industry: "IT/SaaS",    city: "Surat",     billingAddress: "402, Orbit Business Hub, Vesu, Surat, Gujarat 395007",            primaryEmail: "ravi@techstart.in",    whatsapp: "+919876543210", services: ["LinkedIn Personal Branding", "Marketing Lead Generation"],                                        packageIds: ["sp1", "sp3"],       teamMemberIds: ["tm1", "tm3"], mrr: 95000,  status: "Active",   obStatus: "In Progress",  obPct: 72,  start: "2026-03-01", tenureDuration: 6,  notes: "Premium founder-led brand account with expansion potential." },
  { id: "c2", name: "Priya Shah",  company: "PropConnect Realty",  industry: "Real Estate", city: "Ahmedabad", billingAddress: "12th Floor, Shivalik Plaza, SG Highway, Ahmedabad 380015",       primaryEmail: "priya@propconnect.in", whatsapp: "+919987654321", services: ["LinkedIn Lead Generation"],                                                                           packageIds: ["sp2"],              teamMemberIds: ["tm2"],        mrr: 45000,  status: "Active",   obStatus: "In Progress",  obPct: 48,  start: "2026-03-05", tenureDuration: 3,  notes: "Strong outbound offer. Needs faster approvals." },
  { id: "c3", name: "Kiran Patel", company: "FinServe Advisory",   industry: "Finance",     city: "Surat",     billingAddress: "301, Sapphire Tower, Ring Road, Surat, Gujarat 395002",          primaryEmail: "kiran@finserve.co.in", whatsapp: "+918876543212", services: ["Email Marketing", "WhatsApp Marketing"],                                                              packageIds: ["sp4", "sp5"],       teamMemberIds: ["tm1", "tm2"], mrr: 50000,  status: "Active",   obStatus: "Completed",    obPct: 100, start: "2026-02-01", tenureDuration: 12, notes: "Retention-friendly client. Upsell Meta ads later." },
  { id: "c4", name: "Neha Joshi",  company: "MediCare Clinic",     industry: "Healthcare",  city: "Mumbai",    billingAddress: "7, Palm Court, Andheri East, Mumbai, Maharashtra 400059",        primaryEmail: "ananya@medicare.in",   whatsapp: "+917765432109", services: ["LinkedIn Personal Branding", "LinkedIn Lead Generation", "Marketing Lead Generation"], packageIds: ["sp1", "sp2", "sp3"], teamMemberIds: ["tm2", "tm3"], mrr: 140000, status: "On Hold", obStatus: "Not Started",  obPct: 18,  start: "2026-03-10", tenureDuration: 6,  notes: "Complex approvals. Need tighter coordination with clinic manager." }
];

export const contacts: ContactRecord[] = [
  { id: "ct1", clientId: "c1", name: "Ravi Mehta", role: "Decision Maker", email: "ravi@techstart.in", phone: "+91 98765 43210", preferred: "WhatsApp", last: "2026-03-22" },
  { id: "ct2", clientId: "c2", name: "Priya Shah", role: "Decision Maker", email: "priya@propconnect.in", phone: "+91 99876 54321", preferred: "LinkedIn", last: "2026-03-20" },
  { id: "ct3", clientId: "c3", name: "Kiran Patel", role: "Billing Contact", email: "kiran@finserve.co.in", phone: "+91 88765 43212", preferred: "Email", last: "2026-03-18" },
  { id: "ct4", clientId: "c4", name: "Ananya Desai", role: "POC", email: "ananya@medicare.in", phone: "+91 77654 32109", preferred: "WhatsApp", last: "2026-03-25" }
];

export const tasks: TaskRecord[] = [
  { id: "t1", clientId: "c1", service: "LinkedIn Personal Branding",  name: "Headline and about section rewritten", phase: "Onboarding",   due: "2026-03-31", priority: "High",   done: false, assignedTo: "tm3", taskStatus: "In Progress",        submittedForApproval: false, approvalNote: "" },
  { id: "t2", clientId: "c1", service: "Marketing Lead Generation",   name: "Creative matrix approved",             phase: "In Progress",  due: "2026-04-03", priority: "Medium", done: false, assignedTo: "tm3", taskStatus: "Awaiting Approval",  submittedForApproval: true,  approvalNote: "Creative deck sent for review." },
  { id: "t3", clientId: "c2", service: "LinkedIn Lead Generation",    name: "Automation tool configured",           phase: "Onboarding",   due: "2026-03-31", priority: "High",   done: false, assignedTo: "tm2", taskStatus: "Pending",            submittedForApproval: false, approvalNote: "" },
  { id: "t4", clientId: "c2", service: "LinkedIn Lead Generation",    name: "Message sequence approved",            phase: "In Progress",  due: "2026-04-04", priority: "Medium", done: false, assignedTo: "tm2", taskStatus: "In Progress",        submittedForApproval: false, approvalNote: "" },
  { id: "t5", clientId: "c3", service: "Email Marketing",             name: "Welcome flow built",                   phase: "Completed",    due: "2026-03-24", priority: "Medium", done: true,  assignedTo: "tm2", taskStatus: "Done",               submittedForApproval: false, approvalNote: "" },
  { id: "t6", clientId: "c4", service: "Marketing Lead Generation",   name: "Landing page QA completed",            phase: "Onboarding",   due: "2026-03-28", priority: "High",   done: false, assignedTo: "tm3", taskStatus: "Pending",            submittedForApproval: false, approvalNote: "" }
];

export const checklistTemplates: ChecklistTemplateRecord[] = [
  { id: "tpl1", service: "LinkedIn Personal Branding", name: "Brand positioning call", phase: "Pre-Onboarding", priority: "Medium", defaultDueDays: 7 },
  { id: "tpl2", service: "LinkedIn Personal Branding", name: "Content pillars finalized", phase: "Onboarding", priority: "Medium", defaultDueDays: 7 },
  { id: "tpl3", service: "LinkedIn Lead Generation", name: "ICP finalized", phase: "Pre-Onboarding", priority: "High", defaultDueDays: 7 },
  { id: "tpl4", service: "Marketing Lead Generation", name: "Pixel and tracking tested", phase: "Pre-Onboarding", priority: "High", defaultDueDays: 7 },
  { id: "tpl5", service: "Email Marketing", name: "ESP access received", phase: "Pre-Onboarding", priority: "Medium", defaultDueDays: 7 },
  { id: "tpl6", service: "WhatsApp Marketing", name: "Broadcast templates submitted", phase: "Onboarding", priority: "Medium", defaultDueDays: 7 }
];

export const invoices: InvoiceRecord[] = [
  { id: "i1", num: "INV-2026-001", clientId: "c1", issue: "2026-03-01", due: "2026-03-05", duePreset: "custom", status: "Paid", theme: "classic", gstEnabled: true, discount: 5000, notes: "March retainer", companyName: "Fastex Media", companyAddress: "Fastex Media\nAdd your office address line 1\nAdd your office address line 2\nIndia", billingAddress: "402, Orbit Business Hub, Vesu, Surat, Gujarat 395007", bankDetails: "Bank: HDFC Bank\nA/C Name: Fastex Media\nA/C No: 50200000000000\nIFSC: HDFC0000001\nUPI: fastexmedia@hdfcbank", paymentQrUrl: "", items: [{ description: "LinkedIn Personal Branding - Growth", qty: 1, rate: 35000 }, { description: "Marketing Lead Generation - Pro", qty: 1, rate: 60000 }] },
  { id: "i2", num: "INV-2026-002", clientId: "c2", issue: "2026-03-05", due: "2026-03-12", duePreset: "custom", status: "Pending", theme: "minimal", gstEnabled: true, discount: 0, notes: "Monthly retainer", companyName: "Fastex Media", companyAddress: "Fastex Media\nAdd your office address line 1\nAdd your office address line 2\nIndia", billingAddress: "12th Floor, Shivalik Plaza, SG Highway, Ahmedabad 380015", bankDetails: "Bank: HDFC Bank\nA/C Name: Fastex Media\nA/C No: 50200000000000\nIFSC: HDFC0000001\nUPI: fastexmedia@hdfcbank", paymentQrUrl: "", items: [{ description: "LinkedIn Lead Generation - Growth", qty: 1, rate: 45000 }] },
  { id: "i3", num: "INV-2026-003", clientId: "c4", issue: "2026-03-10", due: "2026-03-17", duePreset: "custom", status: "Overdue", theme: "bold", gstEnabled: true, discount: 0, notes: "Onboarding advance", companyName: "Fastex Media", companyAddress: "Fastex Media\nAdd your office address line 1\nAdd your office address line 2\nIndia", billingAddress: "7, Palm Court, Andheri East, Mumbai, Maharashtra 400059", bankDetails: "Bank: HDFC Bank\nA/C Name: Fastex Media\nA/C No: 50200000000000\nIFSC: HDFC0000001\nUPI: fastexmedia@hdfcbank", paymentQrUrl: "", items: [{ description: "Initial onboarding advance", qty: 1, rate: 50000 }] }
];

export const quotations: QuotationRecord[] = [
  { id: "q1", num: "QT-2026-001", clientId: "c1", issue: "2026-03-28", validUntil: "2026-04-05", status: "Sent", theme: "classic", discount: 5000, notes: "Founder brand and lead gen proposal for April cycle.", items: [{ description: "LinkedIn Personal Branding", qty: 1, rate: 35000 }, { description: "Marketing Lead Generation", qty: 1, rate: 60000 }] },
  { id: "q2", num: "QT-2026-002", clientId: "c3", issue: "2026-03-29", validUntil: "2026-04-08", status: "Draft", theme: "minimal", discount: 0, notes: "Retention engine quotation with email and WhatsApp flows.", items: [{ description: "Email Marketing", qty: 1, rate: 26000 }, { description: "WhatsApp Marketing", qty: 1, rate: 22000 }] }
];

export const payments: PaymentRecord[] = [
  { id: "p1", clientId: "c1", invoiceId: "i1", amount: 112100, date: "2026-03-05", method: "Bank Transfer", reference: "UTR903411", status: "Received" },
  { id: "p2", clientId: "c2", invoiceId: "i2", amount: 53100, date: "", method: "", reference: "", status: "Pending" },
  { id: "p3", clientId: "c4", invoiceId: "i3", amount: 59000, date: "", method: "", reference: "", status: "Overdue" }
];

export const activity: ActivityRecord[] = [
  { id: "a1", clientId: "c1", title: "Inbound founder lead", type: "New Lead", date: "2026-03-22", outcome: "Positive", next: "Schedule strategy call" },
  { id: "a2", clientId: "c4", title: "Commercial follow-up", type: "Client Meeting", date: "2026-03-25", outcome: "Needs Follow-up", next: "Share revised proposal" },
  { id: "a3", clientId: "c2", title: "Discovery call completed", type: "Call Done", date: "2026-03-18", outcome: "Positive", next: "Send onboarding note" }
];

export const frameworks: FrameworkRecord[] = [
  { id: "fw1", type: "Onboarding", name: "Welcome Note", content: "Hi {{client_name}}, welcome to Fastex Media. We are excited to begin your project. Please review the kickoff items and share pending access so we can move quickly." },
  { id: "fw2", type: "Invoice Sent", name: "Invoice Share", content: "Hi {{client_name}}, sharing your invoice here. Please review the details and complete the payment within the due date. Let us know if you need any clarification." }
];

export const credentials: CredentialRecord[] = [
  { id: "cred1", clientId: "c1", platform: "LinkedIn", label: "Founder Profile", username: "ravi.mehta", password: "", url: "https://www.linkedin.com/in/ravi-mehta/", notes: "2FA enabled, OTP comes on founder phone." }
];

export const customers: CustomerRecord[] = [
  { id: "usr1", name: "Aagam", company: "Fastex Media", email: "aagam@fastexmedia.com", mobile: "9913166462", role: "Main Admin", status: "Approved" },
  { id: "usr2", name: "Rohan Jain", company: "Media Fastex", email: "mediafastex@gmail.com", mobile: "0101010101", role: "Agency", status: "Pending" },
  { id: "usr3", name: "Neha Kapoor", company: "ScaleMint", email: "neha@scalemint.io", mobile: "9898989898", role: "Team Member", status: "Approved" }
];

export const settings: WorkspaceSettingsRecord = {
  companyName: "Fastex Media",
  companyAddress: "Fastex Media\nAdd your office address line 1\nAdd your office address line 2\nIndia",
  companyLogoUrl: "",
  defaultBankDetails: "Bank: HDFC Bank\nA/C Name: Fastex Media\nA/C No: 50200000000000\nIFSC: HDFC0000001\nUPI: fastexmedia@hdfcbank",
  defaultPaymentQrUrl: ""
};

export function formatCurrency(value: number) {
  return `₹${Number(value || 0).toLocaleString("en-IN")}`;
}

export function serviceIcon(name: string) {
  return services.find((service) => service.name === name)?.icon ?? "•";
}

export function subtotal(items: InvoiceItem[]) {
  return items.reduce((sum, item) => sum + item.qty * item.rate, 0);
}

export function taxableAmount(items: InvoiceItem[], discount: number) {
  return Math.max(subtotal(items) - discount, 0);
}

export function gstAmount(items: InvoiceItem[], discount: number, enabled = true) {
  return enabled ? taxableAmount(items, discount) * 0.18 : 0;
}

export function totalAmount(items: InvoiceItem[], discount: number, enabled = true) {
  return taxableAmount(items, discount) + gstAmount(items, discount, enabled);
}

export function invoiceTotal(inv: InvoiceRecord) {
  return totalAmount(inv.items, inv.discount, inv.gstEnabled);
}

export function invoicePaidAmount(invoiceId: string) {
  return payments
    .filter((payment) => payment.invoiceId === invoiceId && payment.status === "Received")
    .reduce((sum, payment) => sum + payment.amount, 0);
}

export function invoiceBalance(invoiceId: string) {
  const invoice = invoices.find((item) => item.id === invoiceId);
  if (!invoice) return 0;
  return Math.max(invoiceTotal(invoice) - invoicePaidAmount(invoiceId), 0);
}

export function findClient(clientId: string) {
  return clients.find((client) => client.id === clientId);
}

export function outstandingForClient(clientId: string) {
  const clientInvoices = invoices.filter((invoice) => invoice.clientId === clientId);
  const clientPayments = payments.filter((payment) => payment.clientId === clientId && payment.status === "Received");
  const totalInvoiced = clientInvoices.reduce((sum, invoice) => sum + totalAmount(invoice.items, invoice.discount, invoice.gstEnabled), 0);
  const totalCollected = clientPayments.reduce((sum, payment) => sum + payment.amount, 0);
  return totalInvoiced - totalCollected;
}

export function clientArr(clientId: string) {
  const client = findClient(clientId);
  return (client?.mrr ?? 0) * 12;
}
