"use client";

import { useState } from "react";
import { Drawer } from "@/components/ui/drawer";
import { useStore } from "@/lib/data/store";
import { formatCurrency, gstAmount, subtotal, totalAmount } from "@/lib/data/seed";
import { chipClass } from "@/lib/utils";
import { Pencil, Plus, Trash2 } from "lucide-react";

type QuoteForm = {
  clientId: string;
  issue: string;
  validUntil: string;
  status: string;
  theme: string;
  discount: string;
  notes: string;
  items: Array<{ description: string; qty: string; rate: string }>;
};

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function blankQuote(): QuoteForm {
  return {
    clientId: "",
    issue: todayIso(),
    validUntil: todayIso(),
    status: "Draft",
    theme: "classic",
    discount: "0",
    notes: "",
    items: [{ description: "", qty: "1", rate: "0" }],
  };
}

export default function QuotationsPage() {
  const store = useStore();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<QuoteForm>(blankQuote);

  function patch(next: Partial<QuoteForm>) {
    setForm((current) => ({ ...current, ...next }));
  }

  function openAdd() {
    setEditId(null);
    setForm(blankQuote());
    setOpen(true);
  }

  function openEdit(id: string) {
    const item = store.quotations.find((quotation) => quotation.id === id);
    if (!item) return;
    setEditId(id);
    setForm({
      clientId: item.clientId,
      issue: item.issue,
      validUntil: item.validUntil,
      status: item.status,
      theme: item.theme,
      discount: String(item.discount),
      notes: item.notes,
      items: item.items.map((entry) => ({ description: entry.description, qty: String(entry.qty), rate: String(entry.rate) })),
    });
    setOpen(true);
  }

  function updateItem(index: number, patchItem: Partial<{ description: string; qty: string; rate: string }>) {
    setForm((current) => ({
      ...current,
      items: current.items.map((item, itemIndex) => itemIndex === index ? { ...item, ...patchItem } : item),
    }));
  }

  function addItem() {
    setForm((current) => ({ ...current, items: [...current.items, { description: "", qty: "1", rate: "0" }] }));
  }

  function removeItem(index: number) {
    setForm((current) => ({ ...current, items: current.items.filter((_, itemIndex) => itemIndex !== index) }));
  }

  function handleSave() {
    if (!form.clientId) return;
    const payload = {
      clientId: form.clientId,
      issue: form.issue,
      validUntil: form.validUntil,
      status: form.status,
      theme: form.theme,
      discount: Number(form.discount) || 0,
      notes: form.notes,
      items: form.items.filter((item) => item.description.trim()).map((item) => ({
        description: item.description.trim(),
        qty: Number(item.qty) || 1,
        rate: Number(item.rate) || 0,
      })),
    };
    if (editId) store.updateQuotation(editId, payload);
    else store.addQuotation(payload);
    setOpen(false);
  }

  return (
    <>
      <section className="topbar">
        <div>
          <h2>Quotations</h2>
          <p>Theme-based quotations with discounts, GST totals, and validity dates.</p>
        </div>
        <div className="actions">
          <button className="button secondary" onClick={() => window.location.assign("/workspace/finance")}>Finance Master</button>
          <button className="button" onClick={openAdd}><Plus size={16} /> New Quotation</button>
        </div>
      </section>

      <section className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Quotation</th>
              <th>Client</th>
              <th>Issue</th>
              <th>Valid Until</th>
              <th>Subtotal</th>
              <th>GST</th>
              <th>Discount</th>
              <th>Total</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {store.quotations.map((quotation) => (
              <tr key={quotation.id}>
                <td>
                  <strong>{quotation.num}</strong>
                  <span className="muted">{quotation.theme} theme</span>
                </td>
                <td>{store.clients.find((client) => client.id === quotation.clientId)?.name ?? "—"}</td>
                <td>{quotation.issue}</td>
                <td>{quotation.validUntil}</td>
                <td>{formatCurrency(subtotal(quotation.items))}</td>
                <td>{formatCurrency(gstAmount(quotation.items, quotation.discount, true))}</td>
                <td>{quotation.discount ? formatCurrency(quotation.discount) : "—"}</td>
                <td>{formatCurrency(totalAmount(quotation.items, quotation.discount, true))}</td>
                <td><span className={chipClass(quotation.status)}>{quotation.status}</span></td>
                <td>
                  <div className="icon-actions">
                    <button className="icon-btn blue" onClick={() => openEdit(quotation.id)}><Pencil size={15} /></button>
                    <button className="icon-btn red" onClick={() => store.deleteQuotation(quotation.id)}><Trash2 size={15} /></button>
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
        title={editId ? "Edit Quotation" : "New Quotation"}
        subtitle="Create commercial proposals with line items, theme, discount, and validity."
        footer={
          <div style={{ display: "flex", gap: 8 }}>
            <button className="button secondary" onClick={() => setOpen(false)}>Cancel</button>
            <button className="button" onClick={handleSave}>{editId ? "Update Quotation" : "Save Quotation"}</button>
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
          <div className="field"><label>Issue Date</label><input type="date" value={form.issue} onChange={(event) => patch({ issue: event.target.value })} /></div>
          <div className="field"><label>Valid Until</label><input type="date" value={form.validUntil} onChange={(event) => patch({ validUntil: event.target.value })} /></div>
          <div className="field"><label>Theme</label><select value={form.theme} onChange={(event) => patch({ theme: event.target.value })}><option value="classic">Classic</option><option value="minimal">Minimal</option><option value="bold">Bold</option></select></div>
          <div className="field"><label>Status</label><select value={form.status} onChange={(event) => patch({ status: event.target.value })}><option>Draft</option><option>Sent</option><option>Approved</option><option>Rejected</option></select></div>
          <div className="field"><label>Discount</label><input type="number" value={form.discount} onChange={(event) => patch({ discount: event.target.value })} /></div>
          <div className="field"><label>Notes</label><textarea rows={3} value={form.notes} onChange={(event) => patch({ notes: event.target.value })} /></div>
          <div className="stack">
            {form.items.map((item, index) => (
              <div className="card" key={`q-item-${index}`}>
                <div className="field"><label>Description</label><input value={item.description} onChange={(event) => updateItem(index, { description: event.target.value })} /></div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 10 }}>
                  <div className="field"><label>Qty</label><input type="number" value={item.qty} onChange={(event) => updateItem(index, { qty: event.target.value })} /></div>
                  <div className="field"><label>Rate</label><input type="number" value={item.rate} onChange={(event) => updateItem(index, { rate: event.target.value })} /></div>
                  <button className="button secondary" type="button" style={{ alignSelf: "end" }} onClick={() => removeItem(index)}>Remove</button>
                </div>
              </div>
            ))}
            <button className="button secondary" type="button" onClick={addItem}>Add Line Item</button>
          </div>
        </div>
      </Drawer>
    </>
  );
}
