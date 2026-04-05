"use client";

import { useState } from "react";
import { Drawer } from "@/components/ui/drawer";
import { useStore } from "@/lib/data/store";
import { frameworkTypes } from "@/lib/data/seed";
import { Pencil, Plus, Trash2 } from "lucide-react";

const blank = {
  type: "Onboarding",
  name: "",
  content: "",
};

type Form = typeof blank;

export default function FrameworksPage() {
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
    const item = store.frameworks.find((framework) => framework.id === id);
    if (!item) return;
    setEditId(id);
    setForm({ type: item.type, name: item.name, content: item.content });
    setOpen(true);
  }

  function handleSave() {
    if (!form.name || !form.content) return;
    if (editId) store.updateFramework(editId, form);
    else store.addFramework(form);
    setOpen(false);
  }

  return (
    <>
      <section className="topbar">
        <div>
          <h2>Frameworks</h2>
          <p>Reusable messaging blocks for onboarding, offboarding, invoices, and payment follow-ups.</p>
        </div>
        <div className="actions">
          <button className="button" onClick={openAdd}><Plus size={16} /> Add Framework</button>
        </div>
      </section>

      <section className="grid cards-3">
        {frameworkTypes.map((type) => (
          <article className="card" key={type}>
            <h3>{type}</h3>
            <div className="list" style={{ marginTop: 14 }}>
              {store.frameworks.filter((framework) => framework.type === type).map((framework) => (
                <div className="list-row" key={framework.id}>
                  <div>
                    <strong>{framework.name}</strong>
                    <span className="muted">{framework.content}</span>
                  </div>
                  <div className="icon-actions">
                    <button className="icon-btn blue" onClick={() => openEdit(framework.id)}><Pencil size={15} /></button>
                    <button className="icon-btn red" onClick={() => store.deleteFramework(framework.id)}><Trash2 size={15} /></button>
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
        title={editId ? "Edit Framework" : "Add Framework"}
        subtitle="Save reusable client communication templates for repeatable actions."
        footer={
          <div style={{ display: "flex", gap: 8 }}>
            <button className="button secondary" onClick={() => setOpen(false)}>Cancel</button>
            <button className="button" onClick={handleSave}>{editId ? "Update Framework" : "Save Framework"}</button>
          </div>
        }
      >
        <div className="stack">
          <div className="field">
            <label>Type</label>
            <select value={form.type} onChange={(event) => patch({ type: event.target.value })}>
              {frameworkTypes.map((type) => <option key={type}>{type}</option>)}
            </select>
          </div>
          <div className="field"><label>Name</label><input value={form.name} onChange={(event) => patch({ name: event.target.value })} /></div>
          <div className="field"><label>Content</label><textarea rows={7} value={form.content} onChange={(event) => patch({ content: event.target.value })} /></div>
        </div>
      </Drawer>
    </>
  );
}
