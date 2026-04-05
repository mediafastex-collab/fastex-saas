"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { doc, onSnapshot, serverTimestamp, setDoc } from "firebase/firestore";
import { useAuth } from "@/lib/auth/auth-provider";
import { getFirebaseDb } from "@/lib/firebase/client";
import type {
  ClientRecord, ServiceRecord, PackageRecord, TeamMemberRecord,
  ContactRecord, CredentialRecord, InvoiceRecord, QuotationRecord, PaymentRecord,
  TaskRecord, ChecklistTemplateRecord, LeadRecord, FollowupRecord, WorkspaceSettingsRecord,
  ActivityRecord, FrameworkRecord
} from "./seed";
import {
  clients as seedClients, services as seedServices, packages as seedPackages,
  teamMembers as seedTeam, contacts as seedContacts, credentials as seedCredentials, invoices as seedInvoices,
  quotations as seedQuotations, payments as seedPayments, tasks as seedTasks,
  checklistTemplates as seedChecklists, leads as seedLeads, activity as seedActivity,
  frameworks as seedFrameworks, settings as seedSettings,
  totalAmount
} from "./seed";

type StoreState = {
  clients:    ClientRecord[];
  contacts:   ContactRecord[];
  services:   ServiceRecord[];
  packages:   PackageRecord[];
  teamMembers: TeamMemberRecord[];
  credentials: CredentialRecord[];
  invoices:   InvoiceRecord[];
  quotations: QuotationRecord[];
  payments:   PaymentRecord[];
  tasks:      TaskRecord[];
  checklists: ChecklistTemplateRecord[];
  leads:      LeadRecord[];
  activity:   ActivityRecord[];
  frameworks: FrameworkRecord[];
  settings:   WorkspaceSettingsRecord;
};

type Store = StoreState & {
  // Clients
  addClient:    (c: Omit<ClientRecord, "id">) => string;
  updateClient: (id: string, c: Partial<ClientRecord>) => void;
  deleteClient: (id: string) => void;
  // Contacts
  addContact:    (c: Omit<ContactRecord, "id">) => void;
  updateContact: (id: string, c: Partial<ContactRecord>) => void;
  deleteContact: (id: string) => void;
  // Services
  addService:    (s: Omit<ServiceRecord, "id">) => void;
  updateService: (id: string, s: Partial<ServiceRecord>) => void;
  // Packages
  addPackage:    (p: Omit<PackageRecord, "id">) => void;
  updatePackage: (id: string, p: Partial<PackageRecord>) => void;
  // Team
  addTeamMember:    (m: Omit<TeamMemberRecord, "id">) => void;
  updateTeamMember: (id: string, m: Partial<TeamMemberRecord>) => void;
  deleteTeamMember: (id: string) => void;
  // Credentials
  addCredential:    (c: Omit<CredentialRecord, "id">) => void;
  updateCredential: (id: string, c: Partial<CredentialRecord>) => void;
  deleteCredential: (id: string) => void;
  // Invoices
  addInvoice:    (inv: Omit<InvoiceRecord, "id" | "num">) => void;
  updateInvoice: (id: string, inv: Partial<InvoiceRecord>) => void;
  // Quotations
  addQuotation:    (q: Omit<QuotationRecord, "id" | "num">) => void;
  updateQuotation: (id: string, q: Partial<QuotationRecord>) => void;
  deleteQuotation: (id: string) => void;
  // Payments
  updatePayment: (id: string, p: Partial<PaymentRecord>) => void;
  addPayment:    (p: Omit<PaymentRecord, "id">) => void;
  deletePayment: (id: string) => void;
  updateSettings: (patch: Partial<WorkspaceSettingsRecord>) => void;
  // Tasks
  addTask:    (t: Omit<TaskRecord, "id">) => void;
  updateTask: (id: string, t: Partial<TaskRecord>) => void;
  deleteTask: (id: string) => void;
  // Checklists
  addChecklist:    (c: Omit<ChecklistTemplateRecord, "id">) => void;
  updateChecklist: (id: string, c: Partial<ChecklistTemplateRecord>) => void;
  deleteChecklist: (id: string) => void;
  // Leads
  addLead:       (l: Omit<LeadRecord, "id" | "followups" | "createdAt">) => void;
  updateLead:    (id: string, l: Partial<LeadRecord>) => void;
  deleteLead:    (id: string) => void;
  addFollowup:   (leadId: string, f: Omit<FollowupRecord, "id" | "leadId">) => void;
  // Activity
  addActivity:    (a: Omit<ActivityRecord, "id">) => void;
  updateActivity: (id: string, a: Partial<ActivityRecord>) => void;
  deleteActivity: (id: string) => void;
  // Frameworks
  addFramework:    (f: Omit<FrameworkRecord, "id">) => void;
  updateFramework: (id: string, f: Partial<FrameworkRecord>) => void;
  deleteFramework: (id: string) => void;
};

