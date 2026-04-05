"use client";

import { useMemo, useState } from "react";
import { ActionLink } from "@/components/ui/action-link";
import { Drawer } from "@/components/ui/drawer";
import { useStore } from "@/lib/data/store";
import { chipClass } from "@/lib/utils";
import { formatCurrency, totalAmount, subtotal, gstAmount } from "@/lib/data/seed";
import { Plus, ReceiptIndianRupee } from "lucide-react";

type InvoiceForm = {
  clientId: string;
  issue: string;
  duePreset: string;
  due: string;
  theme: string;
  gstEnabled: boolean;
  discount: string;
  notes: string;
  companyName: string;
  companyAddress: string;
  companyLogoUrl: string;
  billingAddress: string;
  bankDetails: string;
  paymentQrUrl: string;
  items: Array<{ description: string; qty: string; rate: string }>;
};

type PaymentForm = {
  invoiceId: string;
  amount: string;
  date: string;
  method: string;
  reference: string;
  status: string;
};

function isoToday() {
  return new Date().toISOString().slice(0, 10);
}

function addDays(date: string, days: number) {
  const d = new Date(date || isoToday());
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function endOfMonth(date: string) {
  const d = new Date(date || isoToday());
  d.setMonth(d.getMonth() + 1, 0);
  return d.toISOString().slice(0, 10);
}

function monthKey(date: string) {
  if (!date) return "";
  return date.slice(0, 7);
}

function defaultInvoiceForm(store: ReturnType<typeof useStore>): InvoiceForm {
  return {
    clientId: "",
    issue: isoToday(),
    duePreset: "receipt",
    due: isoToday(),
    theme: "classic",
    gstEnabled: true,
    discount: "0",
    notes: "",
    companyName: store.settings.companyName,
    companyAddress: store.settings.companyAddress,
    companyLogoUrl: store.settings.companyLogoUrl,
    billingAddress: "",
    bankDetails: store.settings.defaultBankDetails,
    paymentQrUrl: store.settings.defaultPaymentQrUrl,
    items: [{ description: "", qty: "1", rate: "0" }]
  };
}

function defaultPaymentForm(invoiceId = "", amount = ""): PaymentForm {
  return {
    invoiceId,
    amount,
    date: isoToday(),
    method: "Bank Transfer",
    reference: "",
    status: "Received"
  };
}

export default function InvoicesPage() {
  const store = useStore();
  const [openInvoice, setOpenInvoice] = useState(false);
  const [openPayment, setOpenPayment] = useState(false);
  const [editInvoiceId, setEditInvoiceId] = useState<string | null>(null);
  const [invoiceForm, setInvoiceForm] = useState<InvoiceForm>(() => defaultInvoiceForm(store));
  const [paymentForm, setPaymentForm] = useState<PaymentForm>(() => defaultPaymentForm());

  const paymentMap = useMemo(() => {
    return store.payments.reduce<Record<string, number>>((acc, payment) => {
      if (payment.status === "Received") acc[payment.invoiceId] = (acc[payment.invoiceId] || 0) + payment.amount;
      return acc;
    }, {});
  }, [store.payments]);

  const invoiceRows = useMemo(() => {
    return store.invoices.map((invoice) => {
      const total = totalAmount(invoice.items, invoice.discount, invoice.gstEnabled);
      const paid = paymentMap[invoice.id] || 0;
      const balance = Math.max(total - paid, 0);
      return { invoice, total, paid, balance };
    });
  }, [store.invoices, paymentMap]);

  const currentMonth = monthKey(isoToday());
  const overdueOutstanding = invoiceRows
    .filter((row) => row.invoice.status === "Overdue")
    .reduce((sum, row) => sum + row.balance, 0);
  const receiveThisMonth = invoiceRows
    .filter((row) => row.invoice.due && monthKey(row.invoice.due) === currentMonth && row.balance > 0)
    .reduce((sum, row) => sum + row.balance, 0);
  const receivedThisMonth = store.payments
    .filter((payment) => payment.status === "Received" && monthKey(payment.date) === currentMonth)
    .reduce((sum, payment) => sum + payment.amount, 0);

  function setInvoicePatch(patch: Partial<InvoiceForm>) {
    setInvoiceForm((current) => ({ ...current, ...patch }));
  }

  function setPaymentPatch(patch: Partial<PaymentForm>) {
    setPaymentForm((current) => ({ ...current, ...patch }));
  }

  function applyDuePreset(preset: string, issueDate = invoiceForm.issue) {
    const nextDue =
      preset === "receipt" ? issueDate :
      preset === "eom" ? endOfMonth(issueDate) :
      preset === "7" ? addDays(issueDate, 7) :
      preset === "15" ? addDays(issueDate, 15) :
      invoiceForm.due;
    setInvoicePatch({ duePreset: preset, due: nextDue });
  }

  function openNewInvoice() {
    setEditInvoiceId(null);
    setInvoiceForm(defaultInvoiceForm(store));
    setOpenInvoice(true);
  }

  function openEditInvoice(invoiceId: string) {
    const invoice = store.invoices.find((item) => item.id === invoiceId);
    if (!invoice) return;
    setEditInvoiceId(invoiceId);
    setInvoiceForm({
      clientId: invoice.clientId,
      issue: invoice.issue,
      duePreset: invoice.duePreset || "custom",
      due: invoice.due,
      theme: invoice.theme,
      gstEnabled: invoice.gstEnabled,
      discount: String(invoice.discount),
      notes: invoice.notes,
      companyName: invoice.companyName || store.settings.companyName,
      companyAddress: invoice.companyAddress || store.settings.companyAddress,
      companyLogoUrl: invoice.companyLogoUrl || store.settings.companyLogoUrl,
      billingAddress: invoice.billingAddress || "",
      bankDetails: invoice.bankDetails || store.settings.defaultBankDetails,
      paymentQrUrl: invoice.paymentQrUrl || store.settings.defaultPaymentQrUrl,
      items: invoice.items.map((item) => ({
        description: item.description,
        qty: String(item.qty),
        rate: String(item.rate)
      }))
    });
    setOpenInvoice(true);
  }

  function openRecordPayment(invoiceId: string) {
    const row = invoiceRows.find((item) => item.invoice.id === invoiceId);
    setPaymentForm(defaultPaymentForm(invoiceId, String(row?.balance || 0)));
    setOpenPayment(true);
  }

  function useClientBillingAddress() {
    const client = store.clients.find((item) => item.id === invoiceForm.clientId);
    if (!client) return;
    setInvoicePatch({ billingAddress: client.billingAddress || "" });
  }

  function updateItem(index: number, patch: Partial<{ description: string; qty: string; rate: string }>) {
    setInvoiceForm((current) => ({
      ...current,
      items: current.items.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item))
    }));
  }

  function addItem() {
    setInvoiceForm((current) => ({
      ...current,
      items: [...current.items, { description: "", qty: "1", rate: "0" }]
    }));
  }

  function removeItem(index: number) {
    setInvoiceForm((current) => ({
      ...current,
      items: current.items.filter((_, itemIndex) => itemIndex !== index)
    }));
  }

  function saveInvoice() {
    if (!invoiceForm.clientId) return;
    const items = invoiceForm.items
      .filter((item) => item.description.trim())
      .map((item) => ({
        description: item.description.trim(),
        qty: Number(item.qty) || 1,
        rate: Number(item.rate) || 0
      }));
    const payload = {
      clientId: invoiceForm.clientId,
      issue: invoiceForm.issue,
      duePreset: invoiceForm.duePreset,
      due: invoiceForm.due,
      status: "Pending",
      theme: invoiceForm.theme,
      gstEnabled: invoiceForm.gstEnabled,
      discount: Number(invoiceForm.discount) || 0,
      notes: invoiceForm.notes,
      companyName: invoiceForm.companyName,
      companyAddress: invoiceForm.companyAddress,
      companyLogoUrl: invoiceForm.companyLogoUrl,
      billingAddress: invoiceForm.billingAddress,
      bankDetails: invoiceForm.bankDetails,
      paymentQrUrl: invoiceForm.paymentQrUrl,
      items
    };
    if (editInvoiceId) {
      store.updateInvoice(editInvoiceId, payload);
    } else {
      store.addInvoice(payload);
    }
    setOpenInvoice(false);
  }

  function savePayment() {
    if (!paymentForm.invoiceId) return;
    const invoice = store.invoices.find((item) => item.id === paymentForm.invoiceId);
    if (!invoice) return;
    store.addPayment({
      clientId: invoice.clientId,
      invoiceId: paymentForm.invoiceId,
      amount: Number(paymentForm.amount) || 0,
      date: paymentForm.date,
      method: paymentForm.method,
      reference: paymentForm.reference,
      status: paymentForm.status
    });
    setOpenPayment(false);
  }

  const invoiceSubtotal = subtotal(invoiceForm.items.map((item) => ({ description: item.description, qty: Number(item.qty) || 0, rate: Number(item.rate) || 0 })));
  const invoiceTax = gstAmount(
    invoiceForm.items.map((item) => ({ description: item.description, qty: Number(item.qty) || 0, rate: Number(item.rate) || 0 })),
    Number(invoiceForm.discount) || 0,
    invoiceForm.gstEnabled
  );
  const invoiceGrandTotal = totalAmount(
    invoiceForm.items.map((item) => ({ description: item.description, qty: Number(item.qty) || 0, rate: Number(item.rate) || 0 })),
    Number(invoiceForm.discount) || 0,
    invoiceForm.gstEnabled
  );

  const invoiceFooter = (
    <div style={{ display: "flex", gap: 8 }}>
      <button className="button secondary" onClick={() => setOpenInvoice(false)}>Cancel</button>
      <button className="button" onClick={saveInvoice}>{editInvoiceId ? "Update invoice" : "Save invoice"}</button>
    </div>
  );

  const paymentFooter = (
    <div style={{ display: "flex", gap: 8 }}>
      <button className="button secondary" onClick={() => setOpenPayment(false)}>Cancel</button>
      <button className="button" onClick={savePayment}>Save payment</button>
    </div>
  );

  return (
    <div>
      <section className="topbar">
        <div>
          <h2>Invoices</h2>
          <p>Create invoices with logo, QR, bank details, due presets, and linked payment records.</p>
        </div>
        <div className="actions">
          <ActionLink href="/workspace/finance" label="Finance master" secondary />
          <button className="button" onClick={openNewInvoice}><Plus size={16} /> New invoice</button>
        </div>
      </section>

      <section className="grid metrics">
        <article className="card">
          <div className="metric-label">Overdue outstanding</div>
          <div className="metric-value">{formatCurrency(overdueOutstanding)}</div>
          <div className="metric-note">Open overdue invoice balance</div>
        </article>
        <article className="card">
          <div className="metric-label">To receive this month</div>
          <div className="metric-value">{formatCurrency(receiveThisMonth)}</div>
          <div className="metric-note">Due in current month and not fully paid</div>
        </article>
        <article className="card">
          <div className="metric-label">Received this month</div>
          <div className="metric-value">{formatCurrency(receivedThisMonth)}</div>
          <div className="metric-note">Recorded payments marked received</div>
        </article>
        <article className="card">
          <div className="metric-label">Invoice count</div>
          <div className="metric-value">{store.invoices.length}</div>
          <div className="metric-note">All invoice records</div>
        </article>
      </section>

      <section className="card" style={{ marginTop: 18 }}>
        <table className="table">
          <thead>
            <tr>
              <th>Invoice</th>
              <th>Client</th>
              <th>Issue</th>
              <th>Due</th>
              <th>Total</th>
              <th>Paid</th>
              <th>Balance</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {invoiceRows.map(({ invoice, total, paid, balance }) => {
              const client = store.clients.find((item) => item.id === invoice.clientId);
              return (
                <tr key={invoice.id}>
                  <td>
                    <strong>{invoice.num}</strong>
                    <span className="muted">{invoice.theme} · {invoice.gstEnabled ? "With GST" : "Without GST"}</span>
                  </td>
                  <td>{client?.name ?? "—"}</td>
                  <td>{invoice.issue}</td>
                  <td>{invoice.due}</td>
                  <td>{formatCurrency(total)}</td>
                  <td>{formatCurrency(paid)}</td>
                  <td>{formatCurrency(balance)}</td>
                  <td><span className={chipClass(invoice.status)}>{invoice.status}</span></td>
                  <td>
                    <div className="icon-actions">
                      <button className="icon-btn brand" title="Edit invoice" onClick={() => openEditInvoice(invoice.id)}>
                        <ReceiptIndianRupee size={15} />
                      </button>
                      <button className="button secondary" onClick={() => openRecordPayment(invoice.id)}>Record payment</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      <Drawer
        open={openInvoice}
        onClose={() => setOpenInvoice(false)}
        title={editInvoiceId ? "Edit invoice" : "New invoice"}
        subtitle="Clear, payment-ready invoice with logo, QR, due presets, and bank details."
        footer={invoiceFooter}
      >
        <div className="form-section-label">Invoice basics</div>
        <div className="field-row">
          <div className="field">
            <label>Client *</label>
            <select
              value={invoiceForm.clientId}
              onChange={(e) => {
                const nextClientId = e.target.value;
                const client = store.clients.find((item) => item.id === nextClientId);
                setInvoicePatch({
                  clientId: nextClientId,
                  billingAddress: client?.billingAddress || invoiceForm.billingAddress
                });
              }}
            >
              <option value="">Select client</option>
              {store.clients.map((client) => (
                <option key={client.id} value={client.id}>{client.name} — {client.company}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Theme</label>
            <select value={invoiceForm.theme} onChange={(e) => setInvoicePatch({ theme: e.target.value })}>
              <option value="classic">Classic</option>
              <option value="minimal">Minimal</option>
              <option value="bold">Bold</option>
            </select>
          </div>
        </div>

        <div className="field-row">
          <div className="field">
            <label>Issue date</label>
            <input
              type="date"
              value={invoiceForm.issue}
              onChange={(e) => {
                const issue = e.target.value;
                setInvoicePatch({ issue });
                if (invoiceForm.duePreset !== "custom") applyDuePreset(invoiceForm.duePreset, issue);
              }}
            />
          </div>
          <div className="field">
            <label>Due option</label>
            <select value={invoiceForm.duePreset} onChange={(e) => applyDuePreset(e.target.value, invoiceForm.issue)}>
              <option value="receipt">Due on receipt</option>
              <option value="eom">Due end of month</option>
              <option value="7">Due in 7 days</option>
              <option value="15">Due in 15 days</option>
              <option value="custom">Custom date</option>
            </select>
          </div>
        </div>

        <div className="field">
          <label>Due date</label>
          <input type="date" value={invoiceForm.due} onChange={(e) => setInvoicePatch({ duePreset: "custom", due: e.target.value })} />
        </div>

        <div className="form-section-label">Company & payment details</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button
            type="button"
            className="button secondary"
            onClick={() =>
              setInvoicePatch({
                companyName: store.settings.companyName,
                companyAddress: store.settings.companyAddress,
                companyLogoUrl: store.settings.companyLogoUrl,
                bankDetails: store.settings.defaultBankDetails,
                paymentQrUrl: store.settings.defaultPaymentQrUrl
              })
            }
          >
            Use Fastex defaults
          </button>
          <button type="button" className="button secondary" onClick={useClientBillingAddress}>
            Use client billing address
          </button>
        </div>

        <div className="field">
          <label>Company name</label>
          <input value={invoiceForm.companyName} onChange={(e) => setInvoicePatch({ companyName: e.target.value })} />
        </div>
        <div className="field">
          <label>Company logo URL</label>
          <input value={invoiceForm.companyLogoUrl} onChange={(e) => setInvoicePatch({ companyLogoUrl: e.target.value })} placeholder="https://..." />
        </div>
        <div className="field">
          <label>Company address</label>
          <textarea rows={3} value={invoiceForm.companyAddress} onChange={(e) => setInvoicePatch({ companyAddress: e.target.value })} />
        </div>
        <div className="field">
          <label>Billing address</label>
          <textarea rows={3} value={invoiceForm.billingAddress} onChange={(e) => setInvoicePatch({ billingAddress: e.target.value })} />
        </div>
        <div className="field">
          <label>Bank details</label>
          <textarea rows={4} value={invoiceForm.bankDetails} onChange={(e) => setInvoicePatch({ bankDetails: e.target.value })} />
        </div>
        <div className="field">
          <label>Payment QR URL</label>
          <input value={invoiceForm.paymentQrUrl} onChange={(e) => setInvoicePatch({ paymentQrUrl: e.target.value })} placeholder="https://..." />
        </div>

        <div className="form-section-label">Line items</div>
        <div className="list">
          {invoiceForm.items.map((item, index) => (
            <div className="list-row list-row-col" key={`${index}-${item.description}`}>
              <div className="field">
                <label>Description</label>
                <input value={item.description} onChange={(e) => updateItem(index, { description: e.target.value })} />
              </div>
              <div className="field-row">
                <div className="field">
                  <label>Qty</label>
                  <input type="number" value={item.qty} onChange={(e) => updateItem(index, { qty: e.target.value })} />
                </div>
                <div className="field">
                  <label>Rate</label>
                  <input type="number" value={item.rate} onChange={(e) => updateItem(index, { rate: e.target.value })} />
                </div>
              </div>
              {invoiceForm.items.length > 1 ? (
                <button type="button" className="button secondary" onClick={() => removeItem(index)}>
                  Remove item
                </button>
              ) : null}
            </div>
          ))}
        </div>
        <button type="button" className="button secondary" onClick={addItem}>Add line item</button>

        <div className="field-row">
          <div className="field">
            <label>Discount</label>
            <input type="number" value={invoiceForm.discount} onChange={(e) => setInvoicePatch({ discount: e.target.value })} />
          </div>
          <div className="field">
            <label>GST mode</label>
            <select value={invoiceForm.gstEnabled ? "yes" : "no"} onChange={(e) => setInvoicePatch({ gstEnabled: e.target.value === "yes" })}>
              <option value="yes">With GST</option>
              <option value="no">Without GST</option>
            </select>
          </div>
        </div>
        <div className="field">
          <label>Notes</label>
          <textarea rows={3} value={invoiceForm.notes} onChange={(e) => setInvoicePatch({ notes: e.target.value })} />
        </div>

        <div className="card" style={{ boxShadow: "none", padding: 18 }}>
          <div className="metric-label">Invoice summary</div>
          <div className="list" style={{ marginTop: 12 }}>
            <div className="list-row"><strong>Subtotal</strong><span>{formatCurrency(invoiceSubtotal)}</span></div>
            <div className="list-row"><strong>Discount</strong><span>{formatCurrency(Number(invoiceForm.discount) || 0)}</span></div>
            <div className="list-row"><strong>GST</strong><span>{formatCurrency(invoiceTax)}</span></div>
            <div className="list-row"><strong>Grand total</strong><span>{formatCurrency(invoiceGrandTotal)}</span></div>
          </div>
        </div>
      </Drawer>

      <Drawer
        open={openPayment}
        onClose={() => setOpenPayment(false)}
        title="Record payment"
        subtitle="Once recorded, the linked invoice updates automatically."
        footer={paymentFooter}
      >
        <div className="field">
          <label>Invoice</label>
          <select value={paymentForm.invoiceId} onChange={(e) => setPaymentPatch({ invoiceId: e.target.value })}>
            <option value="">Select invoice</option>
            {store.invoices.map((invoice) => (
              <option key={invoice.id} value={invoice.id}>{invoice.num} — {store.clients.find((client) => client.id === invoice.clientId)?.name}</option>
            ))}
          </select>
        </div>
        <div className="field-row">
          <div className="field">
            <label>Amount</label>
            <input type="number" value={paymentForm.amount} onChange={(e) => setPaymentPatch({ amount: e.target.value })} />
          </div>
          <div className="field">
            <label>Date</label>
            <input type="date" value={paymentForm.date} onChange={(e) => setPaymentPatch({ date: e.target.value })} />
          </div>
        </div>
        <div className="field-row">
          <div className="field">
            <label>Method</label>
            <select value={paymentForm.method} onChange={(e) => setPaymentPatch({ method: e.target.value })}>
              <option>Bank Transfer</option>
              <option>UPI</option>
              <option>Cash</option>
              <option>Cheque</option>
            </select>
          </div>
          <div className="field">
            <label>Status</label>
            <select value={paymentForm.status} onChange={(e) => setPaymentPatch({ status: e.target.value })}>
              <option>Received</option>
              <option>Pending</option>
              <option>Overdue</option>
            </select>
          </div>
        </div>
        <div className="field">
          <label>Reference</label>
          <input value={paymentForm.reference} onChange={(e) => setPaymentPatch({ reference: e.target.value })} placeholder="UTR / transaction reference" />
        </div>
      </Drawer>
    </div>
  );
}
