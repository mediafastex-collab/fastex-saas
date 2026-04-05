"use client";

import { ActionLink } from "@/components/ui/action-link";
import { RouteCard } from "@/components/ui/route-card";
import { useStore } from "@/lib/data/store";
import { formatCurrency, totalAmount } from "@/lib/data/seed";

export default function FinancePage() {
  const store = useStore();
  const paymentMap = store.payments.reduce<Record<string, number>>((acc, payment) => {
    if (payment.status === "Received") acc[payment.invoiceId] = (acc[payment.invoiceId] || 0) + payment.amount;
    return acc;
  }, {});

  const totalInvoiced = store.invoices.reduce((sum, invoice) => sum + totalAmount(invoice.items, invoice.discount, invoice.gstEnabled), 0);
  const totalCollected = store.payments.filter((payment) => payment.status === "Received").reduce((sum, payment) => sum + payment.amount, 0);
  const pending = store.invoices.reduce((sum, invoice) => sum + Math.max(totalAmount(invoice.items, invoice.discount, invoice.gstEnabled) - (paymentMap[invoice.id] || 0), 0), 0);

  return (
    <div>
      <section className="topbar">
        <div>
          <h2>Finance Master</h2>
          <p>Client-wise MRR, ARR, invoiced value, collections, quotations, invoices, and payment follow-up.</p>
        </div>
        <div className="actions">
          <ActionLink href="/workspace/payments" label="Open payments" secondary />
          <ActionLink href="/workspace/quotations" label="Open quotations" secondary />
          <ActionLink href="/workspace/invoices" label="Open invoices" />
        </div>
      </section>

      <section className="grid metrics">
        <article className="card"><div className="metric-label">Total invoiced</div><div className="metric-value">{formatCurrency(totalInvoiced)}</div></article>
        <article className="card"><div className="metric-label">Collected</div><div className="metric-value">{formatCurrency(totalCollected)}</div></article>
        <article className="card"><div className="metric-label">Outstanding</div><div className="metric-value">{formatCurrency(pending)}</div></article>
        <article className="card"><div className="metric-label">Portfolio ARR</div><div className="metric-value">{formatCurrency(store.clients.reduce((sum, client) => sum + client.mrr * 12, 0))}</div></article>
      </section>

      <section className="grid two" style={{ marginTop: 18 }}>
        <article className="card">
          <div className="card-header"><div><h3>Client-wise finance</h3><p className="card-subtitle">MRR, ARR, invoiced, collected, and outstanding values by client.</p></div></div>
          <table className="table">
            <thead><tr><th>Client</th><th>MRR</th><th>ARR</th><th>Invoiced</th><th>Collected</th><th>Outstanding</th></tr></thead>
            <tbody>
              {store.clients.map((client) => {
                const clientInvoices = store.invoices.filter((invoice) => invoice.clientId === client.id);
                const clientPayments = store.payments.filter((payment) => payment.clientId === client.id && payment.status === "Received");
                return (
                  <tr key={client.id}>
                    <td><strong>{client.name}</strong><span className="muted">{client.company}</span></td>
                    <td>{formatCurrency(client.mrr)}</td>
                    <td>{formatCurrency(client.mrr * 12)}</td>
                    <td>{formatCurrency(clientInvoices.reduce((sum, invoice) => sum + totalAmount(invoice.items, invoice.discount, invoice.gstEnabled), 0))}</td>
                    <td>{formatCurrency(clientPayments.reduce((sum, payment) => sum + payment.amount, 0))}</td>
                    <td>{formatCurrency(clientInvoices.reduce((sum, invoice) => sum + Math.max(totalAmount(invoice.items, invoice.discount, invoice.gstEnabled) - (paymentMap[invoice.id] || 0), 0), 0))}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </article>

        <article className="card">
          <div className="card-header"><div><h3>Finance branches</h3><p className="card-subtitle">Use the exact finance module you need.</p></div></div>
          <div className="route-grid">
            <RouteCard href="/workspace/finance" title="Finance Master" description="Client-wise MRR, ARR, invoiced, collected, and outstanding summary." />
            <RouteCard href="/workspace/invoices" title="Invoices" description="Create and review invoices with GST, discount, logo, QR, and payment details." />
            <RouteCard href="/workspace/quotations" title="Quotations" description="Client quotation records with theme and commercial totals." />
            <RouteCard href="/workspace/payments" title="Payments" description="Track received, pending, and overdue payments by client." />
          </div>
        </article>
      </section>
    </div>
  );
}
