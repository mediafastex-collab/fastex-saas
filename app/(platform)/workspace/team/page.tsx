"use client";

import { useState } from "react";
import { Drawer } from "@/components/ui/drawer";
import { useStore } from "@/lib/data/store";
import { Pencil, Plus, Trash2 } from "lucide-react";

type Form = {
  name: string;
  role: string;
  workspaceRole: "owner" | "admin" | "manager" | "team_member";
  email: string;
  phone: string;
};

const blank: Form = {
  name: "",
  role: "",
  workspaceRole: "team_member",
  email: "",
  phone: "",
};

export default function TeamPage() {
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
    const item = store.teamMembers.find((member) => member.id === id);
    if (!item) return;
    setEditId(id);
    setForm({
      name: item.name,
      role: item.role,
      workspaceRole: item.workspaceRole,
      email: item.email,
      phone: item.phone || "",
    });
    setOpen(true);
  }

  function handleSave() {
    if (!form.name || !form.email) return;
    if (editId) store.updateTeamMember(editId, form);
    else store.addTeamMember(form);
    setOpen(false);
  }

  return (
    <>
      <section className="topbar">
        <div>
          <h2>Team Members</h2>
          <p>Assign team members to clients and track who owns which accounts.</p>
        </div>
        <div className="actions">
          <button className="button" onClick={openAdd}><Plus size={16} /> Add Team Member</button>
        </div>
      </section>

      <section className="grid cards-3">
        {store.teamMembers.map((member) => (
          <article className="card" key={member.id}>
            <div className="card-header">
              <div>
                <h3>{member.name}</h3>
                <p className="card-subtitle">{member.role} · {member.email}</p>
              </div>
              <div className="icon-actions">
                <button className="icon-btn blue" onClick={() => openEdit(member.id)}><Pencil size={15} /></button>
                <button className="icon-btn red" onClick={() => store.deleteTeamMember(member.id)}><Trash2 size={15} /></button>
              </div>
            </div>
            <div className="list" style={{ marginTop: 14 }}>
              <div className="list-row">
                <div>
                  <strong>Assigned clients</strong>
                  <span className="muted">
                    {store.clients.filter((client) => client.teamMemberIds.includes(member.id)).map((client) => client.name).join(", ") || "None yet"}
                  </span>
                </div>
              </div>
            </div>
          </article>
        ))}
      </section>

      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        title={editId ? "Edit Team Member" : "Add Team Member"}
        subtitle="Keep delivery ownership and internal roles simple."
        footer={
          <div style={{ display: "flex", gap: 8 }}>
            <button className="button secondary" onClick={() => setOpen(false)}>Cancel</button>
            <button className="button" onClick={handleSave}>{editId ? "Update Team Member" : "Save Team Member"}</button>
          </div>
        }
      >
        <div className="stack">
          <div className="field"><label>Name</label><input value={form.name} onChange={(event) => patch({ name: event.target.value })} /></div>
          <div className="field"><label>Job Role</label><input value={form.role} onChange={(event) => patch({ role: event.target.value })} /></div>
          <div className="field">
            <label>Workspace Role</label>
            <select value={form.workspaceRole} onChange={(event) => patch({ workspaceRole: event.target.value as Form["workspaceRole"] })}>
              <option value="owner">Owner</option>
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="team_member">Team Member</option>
            </select>
          </div>
          <div className="field"><label>Email</label><input value={form.email} onChange={(event) => patch({ email: event.target.value })} /></div>
          <div className="field"><label>Phone</label><input value={form.phone} onChange={(event) => patch({ phone: event.target.value })} /></div>
        </div>
      </Drawer>
    </>
  );
}
