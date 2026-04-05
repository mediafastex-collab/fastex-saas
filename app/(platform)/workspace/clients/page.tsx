"use client";

import { useState } from "react";
import { useStore } from "@/lib/data/store";
import { Drawer } from "@/components/ui/drawer";
import { chipClass } from "@/lib/utils";
import { formatCurrency } from "@/lib/data/seed";
import { MessageCircle, Mail, Pencil, Plus } from "lucide-react";

function tenureEndDate(start: string, months: number): string {
  const d = new Date(start);
  d.setMonth(d.getMonth() + months);
  return d.toISOString().slice(0, 10);
}

function fmtMonthYear(dateStr: string): string {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

const blank = {
  name: "",
  company: "",
  industry: "",
  city: "",
  billingAddress: "",
  primaryEmail: "",
  whatsapp: "",
  services: [] as string[],
  packageId: "",
  teamMemberIds: [] as string[],
  mrr: "",
  status: "Active",
  obStatus: "Not Started",
  start: "",
  tenureDuration: "6",
  notes: "",
};

type Form = typeof blank;

export default function ClientsPage() {
  const store = useStore();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<Form>(blank);

  const totalMRR = store.clients.reduce((s, c) => s + c.mrr, 0);
  const activeCount = store.clients.filter((c) => c.status === "Active").length;

  function set(patch: Partial<Form>) {
    setForm((f) => ({ ...f, ...patch }));
  }

  function openAdd() {
    setEditId(null);
    setForm(blank);
    setOpen(true);
  }

  function openEdit(id: string) {
    const c = store.clients.find((x) => x.id === id);
    if (!c) return;
    setEditId(id);
    setForm({
      name: c.name,
      company: c.company,
      industry: c.industry,
      city: c.city,
      billingAddress: c.billingAddress,
      primaryEmail: c.primaryEmail,
      whatsapp: c.whatsapp,
      services: c.services,
      packageId: c.packageIds[0] ?? "",
      teamMemberIds: c.teamMemberIds,
      mrr: String(c.mrr),
      status: c.status,
      obStatus: c.obStatus,
      start: c.start,
      tenureDuration: String(c.tenureDuration),
      notes: c.notes,
    });
    setOpen(true);
  }

  function toggleService(name: string) {
    set({
      services: form.services.includes(name)
        ? form.services.filter((s) => s !== name)
        : [...form.services, name],
    });
  }

  function toggleMember(id: string) {
    set({
      teamMemberIds: form.teamMemberIds.includes(id)
        ? form.teamMemberIds.filter((x) => x !== id)
        : [...form.teamMemberIds, id],
    });
  }

  function handleSave() {
    const payload = {
      name: form.name,
      company: form.company,
      industry: form.industry,
      city: form.city,
      billingAddress: form.billingAddress,
      primaryEmail: form.primaryEmail,
      whatsapp: form.whatsapp,
      services: form.services,
      packageIds: form.packageId ? [form.packageId] : [],
      teamMemberIds: form.teamMemberIds,
      mrr: Number(form.mrr) || 0,
      status: form.status,
      obStatus: form.obStatus,
      obPct: 0,
      start: form.start,
      tenureDuration: Number(form.tenureDuration) || 6,
      notes: form.notes,
    };

    if (editId) {
      store.updateClient(editId, payload);
    } else {
      const newClientId = store.addClient(payload);
      const matchingChecklists = store.checklists.filter((cl) =>
        payload.services.includes(cl.service)
      );
      if (matchingChecklists.length > 0) {
        matchingChecklists.forEach((cl) => {
          const due = new Date(payload.start || new Date().toISOString().slice(0, 10));
          due.setDate(due.getDate() + cl.defaultDueDays);
          store.addTask({
            clientId: newClientId,
            service: cl.service,
            name: cl.name,
            phase: cl.phase,
            due: due.toISOString().slice(0, 10),
            priority: cl.priority,
            done: false,
            assignedTo: payload.teamMemberIds[0] ?? "",
            taskStatus: "Pending",
            submittedForApproval: false,
            approvalNote: "",
          });
        });
      }
    }
    setOpen(false);
  }

  const footer = (
    <div style={{ display: "flex", gap: 8 }}>
      <button className="button secondary" onClick={() => setOpen(false)}>Cancel</button>
      <button className="button" onClick={handleSave}>{editId ? "Update Client" : "Save Client"}</button>
    </div>
  );

  return (
    <div>
      <div className="topbar">
        <div>
          <h2>Clients</h2>
          <p>{store.clients.length} clients total</p>
        </div>
        <button className="button" onClick={openAdd}>
          <Plus size={16} /> Add Client
        </button>
      </div>

      <div className="metrics two">
        <div className="card stat-mini">
          <div className="metric-label">Total Clients</div>
          <div className="metric-value">{store.clients.length}</div>
        </div>
        <div className="card stat-mini">
          <div className="metric-label">Active</div>
          <div className="metric-value">{activeCount}</div>
        </div>
        <div className="card stat-mini">
          <div className="metric-label">Total MRR</div>
          <div className="metric-value">{formatCurrency(totalMRR)}</div>
        </div>
        <div className="card stat-mini">
          <div className="metric-label">Receivable</div>
          <div className="metric-value">{formatCurrency(0)}</div>
        </div>
      </div>

      <div className="card" style={{ padding: 0, marginTop: 20 }}>
        <table className="table">
          <thead>
            <tr>
              <th>Client</th>
              <th>Services</th>
              <th>Tenure</th>
              <th>Status</th>
              <th>MRR</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {store.clients.map((c) => {
              const endDate = tenureEndDate(c.start, c.tenureDuration);
              return (
                <tr key={c.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{c.name}</div>
                    <div className="muted" style={{ fontSize: 12 }}>{c.company}</div>
                    <div className="muted" style={{ fontSize: 12 }}>{c.primaryEmail}</div>
                  </td>
                  <td>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                      {c.services.map((s) => (
                        <span key={s} className="chip chip-blue" style={{ fontSize: 11 }}>{s}</span>
                      ))}
                    </div>
                  </td>
                  <td className="muted" style={{ fontSize: 13, whiteSpace: "nowrap" }}>
                    {fmtMonthYear(c.start)} – {fmtMonthYear(endDate)}
                  </td>
                  <td>
                    <span className={chipClass(c.status)}>{c.status}</span>
                  </td>
                  <td style={{ fontWeight: 600 }}>{formatCurrency(c.mrr)}</td>
                  <td>
                    <div className="icon-actions">
                      <button
                        className="icon-btn green"
                        title="WhatsApp"
                        onClick={() => window.open(`https://wa.me/${c.whatsapp.replace(/\D/g, "")}`, "_blank")}
                      >
                        <MessageCircle size={15} />
                      </button>
                      <button
                        className="icon-btn blue"
                        title="Email"
                        onClick={() => window.open(`mailto:${c.primaryEmail}`)}
                      >
                        <Mail size={15} />
                      </button>
                      <button
                        className="icon-btn"
                        title="Edit"
                        onClick={() => openEdit(c.id)}
                      >
                        <Pencil size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        title={editId ? "Edit Client" : "Add Client"}
        subtitle={editId ? "Update client details" : "Fill in the details for the new client"}
        footer={footer}
      >
        <div className="form-section-label">Basic Info</div>
        <div className="field">
          <label>Name *</label>
          <input value={form.name} onChange={(e) => set({ name: e.target.value })} placeholder="Full name" />
        </div>
        <div className="field">
          <label>Company *</label>
          <input value={form.company} onChange={(e) => set({ company: e.target.value })} placeholder="Company name" />
        </div>
        <div className="field-row">
          <div className="field">
            <label>Industry</label>
            <input value={form.industry} onChange={(e) => set({ industry: e.target.value })} placeholder="e.g. IT/SaaS" />
          </div>
          <div className="field">
            <label>City</label>
            <input value={form.city} onChange={(e) => set({ city: e.target.value })} placeholder="City" />
          </div>
        </div>
        <div className="field">
          <label>Primary Email *</label>
          <input type="email" value={form.primaryEmail} onChange={(e) => set({ primaryEmail: e.target.value })} placeholder="email@company.com" />
        </div>
        <div className="field">
          <label>WhatsApp *</label>
          <input value={form.whatsapp} onChange={(e) => set({ whatsapp: e.target.value })} placeholder="+91 9XXXXXXXXX" />
        </div>
        <div className="field">
          <label>Billing Address</label>
          <textarea value={form.billingAddress} onChange={(e) => set({ billingAddress: e.target.value })} placeholder="Full billing address" rows={2} />
        </div>

        <div className="form-section-label">Services</div>
        <div className="pill-select">
          {store.services.map((s) => (
            <button
              key={s.id}
              type="button"
              className={`pill${form.services.includes(s.name) ? "" : " inactive"}`}
              onClick={() => toggleService(s.name)}
            >
              {s.icon} {s.name}
            </button>
          ))}
        </div>

        <div className="form-section-label">Package &amp; Team</div>
        <div className="field">
          <label>Package</label>
          <select value={form.packageId} onChange={(e) => set({ packageId: e.target.value })}>
            <option value="">Select package</option>
            {store.packages.map((p) => (
              <option key={p.id} value={p.id}>{p.name} — {formatCurrency(p.price)}/{p.billing}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>Team Members</label>
          <div className="pill-select">
            {store.teamMembers.map((m) => (
              <button
                key={m.id}
                type="button"
                className={`pill${form.teamMemberIds.includes(m.id) ? "" : " inactive"}`}
                onClick={() => toggleMember(m.id)}
              >
                {m.name}
              </button>
            ))}
          </div>
        </div>

        <div className="form-section-label">Contract</div>
        <div className="field-row">
          <div className="field">
            <label>MRR (₹)</label>
            <input type="number" value={form.mrr} onChange={(e) => set({ mrr: e.target.value })} placeholder="0" />
          </div>
          <div className="field">
            <label>Tenure Duration</label>
            <select value={form.tenureDuration} onChange={(e) => set({ tenureDuration: e.target.value })}>
              <option value="1">1 month</option>
              <option value="3">3 months</option>
              <option value="6">6 months</option>
              <option value="12">12 months</option>
            </select>
          </div>
        </div>
        <div className="field">
          <label>Start Date *</label>
          <input type="date" value={form.start} onChange={(e) => set({ start: e.target.value })} />
        </div>
        <div className="field-row">
          <div className="field">
            <label>Status</label>
            <select value={form.status} onChange={(e) => set({ status: e.target.value })}>
              <option>Active</option>
              <option>On Hold</option>
              <option>Closed</option>
            </select>
          </div>
          <div className="field">
            <label>Onboarding Status</label>
            <select value={form.obStatus} onChange={(e) => set({ obStatus: e.target.value })}>
              <option>Not Started</option>
              <option>In Progress</option>
              <option>Completed</option>
            </select>
          </div>
        </div>

        <div className="form-section-label">Notes</div>
        <div className="field">
          <textarea value={form.notes} onChange={(e) => set({ notes: e.target.value })} placeholder="Any additional notes..." rows={3} />
        </div>
      </Drawer>
    </div>
  );
}