const Ctx = createContext<Store | null>(null);

const STORAGE_KEY = "fastex_ws_data";

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function normalizeLoadedState(input: Partial<StoreState> | null): StoreState | null {
  if (!input) return null;
  return {
    clients: input.clients ?? seedClients,
    contacts: input.contacts ?? seedContacts,
    services: input.services ?? seedServices,
    packages: input.packages ?? seedPackages,
    teamMembers: input.teamMembers ?? seedTeam,
    credentials: input.credentials ?? seedCredentials,
    invoices: input.invoices ?? seedInvoices,
    quotations: input.quotations ?? seedQuotations,
    payments: input.payments ?? seedPayments,
    tasks: input.tasks ?? seedTasks,
    checklists: input.checklists ?? seedChecklists,
    leads: input.leads ?? seedLeads,
    activity: input.activity ?? seedActivity,
    frameworks: input.frameworks ?? seedFrameworks,
    settings: input.settings ?? seedSettings,
  };
}

function createSeedState(): StoreState {
  return {
    clients: seedClients,
    contacts: seedContacts,
    services: seedServices,
    packages: seedPackages,
    teamMembers: seedTeam,
    credentials: seedCredentials,
    invoices: seedInvoices,
    quotations: seedQuotations,
    payments: seedPayments,
    tasks: seedTasks,
    checklists: seedChecklists,
    leads: seedLeads,
    activity: seedActivity,
    frameworks: seedFrameworks,
    settings: seedSettings,
  };
}

function createEmptyState(companyName?: string): StoreState {
  return {
    clients: [],
    contacts: [],
    services: [],
    packages: [],
    teamMembers: [],
    credentials: [],
    invoices: [],
    quotations: [],
    payments: [],
    tasks: [],
    checklists: [],
    leads: [],
    activity: [],
    frameworks: [],
    settings: {
      ...seedSettings,
      companyName: companyName || seedSettings.companyName,
    },
  };
}

function load(): StoreState | null {
  try {
    const raw = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    return raw ? normalizeLoadedState(JSON.parse(raw)) : null;
  } catch { return null; }
}

function save(state: StoreState) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
}

