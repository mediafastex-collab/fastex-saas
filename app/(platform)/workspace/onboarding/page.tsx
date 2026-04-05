"use client";

import { useMemo, useState } from "react";
import { Drawer } from "@/components/ui/drawer";
import { useStore } from "@/lib/data/store";
import { chipClass } from "@/lib/utils";
import { Plus, Pencil, Trash2 } from "lucide-react";

type Form = {
  clientId: string;
  service: string;
  name: string;
  phase: string;
  due: string;
  priority: "High" | "Medium" | "Low";
  assignedTo: string;
  taskStatus: "Pending" | "In Progress" | "Awaiting Approval" | "Approved" | "Done" | "Rejected";
  approvalNote: string;
};

const blank: Form = {
  clientId: "",
  service: "",
  name: "",
  phase: "Onboarding",
  due: "",
  priority: "Medium",
  assignedTo: "",
  taskStatus: "Pending",
  approvalNote: "",
};

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export default function OnboardingPage() {
  const store = useStore();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<Form>({ ...blank, due: todayIso() });

  const dueToday = useMemo(() => store.tasks.filter((task) => !task.done && task.due === todayIso()).length, [store.tasks]);
  const overdue = useMemo(() => store.tasks.filter((task) => !task.done && task.due < todayIso()).length, [store.tasks]);
  const upcomingWeek = useMemo(() => {
    const future = new Date();
    future.setDate(future.getDate() + 7);
    const futureIso = future.toISOString().slice(0, 10);
    return store.tasks.filter((task) => !task.done && task.due > todayIso() && task.due <= futureIso).length;
  }, [store.tasks]);

  function patch(next: Partial<Form>) {
    setForm((current) => ({ ...current, ...next }));
  }

  function openAdd() {
    setEditId(null);
    setForm({ ...blank, due: todayIso() });
    setOpen(true);
  }

  function openEdit(id: string) {
    const item = store.tasks.find((task) => task.id === id);
    if (!item) return;
    setEditId(id);
    setForm({
      clientId: item.clientId,
      service: item.service,
      name: item.name,
      phase: item.phase,
      due: item.due,
      priority: item.priority,
      assignedTo: item.assignedTo,
      taskStatus: item.taskStatus,
      approvalNote: item.approvalNote,
    });
    setOpen(true);
  }

  function handleSave() {
    if (!form.clientId || !form.service || !form.name) return;
    const payload = {
      clientId: form.clientId,
      service: form.service,
      name: form.name,
      phase: form.phase,
      due: form.due,
      priority: form.priority,
      done: form.taskStatus === "Done",
      assignedTo: form.assignedTo,
      taskStatus: form.taskStatus,
      submittedForApproval: form.taskStatus === "Awaiting Approval",
      approvalNote: form.approvalNote,
    };
    if (editId) store.updateTask(editId, payload);
    else store.addTask(payload);
    setOpen(false);
  }

  return (
    <>
      <section className="topbar">
        <div>
          <h2>Onboarding Master</h2>
          <p>Client-wise onboarding tasks with deadline logic, priorities, and phase tracking.</p>
        </div>
        <div className="actions">
          <button className="button secondary" onClick={() => window.location.assign("/workspace/checklists")}>Templates</button>
          <button className="button" onClick={openAdd}><Plus size={16} /> New Task</button>
        </div>
      </section>

      <section className="grid cards-3">
        <article className="card"><div className="metric-label">Due today</div><div className="metric-value">{dueToday}</div></article>
        <article className="card"><div className="metric-label">Upcoming week</div><div className="metric-value">{upcomingWeek}</div></article>
        <article className="card"><div className="metric-label">Overdue</div><div className="metric-value">{overdue}</div></article>
      </section>

      <section className="card">
        <div className="list">
          {store.clients.map((client) => {
            const clientTasks = store.tasks.filter((task) => task.clientId === client.id);
            if (!clientTasks.length) return null;
            return (
              <div className="list-row list-row-col" key={client.id}>
                <div>
                  <strong>{client.name} · {client.company}</strong>
                  <span className="muted">{client.services.join(", ")}</span>
                </div>
                <div className="list" style={{ width: "100%", marginTop: 8 }}>
                  {clientTasks.map((task) => (
                    <div className="list-row" key={task.id}>
                      <div>
                        <strong>{task.name}</strong>
                        <span className="muted">{task.service} · {task.phase} · {task.priority} · Due {task.due}</span>
                      </div>
                      <div className="icon-actions">
                        <span className={chipClass(task.taskStatus)}>{task.taskStatus}</span>
                        <button className="icon-btn blue" onClick={() => openEdit(task.id)}><Pencil size={15} /></button>
                        <button className="icon-btn red" onClick={() => store.deleteTask(task.id)}><Trash2 size={15} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        title={editId ? "Edit Onboarding Task" : "Add Onboarding Task"}
        subtitle="Track task phase, priority, status, assignment, and due date."
        footer={
          <div style={{ display: "flex", gap: 8 }}>
            <button className="button secondary" onClick={() => setOpen(false)}>Cancel</button>
            <button className="button" onClick={handleSave}>{editId ? "Update Task" : "Save Task"}</button>
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
          <div className="field">
            <label>Service</label>
            <select value={form.service} onChange={(event) => patch({ service: event.target.value })}>
              <option value="">Select service</option>
              {store.services.map((service) => <option key={service.id} value={service.name}>{service.name}</option>)}
            </select>
          </div>
          <div className="field"><label>Task Name</label><input value={form.name} onChange={(event) => patch({ name: event.target.value })} /></div>
          <div className="field"><label>Phase</label><input value={form.phase} onChange={(event) => patch({ phase: event.target.value })} /></div>
          <div className="field"><label>Due Date</label><input type="date" value={form.due} onChange={(event) => patch({ due: event.target.value })} /></div>
          <div className="field">
            <label>Priority</label>
            <select value={form.priority} onChange={(event) => patch({ priority: event.target.value as Form["priority"] })}>
              <option value="High">High</option><option value="Medium">Medium</option><option value="Low">Low</option>
            </select>
          </div>
          <div className="field">
            <label>Assigned To</label>
            <select value={form.assignedTo} onChange={(event) => patch({ assignedTo: event.target.value })}>
              <option value="">Unassigned</option>
              {store.teamMembers.map((member) => <option key={member.id} value={member.id}>{member.name}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Status</label>
            <select value={form.taskStatus} onChange={(event) => patch({ taskStatus: event.target.value as Form["taskStatus"] })}>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Awaiting Approval">Awaiting Approval</option>
              <option value="Approved">Approved</option>
              <option value="Done">Done</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
          <div className="field"><label>Approval Note</label><textarea rows={3} value={form.approvalNote} onChange={(event) => patch({ approvalNote: event.target.value })} /></div>
        </div>
      </Drawer>
    </>
  );
}
