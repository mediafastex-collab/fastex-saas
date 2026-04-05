"use client";

import { useState } from "react";
import { useStore } from "@/lib/data/store";
import { Drawer } from "@/components/ui/drawer";
import { chipClass } from "@/lib/utils";
import { formatCurrency } from "@/lib/data/seed";
import { Pencil, Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import type { LeadStage } from "@/lib/data/seed";

const STAGES: LeadStage[] = ["New Lead", "Contacted", "Meeting Scheduled", "Proposal Sent", "Won", "Lost"];

const stageChip: Record<string, string> = {
  "New Lead": "chip chip-slate",
  "Contacted": "chip chip-blue",
  "Meeting Scheduled": "chip chip-purple",
  "Proposal Sent": "chip chip-amber",
  "Won": "chip chip-green",
  "Lost": "chip chip-red",
};

const blankLead = {
  name: "",
  company: "",
  phone: "",
  email: "",
  source: "LinkedIn",
  stage: "New Lead" as LeadStage,
  assignedTo: "",
  notes: "",
};

const blankFollowup = {
  date: "",
  type: "Call" as "Call" | "Email" | "Meeting" | "WhatsApp",
  notes: "",
  outcome: "",
  nextFollowupDate: "",
};

type LeadForm = typeof blankLead;
type FollowupForm = typeof blankFollowup;

export default function LeadsPage() {
  const store = useStore();
  const [tab, setTab] = useState<"ALL" | LeadStage>("ALL");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [leadDrawer, setLeadDrawer] = useState(false);
  const [editLeadId, setEditLeadId] = useState<string | null>(null);
  const [leadForm, setLeadForm] = useState<LeadForm>(blankLead);
  const [followupDrawer, setFollowupDrawer] = useState(false);
  const [followupLeadId, setFollowupLeadId] = useState<string | null>(null);
  const [followupForm, setFollowupForm] = useState<FollowupForm>(blankFollowup);

  const leads = store.leads;
  const filtered = tab === "ALL" ? leads : leads.filter((l) => l.stage === tab);

  const now = new Date();
  const wonThisMonth = leads.filter((l) => {
    if (l.stage !== "Won") return false;
    const created = new Date(l.createdAt);
    return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
  }).length;
  const conversionRate = leads.length > 0 ? Math.round((leads.filter((l) => l.stage === "Won").length / leads.length) * 100) : 0;

  function setL(patch: Partial<LeadForm>) {
    setLeadForm((f) => ({ ...f, ...patch }));
  }
  function setF(patch: Partial<FollowupForm>) {
    setFollowupForm((f) => ({ ...f, ...patch }));
  }

  function toggleExpand(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function openAddLead() {
    setEditLeadId(null);
    setLeadForm(blankLead);
    setLeadDrawer(true);
  }

  function openEditLead(id: string) {
    const l = store.leads.find((x) => x.id === id);
    if (!l) return;
    setEditLeadId(id);
    setLeadForm({
      name: l.name,
      company: l.company,
      phone: l.phone,
      email: l.email,
      source: l.source,
      stage: l.stage,
      assignedTo: l.assignedTo,
      notes: l.notes,
    });
    setLeadDrawer(true);
  }

  function saveLead() {
    if (editLeadId) {
      store.updateLead(editLeadId, leadForm);
    } else {
      store.addLead(leadForm);
    }
    setLeadDrawer(false);
  }

  function openFollowup(leadId: string) {
    setFollowupLeadId(leadId);
    setFollowupForm(blankFollowup);
    setFollowupDrawer(true);
  }

  function saveFollowup() {
    if (!followupLeadId) return;
    store.addFollowup(followupLeadId, followupForm);
    setFollowupDrawer(false);
  }

  function getAssigneeName(id: string) {
    return store.teamMembers.find((m) => m.id === id)?.name ?? id;
  }

  function initials(name: string) {
    return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  }

  const leadFooter = (
    <div style={{ display: "flex", gap: 8 }}>
      <button className="button secondary" onClick={() => setLeadDrawer(false)}>Cancel</button>
      <button className="button" onClick={saveLead}>{editLeadId ? "Update Lead" : "Add Lead"}</button>
    </div>
  );

  const followupFooter = (
    <div style={{ display: "flex", gap: 8 }}>
      <button className="button secondary" onClick={() => setFollowupDrawer(false)}>Cancel</button>
      <button className="button" onClick={saveFollowup}>Save Followup</button>
    </div>
  );

  return (
    <div>
      <div className="topbar">
        <div>
          <h2>Leads</h2>
          <p>{leads.length} total in pipeline</p>
        </div>
        <button className="button" onClick={openAddLead}>
          <Plus size={16} /> Add Lead
        </button>
      </div>

      <div className="metrics two" style={{ marginBottom: 20 }}>
        <div className="card stat-mini">
          <div className="metric-label">Total Pipeline</div>
          <div className="metric-value">{leads.length}</div>
        </div>
        <div className="card stat-mini">
          <div className="metric-label">Won This Month</div>
          <div className="metric-value">{wonThisMonth}</div>
        </div>
        <div className="card stat-mini">
          <div className="metric-label">Conversion Rate</div>
          <div className="metric-value">{conversionRate}%</div>
        </div>
      </div>

      <div className="tabs" style={{ marginBottom: 16 }}>
        <button className={`tab${tab === "ALL" ? " active" : ""}`} onClick={() => setTab("ALL")}>
          All ({leads.length})
        </button>
        {STAGES.map((s) => (
          <button
            key={s}
            className={`tab${tab === s ? " active" : ""}`}
            onClick={() => setTab(s)}
          >
            {s} ({leads.filter((l) => l.stage === s).length})
          </button>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {filtered.map((lead) => {
          const isExpanded = expanded.has(lead.id);
          const lastFollowup = lead.followups[lead.followups.length - 1];
          return (
            <div className="lead-card" key={lead.id}>
              <div className="lead-card-head" onClick={() => toggleExpand(lead.id)} style={{ cursor: "pointer" }}>
                <div className="avatar">{initials(lead.name)}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600 }}>{lead.name}</div>
                  <div className="muted" style={{ fontSize: 12 }}>{lead.company}</div>
                </div>
                <span className={stageChip[lead.stage] ?? "chip chip-slate"}>{lead.stage}</span>
                <div className="muted" style={{ fontSize: 12, whiteSpace: "nowrap" }}>
                  {lead.assignedTo ? getAssigneeName(lead.assignedTo) : "Unassigned"}
                </div>
                {lastFollowup && (
                  <div className="muted" style={{ fontSize: 12, whiteSpace: "nowrap" }}>
                    Last: {lastFollowup.date}
                  </div>
                )}
                <div className="icon-actions" onClick={(e) => e.stopPropagation()}>
                  <button className="icon-btn" title="Edit" onClick={() => openEditLead(lead.id)}>
                    <Pencil size={14} />
                  </button>
                  <button className="icon-btn brand" title="Add Followup" onClick={() => openFollowup(lead.id)}>
                    <Plus size={14} />
                  </button>
                  <button className="icon-btn red" title="Delete" onClick={() => store.deleteLead(lead.id)}>
                    <Trash2 size={14} />
                  </button>
                  {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </div>
              </div>

              {isExpanded && (
                <div className="lead-card-body">
                  {lead.notes && (
                    <div className="muted" style={{ fontSize: 13, marginBottom: 12 }}>{lead.notes}</div>
                  )}
                  {lead.followups.length === 0 ? (
                    <div className="muted" style={{ fontSize: 13 }}>No followups yet.</div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {lead.followups.map((f) => (
                        <div className="followup-row" key={f.id}>
                          <div className="followup-dot" />
                          <div style={{ flex: 1 }}>
                            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                              <span style={{ fontWeight: 600, fontSize: 13 }}>{f.date}</span>
                              <span className={chipClass(f.type)} style={{ fontSize: 11 }}>{f.type}</span>
                              {f.outcome && <span className="muted" style={{ fontSize: 12 }}>Outcome: {f.outcome}</span>}
                            </div>
                            <div style={{ fontSize: 13, marginTop: 2 }}>{f.notes}</div>
                            {f.nextFollowupDate && (
                              <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>Next: {f.nextFollowupDate}</div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <Drawer
        open={leadDrawer}
        onClose={() => setLeadDrawer(false)}
        title={editLeadId ? "Edit Lead" : "Add Lead"}
        subtitle="Fill in the lead details"
        footer={leadFooter}
      >
        <div className="field">
          <label>Name *</label>
          <input value={leadForm.name} onChange={(e) => setL({ name: e.target.value })} placeholder="Lead name" />
        </div>
        <div className="field">
          <label>Company *</label>
          <input value={leadForm.company} onChange={(e) => setL({ company: e.target.value })} placeholder="Company" />
        </div>
        <div className="field">
          <label>Phone *</label>
          <input value={leadForm.phone} onChange={(e) => setL({ phone: e.target.value })} placeholder="+91 9XXXXXXXXX" />
        </div>
        <div className="field">
          <label>Email</label>
          <input type="email" value={leadForm.email} onChange={(e) => setL({ email: e.target.value })} placeholder="email@company.com" />
        </div>
        <div className="field-row">
          <div className="field">
            <label>Source</label>
            <select value={leadForm.source} onChange={(e) => setL({ source: e.target.value })}>
              <option>LinkedIn</option>
              <option>Referral</option>
              <option>Website</option>
              <option>Cold Outreach</option>
              <option>Event</option>
              <option>Other</option>
            </select>
          </div>
          <div className="field">
            <label>Stage</label>
            <select value={leadForm.stage} onChange={(e) => setL({ stage: e.target.value as LeadStage })}>
              {STAGES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <div className="field">
          <label>Assigned To</label>
          <select value={leadForm.assignedTo} onChange={(e) => setL({ assignedTo: e.target.value })}>
            <option value="">Unassigned</option>
            {store.teamMembers.map((m) => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>Notes</label>
          <textarea value={leadForm.notes} onChange={(e) => setL({ notes: e.target.value })} placeholder="Any notes about this lead..." rows={3} />
        </div>
      </Drawer>

      <Drawer
        open={followupDrawer}
        onClose={() => setFollowupDrawer(false)}
        title="Add Followup"
        subtitle="Log a new touchpoint for this lead"
        footer={followupFooter}
      >
        <div className="field">
          <label>Date *</label>
          <input type="date" value={followupForm.date} onChange={(e) => setF({ date: e.target.value })} />
        </div>
        <div className="field">
          <label>Type *</label>
          <select value={followupForm.type} onChange={(e) => setF({ type: e.target.value as FollowupForm["type"] })}>
            <option>Call</option>
            <option>Email</option>
            <option>Meeting</option>
            <option>WhatsApp</option>
          </select>
        </div>
        <div className="field">
          <label>Notes *</label>
          <textarea value={followupForm.notes} onChange={(e) => setF({ notes: e.target.value })} placeholder="What happened during this touchpoint?" rows={3} />
        </div>
        <div className="field">
          <label>Outcome *</label>
          <input value={followupForm.outcome} onChange={(e) => setF({ outcome: e.target.value })} placeholder="e.g. Positive, Awaiting Response, Won" />
        </div>
        <div className="field">
          <label>Next Followup Date</label>
          <input type="date" value={followupForm.nextFollowupDate} onChange={(e) => setF({ nextFollowupDate: e.target.value })} />
        </div>
      </Drawer>
    </div>
  );
}
