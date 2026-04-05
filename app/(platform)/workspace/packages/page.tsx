"use client";

import { useState } from "react";
import { useStore } from "@/lib/data/store";
import { Drawer } from "@/components/ui/drawer";
import { formatCurrency } from "@/lib/data/seed";
import { Pencil, Plus, Check } from "lucide-react";

type PackageForm = {
  name: string;
  services: string[];
  price: string;
  billing: string;
  featuresText: string;
};

const blank: PackageForm = {
  name: "",
  services: [],
  price: "",
  billing: "Monthly",
  featuresText: "",
};

export default function PackagesPage() {
  const store = useStore();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<PackageForm>(blank);

  const totalMRRPotential = store.packages.reduce((s, p) => s + p.price, 0);

  function set(patch: Partial<PackageForm>) {
    setForm((f) => ({ ...f, ...patch }));
  }

  function toggleService(name: string) {
    set({
      services: form.services.includes(name)
        ? form.services.filter((s) => s !== name)
        : [...form.services, name],
    });
  }

  function openAdd() {
    setEditId(null);
    setForm(blank);
    setDrawerOpen(true);
  }

  function openEdit(id: string) {
    const p = store.packages.find((x) => x.id === id);
    if (!p) return;
    setEditId(id);
    setForm({
      name: p.name,
      services: p.services,
      price: String(p.price),
      billing: p.billing,
      featuresText: p.features.join("\n"),
    });
    setDrawerOpen(true);
  }

  function handleSave() {
    const payload = {
      name: form.name,
      services: form.services,
      price: Number(form.price) || 0,
      billing: form.billing,
      features: form.featuresText.split("\n").map((l) => l.trim()).filter(Boolean),
    };
    if (editId) {
      store.updatePackage(editId, payload);
    } else {
      store.addPackage(payload);
    }
    setDrawerOpen(false);
  }

  const footer = (
    <div style={{ display: "flex", gap: 8 }}>
      <button className="button secondary" onClick={() => setDrawerOpen(false)}>Cancel</button>
      <button className="button" onClick={handleSave}>{editId ? "Update Package" : "Save Package"}</button>
    </div>
  );

  return (
    <div>
      <div className="topbar">
        <div>
          <h2>Packages</h2>
          <p>{store.packages.length} packages configured</p>
        </div>
        <button className="button" onClick={openAdd}>
          <Plus size={16} /> Add Package
        </button>
      </div>

      <div className="metrics two" style={{ marginBottom: 20 }}>
        <div className="card stat-mini">
          <div className="metric-label">Total Packages</div>
          <div className="metric-value">{store.packages.length}</div>
        </div>
        <div className="card stat-mini">
          <div className="metric-label">Total MRR Potential</div>
          <div className="metric-value">{formatCurrency(totalMRRPotential)}</div>
        </div>
      </div>

      <div className="grid cards-3">
        {store.packages.map((pkg) => {
          const serviceIcons = pkg.services.map((sName) => {
            const s = store.services.find((sv) => sv.name === sName);
            return s ? `${s.icon} ${sName}` : sName;
          });
          return (
            <div className="card" key={pkg.id}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ fontWeight: 700, fontSize: 16 }}>{pkg.name}</div>
                <button className="icon-btn" title="Edit" onClick={() => openEdit(pkg.id)}>
                  <Pencil size={14} />
                </button>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 8 }}>
                {serviceIcons.map((label) => (
                  <span key={label} className="chip chip-blue" style={{ fontSize: 11 }}>{label}</span>
                ))}
              </div>
              <div style={{ marginTop: 16 }}>
                <div className="metric-value" style={{ fontSize: 24 }}>{formatCurrency(pkg.price)}</div>
                <div className="metric-note muted" style={{ fontSize: 12 }}>per {pkg.billing.toLowerCase()}</div>
              </div>
              {pkg.features.length > 0 && (
                <div className="list" style={{ marginTop: 16 }}>
                  {pkg.features.map((f) => (
                    <div className="list-row" key={f} style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      <Check size={13} style={{ color: "var(--green, #22c55e)", flexShrink: 0 }} />
                      <span style={{ fontSize: 13 }}>{f}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={editId ? "Edit Package" : "Add Package"}
        subtitle={editId ? "Update package details" : "Create a new service package"}
        footer={footer}
      >
        <div className="field">
          <label>Package Name *</label>
          <input value={form.name} onChange={(e) => set({ name: e.target.value })} placeholder="e.g. Authority Builder" />
        </div>

        <div className="form-section-label">Services *</div>
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

        <div className="form-section-label">Pricing</div>
        <div className="field-row">
          <div className="field">
            <label>Price (₹) *</label>
            <input type="number" value={form.price} onChange={(e) => set({ price: e.target.value })} placeholder="0" />
          </div>
          <div className="field">
            <label>Billing *</label>
            <select value={form.billing} onChange={(e) => set({ billing: e.target.value })}>
              <option>Monthly</option>
              <option>Quarterly</option>
              <option>Annually</option>
            </select>
          </div>
        </div>

        <div className="form-section-label">Features</div>
        <div className="field">
          <label>Features (one per line)</label>
          <textarea
            value={form.featuresText}
            onChange={(e) => set({ featuresText: e.target.value })}
            placeholder={"Profile optimization\nWeekly review\nContent strategy"}
            rows={6}
          />
          <div className="field-hint">Each line becomes a feature bullet point</div>
        </div>
      </Drawer>
    </div>
  );
}
