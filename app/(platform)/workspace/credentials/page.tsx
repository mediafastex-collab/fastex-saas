"use client";

import { useState } from "react";
import { Drawer } from "@/components/ui/drawer";
import { useStore } from "@/lib/data/store";
import { Pencil, Plus, Trash2 } from "lucide-react";

const blank = {
  clientId: "",
  platform: "",
  label: "",
  username: "",
  password: "",
  url: "",
  notes: "",
};

type Form = typeof blank;

export default function CredentialsPage() {
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
    const item = store.credentials.find((credential) => credential.id === id);
    if (!item) return;
    setEditId(id);
    setForm({
      clientId: item.clientId,
      platform: item.platform,
      label: item.label,
      username: item.username,
      password: item.password,
      url: item.url,
      notes: item.notes,
    });
    setOpen(true);
  }

  function handleSave() {
    if (!form.clientId || !form.platform || !form.label) return;
    if (editId) store.updateCredential(editId, form);
    else store.addCredential(form);
    setOpen(false);
  }

  return (
    <>
      <section className="topbar">
        <div>
          <h2>Client Credentials</h2>
          <p>Platform-wise tool access, usernames, URLs, and handover notes by client.</p>
        </div>
        <div className="actions">
          <button className="button" onClick={openAdd}><Plus size={16} /> Add Credential</button>
        </div>
      </section>

      <section className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Client</th>
              <th>Platform</th>
              <th>Label</th>
              <th>Username</th>
              <th>URL</th>
              <th>Notes</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {store.credentials.map((cred) => (
              <tr key={cred.id}>
                <td>{store.clients.find((client) => client.id === cred.clientId)?.name ?? "—"}</td>
                <td>{cred.platform}</td>
                <td>{cred.label}</td>
                <td>{cred.username}</td>
                <td>{cred.url || "—"}</td>
                <td>{cred.notes || "—"}</td>
                <td>
                  <div className="icon-actions">
                    <button className="icon-btn blue" onClick={() => openEdit(cred.id)}><Pencil size={15} /></button>
                    <button className="icon-btn red" onClick={() => store.deleteCredential(cred.id)}><Trash2 size={15} /></button>
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
        title={editId ? "Edit Credential" : "Add Credential"}
        subtitle="Store client platform access in one organized place."
        footer={
          <div style={{ display: "flex", gap: 8 }}>
            <button className="button secondary" onClick={() => setOpen(false)}>Cancel</button>
            <button className="button" onClick={handleSave}>{editId ? "Update Credential" : "Save Credential"}</button>
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
          <div className="field"><label>Platform</label><input value={form.platform} onChange={(event) => patch({ platform: event.target.value })} /></div>
          <div className="field"><label>Label</label><input value={form.label} onChange={(event) => patch({ label: event.target.value })} /></div>
          <div className="field"><label>Username / Email</label><input value={form.username} onChange={(event) => patch({ username: event.target.value })} /></div>
          <div className="field"><label>Password</label><input value={form.password} onChange={(event) => patch({ password: event.target.value })} /></div>
          <div className="field"><label>URL</label><input value={form.url} onChange={(event) => patch({ url: event.target.value })} /></div>
          <div className="field"><label>Notes</label><textarea rows={4} value={form.notes} onChange={(event) => patch({ notes: event.target.value })} /></div>
        </div>
      </Drawer>
    </>
  );
}
