"use client";

import { ActionLink } from "@/components/ui/action-link";
import { RouteCard } from "@/components/ui/route-card";
import { usePlatformUsers } from "@/lib/firebase/use-platform-users";
import { chipClass } from "@/lib/utils";
import { Building2, Settings, ShieldCheck, Wallet } from "lucide-react";

export default function AdminDashboardPage() {
  const { users } = usePlatformUsers();
  const nonAdminUsers = users.filter((item) => item.role !== "main_admin");
  const approvedUsers = nonAdminUsers.filter((item) => item.status === "Approved");
  const pendingUsers = nonAdminUsers.filter((item) => item.status === "Pending");

  return (
    <>
      <section className="topbar">
        <div>
          <h2>Platform Dashboard</h2>
          <p>One clear backend for customer approvals, subscriptions, support, and platform settings.</p>
        </div>
        <div className="actions">
          <ActionLink href="/admin/customers"     label="Review customers"  secondary />
          <ActionLink href="/admin/subscriptions" label="Subscriptions"     secondary />
          <ActionLink href="/admin/settings"      label="Platform settings" />
        </div>
      </section>

      <section className="card hero-card">
        <div>
          <h3>Super admin control center</h3>
          <p className="card-subtitle">
            Customer approvals, subscription control, support, and system settings — keep this side clean.
          </p>
        </div>
        <span className={chipClass("Main Admin Only")}>Main Admin Only</span>
      </section>

      <section className="grid metrics">
        <article className="card">
          <div className="metric-label">Organizations</div>
          <div className="metric-value">{approvedUsers.length}</div>
          <div className="metric-note">Total active tenants</div>
        </article>
        <article className="card">
          <div className="metric-label">Approved accounts</div>
          <div className="metric-value">{approvedUsers.length}</div>
          <div className="metric-note">Cloud workspaces ready to use</div>
        </article>
        <article className="card">
          <div className="metric-label">Pending approvals</div>
          <div className="metric-value">{pendingUsers.length}</div>
          <div className="metric-note">Need your approval in Customer Master</div>
        </article>
        <article className="card">
          <div className="metric-label">Team accounts</div>
          <div className="metric-value">{nonAdminUsers.filter((item) => item.role === "team_member").length}</div>
          <div className="metric-note">Restricted customer-side users</div>
        </article>
      </section>

      <section className="grid two">
        <article className="card">
          <div className="card-header">
            <div>
              <h3>Pending customer approvals</h3>
              <p className="card-subtitle">Organizations waiting for role review and workspace activation.</p>
            </div>
          </div>
          <table className="table">
            <thead>
              <tr>
                <th>Organization</th>
                <th>Owner</th>
                <th>Status</th>
                <th>Role</th>
              </tr>
            </thead>
            <tbody>
              {nonAdminUsers.slice(0, 5).map((customer) => (
                <tr key={customer.uid}>
                  <td>
                    <strong>{customer.company}</strong>
                    <span className="muted">{customer.email}</span>
                  </td>
                  <td>{customer.name}</td>
                  <td><span className={chipClass(customer.status)}>{customer.status}</span></td>
                  <td><span className={chipClass(customer.role)}>{customer.role}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </article>

        <article className="card">
          <div className="card-header">
            <div>
              <h3>Admin branches</h3>
              <p className="card-subtitle">Simple routes for the platform-side workflow.</p>
            </div>
          </div>
          <div className="route-grid">
            <RouteCard icon={Building2}   href="/admin/customers"     title="Customer Master" description="Approve signups, assign roles, and manage tenant access." />
            <RouteCard icon={Wallet}      href="/admin/subscriptions" title="Subscriptions"   description="Track plans, billing state, renewals, and payment failures." />
            <RouteCard icon={ShieldCheck} href="/admin/support"       title="Audit & Support" description="Handle support issues, health checks, and platform review." />
            <RouteCard icon={Settings}    href="/admin/settings"      title="Settings"        description="Manage system defaults, company details, and backend controls." />
          </div>
        </article>
      </section>
    </>
  );
}