export function DataProvider({ children }: { children: React.ReactNode }) {
  const { firebaseEnabled, loading: authLoading, user, profile } = useAuth();
  const [state, setState] = useState<StoreState>(() => load() ?? createSeedState());
  const [remoteReady, setRemoteReady] = useState(false);

  useEffect(() => {
    if (!firebaseEnabled) {
      const saved = load();
      setState(saved ?? createSeedState());
      setRemoteReady(true);
      return;
    }

    if (authLoading) return;
    if (!user || !profile?.workspaceId) {
      setRemoteReady(false);
      return;
    }

    const db = getFirebaseDb();
    if (!db) {
      setRemoteReady(true);
      return;
    }

    setRemoteReady(false);

    const ref = doc(db, "workspaces", profile.workspaceId);
    const unsubscribe = onSnapshot(ref, async (snapshot) => {
      if (snapshot.exists()) {
        const nextState = normalizeLoadedState((snapshot.data().data || null) as Partial<StoreState> | null);
        setState(nextState ?? createEmptyState(profile.company));
      } else {
        const initialState = profile.role === "main_admin" ? createSeedState() : createEmptyState(profile.company);
        await setDoc(ref, {
          workspaceId: profile.workspaceId,
          ownerUid: user.uid,
          company: profile.company,
          data: initialState,
          updatedAt: serverTimestamp(),
        }, { merge: true });
        setState(initialState);
      }
      setRemoteReady(true);
    });

    return () => unsubscribe();
  }, [authLoading, firebaseEnabled, profile?.company, profile?.role, profile?.workspaceId, user]);

  useEffect(() => {
    if (!firebaseEnabled) {
      save(state);
      return;
    }

    if (!remoteReady || !profile?.workspaceId || !user) return;
    const db = getFirebaseDb();
    if (!db) return;

    const timeout = window.setTimeout(() => {
      void setDoc(doc(db, "workspaces", profile.workspaceId), {
        workspaceId: profile.workspaceId,
        ownerUid: user.uid,
        company: profile.company,
        data: state,
        updatedAt: serverTimestamp(),
      }, { merge: true });
    }, 350);

    return () => window.clearTimeout(timeout);
  }, [firebaseEnabled, profile?.company, profile?.workspaceId, remoteReady, state, user]);

  function mutate(fn: (s: StoreState) => StoreState) {
    setState((prev) => fn(prev));
  }

  // ── Clients ──────────────────────────────────────────────────
  const addClient = useCallback((c: Omit<ClientRecord, "id">) => {
    const id = "c" + uid();
    mutate((s) => ({ ...s, clients: [...s.clients, { ...c, id }] }));
    return id;
  }, []);

  const updateClient = useCallback((id: string, c: Partial<ClientRecord>) =>
    mutate((s) => ({ ...s, clients: s.clients.map((x) => x.id === id ? { ...x, ...c } : x) })), []);

  const deleteClient = useCallback((id: string) =>
    mutate((s) => ({
      ...s,
      clients: s.clients.filter((x) => x.id !== id),
      contacts: s.contacts.filter((x) => x.clientId !== id),
      credentials: s.credentials.filter((x) => x.clientId !== id),
      invoices: s.invoices.filter((x) => x.clientId !== id),
      quotations: s.quotations.filter((x) => x.clientId !== id),
      payments: s.payments.filter((x) => x.clientId !== id),
      tasks: s.tasks.filter((x) => x.clientId !== id),
      activity: s.activity.filter((x) => x.clientId !== id),
    })), []);

  // ── Contacts ────────────────────────────────────────────────
  const addContact = useCallback((c: Omit<ContactRecord, "id">) =>
    mutate((s) => ({ ...s, contacts: [...s.contacts, { ...c, id: "ct" + uid() }] })), []);

  const updateContact = useCallback((id: string, c: Partial<ContactRecord>) =>
    mutate((s) => ({ ...s, contacts: s.contacts.map((x) => x.id === id ? { ...x, ...c } : x) })), []);

  const deleteContact = useCallback((id: string) =>
    mutate((s) => ({ ...s, contacts: s.contacts.filter((x) => x.id !== id) })), []);

  // ── Services ─────────────────────────────────────────────────
  const addService = useCallback((sv: Omit<ServiceRecord, "id">) =>
    mutate((s) => ({ ...s, services: [...s.services, { ...sv, id: "svc" + uid() }] })), []);

  const updateService = useCallback((id: string, sv: Partial<ServiceRecord>) =>
    mutate((s) => {
      const current = s.services.find((x) => x.id === id);
      const nextServices = s.services.map((x) => x.id === id ? { ...x, ...sv } : x);
      if (!current || !sv.name || sv.name === current.name) {
        return { ...s, services: nextServices };
      }
      const oldName = current.name;
      const newName = sv.name;
      return {
        ...s,
        services: nextServices,
        packages: s.packages.map((pkg) => ({ ...pkg, services: pkg.services.map((service) => service === oldName ? newName : service) })),
        clients: s.clients.map((client) => ({ ...client, services: client.services.map((service) => service === oldName ? newName : service) })),
        tasks: s.tasks.map((task) => task.service === oldName ? { ...task, service: newName } : task),
        checklists: s.checklists.map((item) => item.service === oldName ? { ...item, service: newName } : item),
      };
    }), []);

  // ── Packages ─────────────────────────────────────────────────
  const addPackage = useCallback((p: Omit<PackageRecord, "id">) =>
    mutate((s) => ({ ...s, packages: [...s.packages, { ...p, id: "sp" + uid() }] })), []);

  const updatePackage = useCallback((id: string, p: Partial<PackageRecord>) =>
    mutate((s) => ({ ...s, packages: s.packages.map((x) => x.id === id ? { ...x, ...p } : x) })), []);

  // ── Team ─────────────────────────────────────────────────────
  const addTeamMember = useCallback((m: Omit<TeamMemberRecord, "id">) =>
    mutate((s) => ({ ...s, teamMembers: [...s.teamMembers, { ...m, id: "tm" + uid() }] })), []);

  const updateTeamMember = useCallback((id: string, m: Partial<TeamMemberRecord>) =>
    mutate((s) => ({ ...s, teamMembers: s.teamMembers.map((x) => x.id === id ? { ...x, ...m } : x) })), []);

  const deleteTeamMember = useCallback((id: string) =>
    mutate((s) => ({
      ...s,
      teamMembers: s.teamMembers.filter((x) => x.id !== id),
      clients: s.clients.map((client) => ({
        ...client,
        teamMemberIds: client.teamMemberIds.filter((memberId) => memberId !== id),
      })),
      tasks: s.tasks.map((task) => task.assignedTo === id ? { ...task, assignedTo: "" } : task),
      leads: s.leads.map((lead) => lead.assignedTo === id ? { ...lead, assignedTo: "" } : lead),
    })), []);

  // ── Credentials ───────────────────────────────────────────────
  const addCredential = useCallback((c: Omit<CredentialRecord, "id">) =>
    mutate((s) => ({ ...s, credentials: [...s.credentials, { ...c, id: "cred" + uid() }] })), []);

  const updateCredential = useCallback((id: string, c: Partial<CredentialRecord>) =>
    mutate((s) => ({ ...s, credentials: s.credentials.map((x) => x.id === id ? { ...x, ...c } : x) })), []);

  const deleteCredential = useCallback((id: string) =>
    mutate((s) => ({ ...s, credentials: s.credentials.filter((x) => x.id !== id) })), []);

  // ── Invoices ─────────────────────────────────────────────────
  const addInvoice = useCallback((inv: Omit<InvoiceRecord, "id" | "num">) =>
    mutate((s) => {
      const num = `INV-2026-${String(s.invoices.length + 1).padStart(3, "0")}`;
      return { ...s, invoices: [...s.invoices, { ...inv, id: "i" + uid(), num }] };
    }), []);

  const updateInvoice = useCallback((id: string, inv: Partial<InvoiceRecord>) =>
    mutate((s) => ({ ...s, invoices: s.invoices.map((x) => x.id === id ? { ...x, ...inv } : x) })), []);

  // ── Quotations ────────────────────────────────────────────────
  const addQuotation = useCallback((q: Omit<QuotationRecord, "id" | "num">) =>
    mutate((s) => {
      const num = `QT-2026-${String(s.quotations.length + 1).padStart(3, "0")}`;
      return { ...s, quotations: [...s.quotations, { ...q, id: "q" + uid(), num }] };
    }), []);

  const updateQuotation = useCallback((id: string, q: Partial<QuotationRecord>) =>
    mutate((s) => ({ ...s, quotations: s.quotations.map((x) => x.id === id ? { ...x, ...q } : x) })), []);

  const deleteQuotation = useCallback((id: string) =>
    mutate((s) => ({ ...s, quotations: s.quotations.filter((x) => x.id !== id) })), []);

  // ── Payments ─────────────────────────────────────────────────
  const updatePayment = useCallback((id: string, p: Partial<PaymentRecord>) =>
    mutate((s) => {
      const payments = s.payments.map((x) => x.id === id ? { ...x, ...p } : x);
      return {
        ...s,
        payments,
        invoices: syncInvoiceStatuses(s.invoices, payments),
      };
    }), []);

  const addPayment = useCallback((p: Omit<PaymentRecord, "id">) =>
    mutate((s) => {
      const payments = [...s.payments, { ...p, id: "p" + uid() }];
      return {
        ...s,
        payments,
        invoices: syncInvoiceStatuses(s.invoices, payments),
      };
    }), []);

  const deletePayment = useCallback((id: string) =>
    mutate((s) => {
      const payments = s.payments.filter((x) => x.id !== id);
      return {
        ...s,
        payments,
        invoices: syncInvoiceStatuses(s.invoices, payments),
      };
    }), []);

  // ── Tasks ─────────────────────────────────────────────────────
  const addTask = useCallback((t: Omit<TaskRecord, "id">) =>
    mutate((s) => ({ ...s, tasks: [...s.tasks, { ...t, id: "t" + uid() }] })), []);

  const updateTask = useCallback((id: string, t: Partial<TaskRecord>) =>
    mutate((s) => ({ ...s, tasks: s.tasks.map((x) => x.id === id ? { ...x, ...t } : x) })), []);

  const deleteTask = useCallback((id: string) =>
    mutate((s) => ({ ...s, tasks: s.tasks.filter((x) => x.id !== id) })), []);

  // ── Checklists ────────────────────────────────────────────────
  const addChecklist = useCallback((c: Omit<ChecklistTemplateRecord, "id">) =>
    mutate((s) => ({ ...s, checklists: [...s.checklists, { ...c, id: "tpl" + uid() }] })), []);

  const updateChecklist = useCallback((id: string, c: Partial<ChecklistTemplateRecord>) =>
    mutate((s) => ({ ...s, checklists: s.checklists.map((x) => x.id === id ? { ...x, ...c } : x) })), []);

  const deleteChecklist = useCallback((id: string) =>
    mutate((s) => ({ ...s, checklists: s.checklists.filter((x) => x.id !== id) })), []);

  // ── Leads ─────────────────────────────────────────────────────
  const addLead = useCallback((l: Omit<LeadRecord, "id" | "followups" | "createdAt">) =>
    mutate((s) => ({
      ...s,
      leads: [...s.leads, { ...l, id: "l" + uid(), followups: [], createdAt: new Date().toISOString().slice(0, 10) }]
    })), []);

  const updateLead = useCallback((id: string, l: Partial<LeadRecord>) =>
    mutate((s) => ({ ...s, leads: s.leads.map((x) => x.id === id ? { ...x, ...l } : x) })), []);

  const deleteLead = useCallback((id: string) =>
    mutate((s) => ({ ...s, leads: s.leads.filter((x) => x.id !== id) })), []);

  const addFollowup = useCallback((leadId: string, f: Omit<FollowupRecord, "id" | "leadId">) =>
    mutate((s) => ({
      ...s,
      leads: s.leads.map((l) =>
        l.id === leadId
          ? { ...l, followups: [...l.followups, { ...f, id: "f" + uid(), leadId }] }
          : l
      )
    })), []);

  // ── Activity ────────────────────────────────────────────────
  const addActivity = useCallback((a: Omit<ActivityRecord, "id">) =>
    mutate((s) => ({ ...s, activity: [...s.activity, { ...a, id: "act" + uid() }] })), []);

  const updateActivity = useCallback((id: string, a: Partial<ActivityRecord>) =>
    mutate((s) => ({ ...s, activity: s.activity.map((x) => x.id === id ? { ...x, ...a } : x) })), []);

  const deleteActivity = useCallback((id: string) =>
    mutate((s) => ({ ...s, activity: s.activity.filter((x) => x.id !== id) })), []);

  // ── Frameworks ──────────────────────────────────────────────
  const addFramework = useCallback((f: Omit<FrameworkRecord, "id">) =>
    mutate((s) => ({ ...s, frameworks: [...s.frameworks, { ...f, id: "fw" + uid() }] })), []);

  const updateFramework = useCallback((id: string, f: Partial<FrameworkRecord>) =>
    mutate((s) => ({ ...s, frameworks: s.frameworks.map((x) => x.id === id ? { ...x, ...f } : x) })), []);

  const deleteFramework = useCallback((id: string) =>
    mutate((s) => ({ ...s, frameworks: s.frameworks.filter((x) => x.id !== id) })), []);

  const updateSettings = useCallback((patch: Partial<WorkspaceSettingsRecord>) =>
    mutate((s) => ({ ...s, settings: { ...s.settings, ...patch } })), []);

  return (
    <Ctx.Provider value={{
      ...state,
      addClient, updateClient, deleteClient,
      addContact, updateContact, deleteContact,
      addService, updateService,
      addPackage, updatePackage,
      addTeamMember, updateTeamMember, deleteTeamMember,
      addCredential, updateCredential, deleteCredential,
      addInvoice, updateInvoice,
      addQuotation, updateQuotation, deleteQuotation,
      updatePayment, addPayment, deletePayment,
      addTask, updateTask, deleteTask,
      addChecklist, updateChecklist, deleteChecklist,
      addLead, updateLead, deleteLead, addFollowup,
      addActivity, updateActivity, deleteActivity,
      addFramework, updateFramework, deleteFramework,
      updateSettings,
    }}>
      {children}
    </Ctx.Provider>
  );
}

export function useStore(): Store {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useStore must be used inside DataProvider");
  return ctx;
}

function syncInvoiceStatuses(invoices: InvoiceRecord[], payments: PaymentRecord[]) {
  const today = new Date().toISOString().slice(0, 10);
  return invoices.map((invoice) => {
    const paid = payments
      .filter((payment) => payment.invoiceId === invoice.id && payment.status === "Received")
      .reduce((sum, payment) => sum + payment.amount, 0);
    const total = totalAmount(invoice.items, invoice.discount, invoice.gstEnabled);
    let status = invoice.status;
    if (paid >= total && total > 0) status = "Paid";
    else if (invoice.due && invoice.due < today) status = "Overdue";
    else if (invoice.status === "Draft") status = "Draft";
    else status = "Pending";
    return { ...invoice, status };
  });
}
