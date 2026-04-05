"use client";

import { ActionLink } from "@/components/ui/action-link";
import { useStore } from "@/lib/data/store";
import { chipClass } from "@/lib/utils";
import { formatCurrency } from "@/lib/data/seed";

export default function PaymentsPage() {
  const store = useStore();

  return (
    <div>
      <section className="topbar">
        <div>
          <h2>Payments</h2>
          <p>Recorded payment ledger linked directly to invoices and client balances.</p>
        </div>
        <div className="actions">
          <ActionLink href="/workspace/finance" label="Finance master" secondary />
          <ActionLink href="/workspace/invoices" label="Record from invoice" />
        </div>
      </section>

      <section className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Client</th>
              <th>Invoice</th>
              <th>Amount</th>
              <th>Date</th>
              <th>Method</th>
              <th>Reference</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {store.payments.map((payment) => (
              <tr key={payment.id}>
                <td>{store.clients.find((client) => client.id === payment.clientId)?.name ?? "—"}</td>
                <td>{store.invoices.find((invoice) => invoice.id === payment.invoiceId)?.num ?? "—"}</td>
                <td>{formatCurrency(payment.amount)}</td>
                <td>{payment.date || "—"}</td>
                <td>{payment.method || "—"}</td>
                <td>{payment.reference || "—"}</td>
                <td><span className={chipClass(payment.status)}>{payment.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
