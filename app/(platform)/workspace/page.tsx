"use client";

import { ActionLink } from "@/components/ui/action-link";
import { RouteCard } from "@/components/ui/route-card";
import { useStore } from "@/lib/data/store";
import { chipClass } from "@/lib/utils";
import { formatCurrency, totalAmount } from "@/lib/data/seed";
import {
  BadgeIndianRupee,
  BriefcaseBusiness,
  ClipboardList,
  FileText,
  Network,
  Users
} from "lucide-react";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function addDays(date: string, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export default function WorkspaceDashboardPage() {
  const store = useStore();
  const today = todayISO();
  const nextWeekDate = addDays(today, 7);
  const mrr = store.clients.reduce((sum, client) => sum + client.mrr, 0);
  const paymentMap = store.payments.reduce<Record<string, number>>((acc, payment) => {
    if (payment.status === "Received") acc[payment.invoiceId] = (acc[payment.invoiceId] || 0) + payment.amount;
    return acc;
  }, {});
  const receivable = store.invoices.reduce((sum, invoice) => {
    const total = totalAmount(invoice.items, invoice.discount, invoice.gstEnabled);
    return sum + Math.max(total - (paymentMap[invoice.id] || 0), 0);
  }, 0);
  const topClients = [...store.clients].sort((a, b) => b.mrr - a.mrr).slice(0, 4);
  const pendingClients = store.clients.filter((client) => client.obStatus === "Not Started").length;
  const inProgressClients = store.clients.filter((client) => client.obStatus === "In Progress").length;
  const completedClients = store.clients.filter((client) => client.obStatus === "Completed").length;
  const dueToday = store.tasks.filter((task) => !task.done && task.due === today).length;
  const overdue = store.tasks.filter((task) => !task.done && task.due < today).length;
  const nextWeek = store.tasks.filter((task) => !task.done && task.due > today && task.due <= nextWeekDate).length;

  return (
    <div>
      <section className="topbar">
        <div>
          <h2>Dashboard</h2>
          <p>Simple workspace view for clients, delivery, finance, and CRM without mixing everything together.</p>
        </div>
        <div className="actions">
          <ActionLink href="/workspace/services" label="Services Master" secondary />
          <ActionLink href="/workspace/frameworks" label="Frameworks" secondary />
          <ActionLink href="/workspace/clients" label="Client Master" />
        </div>
      </section>

      <section className="card hero-card">
        <div>
          <h3>{store.settings.companyName} · Agency workspace</h3>
          <p className="card-subtitle">
            {store.clients.length} clients · {formatCurrency(mrr)} MRR · {store.tasks.filter((task) => !task.done).length} open tasks
          </p>
        </div>
        <span className={chipClass("Agency Workspace")}>Agency Workspace</span>
      </section>

      <section className="grid metrics">
        <article className="card"><div className="metric-label">Clients</div><div className="metric-value">{store.clients.length}</div><div className="metric-note">View client master</div></article>
        <article className="card"><div className="metric-label">Pending tasks</div><div className="metric-value">{store.tasks.filter((task) => !task.done).length}</div><div className="metric-note">{store.tasks.length ? Math.round((store.tasks.filter((task) => task.done).length / store.tasks.length) * 100) : 0}% completed</div></article>
        <article className="card"><div className="metric-label">Monthly value</div><div className="metric-value">{formatCurrency(mrr)}</div><div className="metric-note">Finance overview</div></article>
        <article className="card"><div className="metric-label">Receivable</div><div className="metric-value">{formatCurrency(receivable)}</div><div className="metric-note">Live balance after received payments</div></article>
      </section>

      <section className="grid two">
        <article className="card">
          <div className="card-header">
            <div>
              <h3>Main branches</h3>
              <p className="card-subtitle">Open the exact workspace module you need.</p>
            </div>
          </div>
          <div className="route-grid">
            <RouteCard href="/workspace/clients" title="Client Master" description="Client records, billing addresses, package mapping, and ownership." icon={BriefcaseBusiness} />
            <RouteCard href="/workspace/onboarding" title="Onboarding" description="Client-wise tasks, due dates, priorities, and progress buckets." icon={ClipboardList} />
            <RouteCard href="/workspace/services" title="Services Master" description="Manage the service list used by packages, tasks, and templates." icon={Network} />
            <RouteCard href="/workspace/packages" title="Packages" description="Bundle services into plans with pricing and deliverables." icon={FileText} />
            <RouteCard href="/workspace/finance" title="Finance Master" description="MRR, ARR, quotations, invoices, payments, and outstanding values." icon={BadgeIndianRupee} />
            <RouteCard href="/workspace/activity" title="CRM Activity" description="Track leads, calls, meetings, deal won, and deal lost stages." icon={Users} />
          </div>
        </article>

        <article className="card">
          <div className="card-header">
            <div>
              <h3>Task focus</h3>
              <p className="card-subtitle">Onboarding task status across all clients.</p>
            </div>
          </div>
          <div className="grid cards-3">
            <div className="card stat-mini"><h4>{dueToday}</h4><p>Due today</p></div>
            <div className="card stat-mini"><h4>{overdue}</h4><p>Overdue</p></div>
            <div className="card stat-mini"><h4>{nextWeek}</h4><p>Next 7 days</p></div>
            <div className="card stat-mini"><h4>{pendingClients}</h4><p>Not started</p></div>
            <div className="card stat-mini"><h4>{inProgressClients}</h4><p>In progress</p></div>
            <div className="card stat-mini"><h4>{completedClients}</h4><p>Completed</p></div>
          </div>
        </article>
      </section>

      <section className="grid two">
        <article className="card">
          <div className="card-header"><div><h3>Client snapshot</h3><p className="card-subtitle">Top clients by monthly value.</p></div></div>
          <table className="table">
            <thead><tr><th>Client</th><th>Services</th><th>Onboarding</th><th>MRR</th><th>Outstanding</th></tr></thead>
            <tbody>
              {topClients.map((client) => (
                <tr key={client.id}>
                  <td><strong>{client.name}</strong><span className="muted">{client.company}</span></td>
                  <td>{client.services.join(", ")}</td>
                  <td><span className={chipClass(client.obStatus)}>{client.obStatus}</span></td>
                  <td>{formatCurrency(client.mrr)}</td>
                  <td>{formatCurrency(
                    store.invoices
                      .filter((invoice) => invoice.clientId === client.id)
                      .reduce((sum, invoice) => sum + Math.max(totalAmount(invoice.items, invoice.discount, invoice.gstEnabled) - (paymentMap[invoice.id] || 0), 0), 0)
                  )}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </article>

        <article className="card">
          <div className="card-header"><div><h3>Urgent finance queue</h3><p className="card-subtitle">Invoices and payments needing immediate follow-up.</p></div></div>
          <div className="list">
            {store.invoices.filter((invoice) => invoice.status === "Pending" || invoice.status === "Overdue").slice(0, 4).map((invoice) => (
              <div className="list-row" key={invoice.id}>
                <div>
                  <strong>{invoice.num} · {store.clients.find((client) => client.id === invoice.clientId)?.name ?? "Unknown"}</strong>
                  <span className="muted">Due {invoice.due}</span>
                </div>
                <span className={chipClass(invoice.status)}>{invoice.status}</span>
              </div>
            ))}
            {store.payments.slice(0, 2).map((payment) => (
              <div className="list-row" key={payment.id}>
                <div>
                  <strong>{store.clients.find((client) => client.id === payment.clientId)?.name ?? "—"} · {formatCurrency(payment.amount)}</strong>
                  <span className="muted">{payment.method || "Method pending"}</span>
                </div>
                <span className={chipClass(payment.status)}>{payment.status}</span>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}
