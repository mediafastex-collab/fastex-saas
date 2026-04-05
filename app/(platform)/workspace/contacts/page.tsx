"use client";

import { useState } from "react";
import { Drawer } from "@/components/ui/drawer";
import { useStore } from "@/lib/data/store";
import { Plus, Pencil, Trash2 } from "lucide-react";

const blank = {
  clientId: "",
  name: "",
  role: "",
  email: "",
  phone: "",
  preferred: "WhatsApp",
  last: "",
};

type Form = typeof blank;

export default function ContactsPage() {
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
    const item = store.contacts.find((contact) => contact.id === id);
    if (!item) return;
    setEditId(id);
    setForm({
      clientId: item.clientId,
      name: item.name,
      role: item.role,
      email: item.email,
      phone: item.phone,
      preferred: item.preferred,
      last: item.last,
    });
    setOpen(true);
  }

  function handleSave() {
    if (!form.clientId || !form.name) return;
    if (editId) {
      store.updateContact(editId, form);
    } else {
      store.addContact(form);
    }
    setOpen(false);
  }

  return (
    <>
      <section className="topbar">
        <div>
          <h2>Contacts</h2>
          <p>Decision makers, billing contacts, preferred channels, and relationship notes.</p>
        </div>
        <div className="actions">
          <button className="button" onClick={openAdd}><Plus size={16} /> Add Contact</button>
        </div>
      </section>

      <section className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Contact</th>
              <th>Company</th>
              <th>Role</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Preferred</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {store.contacts.map((contact) => (
              <tr key={contact.id}>
                <td>
                  <strong>{contact.name}</strong>
                  <span className="muted">Last contact: {contact.last || "—"}</span>
                </td>
                <td>{store.clients.find((client) => client.id === contact.clientId)?.company ?? "—"}</td>
                <td>{contact.role}</td>
                <td>{contact.email}</td>
                <td>{contact.phone}</td>
                <td>{contact.preferred}</td>
                <td>
                  <div className="icon-actions">
                    <button className="icon-btn blue" onClick={() => openEdit(contact.id)}><Pencil size={15} /></button>
                    <button className="icon-btn red" onClick={() => store.deleteContact(contact.id)}><Trash2 size={15} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        title={editId ? "Edit Contact" : "Add Contact"}
        subtitle="Keep key decision makers and billing contacts organized."
        footer={
          <div style={{ display: "flex", gap: 8 }}>
            <button className="button secondary" onClick={() => setOpen(false)}>Cancel</button>
            <button className="button" onClick={handleSave}>{editId ? "Update Contact" : "Save Contact"}</button>
          </div>
        }
      >
        <div className="stack">
          <div className="field">
            <label>Client</label>
            <select value={form.clientId} onChange={(event) => patch({ clientId: event.target.value })}>
              <option value="">Select client</option>
              {store.clients.map((client) => (
                <option key={client.id} value={client.id}>{client.name} · {client.company}</option>
              ))}
            </select>
          </div>
          <div className="field"><label>Contact Name</label><input value={form.name} onChange={(event) => patch({ name: event.target.value })} /></div>
          <div className="field"><label>Role</label><input value={form.role} onChange={(event) => patch({ role: event.target.value })} /></div>
          <div className="field"><label>Email</label><input value={form.email} onChange={(event) => patch({ email: event.target.value })} /></div>
          <div className="field"><label>Phone</label><input value={form.phone} onChange={(event) => patch({ phone: event.target.value })} /></div>
          <div className="field">
            <label>Preferred Channel</label>
            <select value={form.preferred} onChange={(event) => patch({ preferred: event.target.value })}>
              <option>WhatsApp</option>
              <option>Email</option>
              <option>Call</option>
              <option>LinkedIn</option>
            </select>
          </div>
          <div className="field"><label>Last Contact Date</label><input type="date" value={form.last} onChange={(event) => patch({ last: event.target.value })} /></div>
        </div>
      </Drawer>
    </>
  );
}
