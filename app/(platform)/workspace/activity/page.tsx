"use client";

import { useState } from "react";
import { Drawer } from "@/components/ui/drawer";
import { useStore } from "@/lib/data/store";
import { crmStages } from "@/lib/data/seed";
import { chipClass } from "@/lib/utils";
import { Pencil, Plus, Trash2 } from "lucide-react";

const blank = {
  clientId: "",
  title: "",
  type: "New Lead",
  date: new Date().toISOString().slice(0, 10),
  outcome: "",
  next: "",
};

type Form = typeof blank;

export default function ActivityPage() {
  const store = useStore();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<Form>(blank);

  function patch(next: Partial<Form>) {
    setForm((current) => ({ ...current, ...next }));
  }

  function openAdd() {
    setEditId(null);
    setForm(blank);
    setOpen(true);
  }

  function openEdit(id: string) {
    const item = store.activity.find((entry) => entry.id === id);
    if (!item) return;
    setEditId(id);
    setForm({
      clientId: item.clientId,
      title: item.title,
      type: item.type,
      date: item.date,
      outcome: item.outcome,
      next: item.next,
    });
    setOpen(true);
  }

  function handleSave() {
    if (!form.clientId || !form.title) return;
    if (editId) store.updateActivity(editId, form);
    else store.addActivity(form);
    setOpen(false);
  }

  return (
    <>
      <section className="topbar">
        <div>
          <h2>Activity Log</h2>
          <p>CRM board with new lead, call done, client meeting, deal lost, and deal won stages.</p>
        </div>
        <div className="actions">
          <button className="button" onClick={openAdd}><Plus size={16} /> Log Activity</button>
        </div>
      </section>

      <section className="grid cards-3">
        {crmStages.map((stage) => (
          <article className="card" key={stage}>
            <div className="card-header" style={{ marginBottom: 12 }}>
              <h3>{stage}</h3>
              <span className={chipClass(stage)}>{store.activity.filter((entry) => entry.type === stage).length}</span>
            </div>
            <div className="list">
              {store.activity.filter((entry) => entry.type === stage).map((entry) => (
                <div className="list-row" key={entry.id}>
                  <div>
                    <strong>{entry.title}</strong>
                    <span className="muted">{store.clients.find((client) => client.id === entry.clientId)?.name ?? "—"} · {entry.date}</span>
                    <span className="muted">{entry.outcome}</span>
                  </div>
                  <div className="icon-actions">
                    <button className="icon-btn blue" onClick={() => openEdit(entry.id)}><Pencil size={15} /></button>
                    <button className="icon-btn red" onClick={() => store.deleteActivity(entry.id)}><Trash2 size={15} /></button>
                  </div>
                </div>
              ))}
            </div>
          </article>
        ))}
      </section>

      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        title={editId ? "Edit Activity" : "Log Activity"}
        subtitle="Capture CRM movement and next follow-up from one place."
        footer={
          <div style={{ display: "flex", gap: 8 }}>
            <button className="button secondary" onClick={() => setOpen(false)}>Cancel</button>
            <button className="button" onClick={handleSave}>{editId ? "Update Activity" : "Save Activity"}</button>
          </div>
        }
      >
        <div className="stack">
          <div className="field">
            <label>Client</label>
            <select value={form.clientId} onChange={(event) => patch({ clientId: event.target.value })}>
              <option value="">Select client</option>
              {store.clients.map((client) => <option key={client.id} value={client.id}>{client.name} · {client.company}</option>)}
            </select>
          </div>
          <div className="field"><label>Title</label><input value={form.title} onChange={(event) => patch({ title: event.target.value })} /></div>
          <div className="field"><label>Stage</label><select value={form.type} onChange={(event) => patch({ type: event.target.value })}>{crmStages.map((stage) => <option key={stage}>{stage}</option>)}</select></div>
          <div className="field"><label>Date</label><input type="date" value={form.date} onChange={(event) => patch({ date: event.target.value })} /></div>
          <div className="field"><label>Outcome</label><input value={form.outcome} onChange={(event) => patch({ outcome: event.target.value })} /></div>
          <div className="field"><label>Next Step</label><textarea rows={3} value={form.next} onChange={(event) => patch({ next: event.target.value })} /></div>
        </div>
      </Drawer>
    </>
  );
}
