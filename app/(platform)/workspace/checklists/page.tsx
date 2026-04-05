"use client";

import { useState } from "react";
import { Drawer } from "@/components/ui/drawer";
import { useStore } from "@/lib/data/store";
import { Pencil, Plus, Trash2 } from "lucide-react";

type Form = {
  service: string;
  name: string;
  phase: string;
  priority: "High" | "Medium" | "Low";
  defaultDueDays: string;
};

const blank: Form = {
  service: "",
  name: "",
  phase: "Onboarding",
  priority: "Medium",
  defaultDueDays: "7",
};

export default function ChecklistsPage() {
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
    const item = store.checklists.find((template) => template.id === id);
    if (!item) return;
    setEditId(id);
    setForm({
      service: item.service,
      name: item.name,
      phase: item.phase,
      priority: item.priority,
      defaultDueDays: String(item.defaultDueDays),
    });
    setOpen(true);
  }

  function handleSave() {
    if (!form.service || !form.name) return;
    const payload = {
      service: form.service,
      name: form.name,
      phase: form.phase,
      priority: form.priority,
      defaultDueDays: Number(form.defaultDueDays) || 7,
    };
    if (editId) store.updateChecklist(editId, payload);
    else store.addChecklist(payload);
    setOpen(false);
  }

  return (
    <>
      <section className="topbar">
        <div>
          <h2>Checklist Templates</h2>
          <p>Reusable service-wise onboarding structure that powers client task creation.</p>
        </div>
        <div className="actions">
          <button className="button" onClick={openAdd}><Plus size={16} /> New Template</button>
        </div>
      </section>

      <section className="grid cards-3">
        {store.services.map((service) => (
          <article className="card" key={service.id}>
            <h3>{service.icon} {service.name}</h3>
            <div className="list" style={{ marginTop: 14 }}>
              {store.checklists.filter((template) => template.service === service.name).map((template) => (
                <div className="list-row" key={template.id}>
                  <div>
                    <strong>{template.name}</strong>
                    <span className="muted">{template.phase} · {template.priority} · Default due {template.defaultDueDays} day(s)</span>
                  </div>
                  <div className="icon-actions">
                    <button className="icon-btn blue" onClick={() => openEdit(template.id)}><Pencil size={15} /></button>
                    <button className="icon-btn red" onClick={() => store.deleteChecklist(template.id)}><Trash2 size={15} /></button>
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
        title={editId ? "Edit Template" : "Add Checklist Template"}
        subtitle="Set service-wise default onboarding tasks and due-day logic."
        footer={
          <div style={{ display: "flex", gap: 8 }}>
            <button className="button secondary" onClick={() => setOpen(false)}>Cancel</button>
            <button className="button" onClick={handleSave}>{editId ? "Update Template" : "Save Template"}</button>
          </div>
        }
      >
        <div className="stack">
          <div className="field">
            <label>Service</label>
            <select value={form.service} onChange={(event) => patch({ service: event.target.value })}>
              <option value="">Select service</option>
              {store.services.map((service) => (
                <option key={service.id} value={service.name}>{service.name}</option>
              ))}
            </select>
          </div>
          <div className="field"><label>Task Name</label><input value={form.name} onChange={(event) => patch({ name: event.target.value })} /></div>
          <div className="field"><label>Phase</label><input value={form.phase} onChange={(event) => patch({ phase: event.target.value })} /></div>
          <div className="field">
            <label>Priority</label>
            <select value={form.priority} onChange={(event) => patch({ priority: event.target.value as Form["priority"] })}>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
          <div className="field"><label>Default Due Days</label><input type="number" value={form.defaultDueDays} onChange={(event) => patch({ defaultDueDays: event.target.value })} /></div>
        </div>
      </Drawer>
    </>
  );
}
