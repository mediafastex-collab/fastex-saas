"use client";

import { useState } from "react";
import { useStore } from "@/lib/data/store";
import { Drawer } from "@/components/ui/drawer";
import { chipClass } from "@/lib/utils";
import { Pencil, Plus, Trash2 } from "lucide-react";

type InlineForm = {
  name: string;
  phase: string;
  priority: "High" | "Medium" | "Low";
  defaultDueDays: string;
};

const blankInline: InlineForm = { name: "", phase: "Pre-Onboarding", priority: "Medium", defaultDueDays: "7" };

type ServiceForm = { name: string; icon: string };
const blankService: ServiceForm = { name: "", icon: "" };

export default function ServicesPage() {
  const store = useStore();
  const [serviceDrawer, setServiceDrawer] = useState(false);
  const [editServiceId, setEditServiceId] = useState<string | null>(null);
  const [serviceForm, setServiceForm] = useState<ServiceForm>(blankService);
  const [inlineOpen, setInlineOpen] = useState<Record<string, boolean>>({});
  const [inlineForms, setInlineForms] = useState<Record<string, InlineForm>>({});

  function setS(patch: Partial<ServiceForm>) {
    setServiceForm((f) => ({ ...f, ...patch }));
  }

  function openAddService() {
    setEditServiceId(null);
    setServiceForm(blankService);
    setServiceDrawer(true);
  }

  function openEditService(id: string) {
    const s = store.services.find((x) => x.id === id);
    if (!s) return;
    setEditServiceId(id);
    setServiceForm({ name: s.name, icon: s.icon });
    setServiceDrawer(true);
  }

  function saveService() {
    if (editServiceId) {
      store.updateService(editServiceId, serviceForm);
    } else {
      store.addService(serviceForm);
    }
    setServiceDrawer(false);
  }

  function toggleInline(serviceId: string) {
    setInlineOpen((prev) => ({ ...prev, [serviceId]: !prev[serviceId] }));
    setInlineForms((prev) => ({ ...prev, [serviceId]: blankInline }));
  }

  function setInline(serviceId: string, patch: Partial<InlineForm>) {
    setInlineForms((prev) => ({
      ...prev,
      [serviceId]: { ...prev[serviceId], ...patch },
    }));
  }

  function saveChecklist(serviceName: string, serviceId: string) {
    const f = inlineForms[serviceId];
    if (!f || !f.name) return;
    store.addChecklist({
      service: serviceName,
      name: f.name,
      phase: f.phase,
      priority: f.priority as "High" | "Medium" | "Low",
      defaultDueDays: Number(f.defaultDueDays) || 7,
    });
    setInlineOpen((prev) => ({ ...prev, [serviceId]: false }));
  }

  const serviceFooter = (
    <div style={{ display: "flex", gap: 8 }}>
      <button className="button secondary" onClick={() => setServiceDrawer(false)}>Cancel</button>
      <button className="button" onClick={saveService}>{editServiceId ? "Update Service" : "Add Service"}</button>
    </div>
  );

  return (
    <div>
      <div className="topbar">
        <div>
          <h2>Services</h2>
          <p>{store.services.length} services configured</p>
        </div>
        <button className="button" onClick={openAddService}>
          <Plus size={16} /> Add Service
        </button>
      </div>

      <div className="grid cards-3">
        {store.services.map((service) => {
          const pkgCount = store.packages.filter((p) => p.services.includes(service.name)).length;
          const clientCount = store.clients.filter((c) => c.services.includes(service.name)).length;
          const items = store.checklists.filter((cl) => cl.service === service.name);
          const showInline = inlineOpen[service.id];
          const inlineForm = inlineForms[service.id] ?? blankInline;

          return (
            <div className="card" key={service.id}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontSize: 32, marginBottom: 4 }}>{service.icon}</div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{service.name}</div>
                  <div className="card-subtitle" style={{ marginTop: 4 }}>
                    {pkgCount} package{pkgCount !== 1 ? "s" : ""} · {clientCount} client{clientCount !== 1 ? "s" : ""}
                  </div>
                </div>
                <button className="icon-btn" title="Edit Service" onClick={() => openEditService(service.id)}>
                  <Pencil size={14} />
                </button>
              </div>

              {items.length > 0 && (
                <div className="list" style={{ marginTop: 16 }}>
                  {items.map((item) => (
                    <div className="list-row" key={item.id} style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                      <span style={{ flex: 1, fontSize: 13 }}>{item.name}</span>
                      <span className={chipClass(item.phase)} style={{ fontSize: 11 }}>{item.phase}</span>
                      <span className={chipClass(item.priority)} style={{ fontSize: 11 }}>{item.priority}</span>
                      <span className="muted" style={{ fontSize: 11 }}>{item.defaultDueDays}d</span>
                      <button className="icon-btn red" title="Delete" onClick={() => store.deleteChecklist(item.id)} style={{ padding: 2 }}>
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {showInline ? (
                <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
                  <div className="field" style={{ margin: 0 }}>
                    <input
                      value={inlineForm.name}
                      onChange={(e) => setInline(service.id, { name: e.target.value })}
                      placeholder="Checklist item name"
                      style={{ fontSize: 13 }}
                    />
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <select
                      value={inlineForm.phase}
                      onChange={(e) => setInline(service.id, { phase: e.target.value })}
                      style={{ flex: 1, fontSize: 12 }}
                    >
                      <option>Pre-Onboarding</option>
                      <option>Onboarding</option>
                      <option>In Progress</option>
                      <option>Review</option>
                      <option>Completed</option>
                    </select>
                    <select
                      value={inlineForm.priority}
                      onChange={(e) => setInline(service.id, { priority: e.target.value as "High" | "Medium" | "Low" })}
                      style={{ flex: 1, fontSize: 12 }}
                    >
                      <option>High</option>
                      <option>Medium</option>
                      <option>Low</option>
                    </select>
                    <input
                      type="number"
                      value={inlineForm.defaultDueDays}
                      onChange={(e) => setInline(service.id, { defaultDueDays: e.target.value })}
                      placeholder="Days"
                      style={{ width: 60, fontSize: 12 }}
                    />
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button className="button" style={{ flex: 1, padding: "6px 0", fontSize: 13 }} onClick={() => saveChecklist(service.name, service.id)}>Save</button>
                    <button className="button secondary" style={{ flex: 1, padding: "6px 0", fontSize: 13 }} onClick={() => toggleInline(service.id)}>Cancel</button>
                  </div>
                </div>
              ) : (
                <button
                  className="button secondary"
                  style={{ marginTop: 12, width: "100%", fontSize: 13 }}
                  onClick={() => toggleInline(service.id)}
                >
                  <Plus size={13} /> Add checklist item
                </button>
              )}
            </div>
          );
        })}
      </div>

      <Drawer
        open={serviceDrawer}
        onClose={() => setServiceDrawer(false)}
        title={editServiceId ? "Edit Service" : "Add Service"}
        subtitle={editServiceId ? "Update service details" : "Add a new service to your workspace"}
        footer={serviceFooter}
      >
        <div className="field">
          <label>Service Name *</label>
          <input value={serviceForm.name} onChange={(e) => setS({ name: e.target.value })} placeholder="e.g. LinkedIn Personal Branding" />
        </div>
        <div className="field">
          <label>Icon (emoji) *</label>
          <input value={serviceForm.icon} onChange={(e) => setS({ icon: e.target.value })} placeholder="e.g. 💼" maxLength={4} />
          <div className="field-hint">Enter a single emoji to represent this service</div>
        </div>
      </Drawer>
    </div>
  );
}
