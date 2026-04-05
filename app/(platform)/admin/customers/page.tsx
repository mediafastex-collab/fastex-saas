"use client";

import { useState } from "react";
import { chipClass } from "@/lib/utils";
import { usePlatformUsers, updatePlatformUser } from "@/lib/firebase/use-platform-users";

export default function AdminCustomersPage() {
  const { users, loading } = usePlatformUsers();
  const [savingId, setSavingId] = useState<string | null>(null);

  async function approve(uid: string) {
    setSavingId(uid);
    try {
      await updatePlatformUser(uid, { status: "Approved" });
    } finally {
      setSavingId(null);
    }
  }

  async function reject(uid: string) {
    setSavingId(uid);
    try {
      await updatePlatformUser(uid, { status: "Rejected" });
    } finally {
      setSavingId(null);
    }
  }

  async function updateRole(uid: string, role: "agency" | "team_member" | "main_admin") {
    setSavingId(uid);
    try {
      await updatePlatformUser(uid, { role });
    } finally {
      setSavingId(null);
    }
  }

  const customerAccounts = users.filter((customer) => customer.role !== "main_admin");

  return (
    <>
      <section className="topbar">
        <div>
          <h2>Customer Master</h2>
          <p>Signup approvals, role assignment, and tenant-level customer control from one backend.</p>
        </div>
        <div className="actions" />
      </section>

      <section className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Company</th>
              <th>Email</th>
              <th>Mobile</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7}>Loading customer accounts from Firebase…</td>
              </tr>
            ) : customerAccounts.length === 0 ? (
              <tr>
                <td colSpan={7}>No customer accounts yet. New signups will appear here automatically.</td>
              </tr>
            ) : customerAccounts.map((customer) => (
              <tr key={customer.uid}>
                <td><strong>{customer.name}</strong></td>
                <td>{customer.company}</td>
                <td>{customer.email}</td>
                <td>{customer.mobile}</td>
                <td>
                  <select
                    value={customer.role}
                    onChange={(event) => void updateRole(customer.uid, event.target.value as "agency" | "team_member" | "main_admin")}
                    disabled={savingId === customer.uid}
                  >
                    <option value="agency">Agency</option>
                    <option value="team_member">Team Member</option>
                  </select>
                </td>
                <td><span className={chipClass(customer.status)}>{customer.status}</span></td>
                <td>
                  <div className="actions">
                    <button className="button secondary" onClick={() => void approve(customer.uid)} disabled={savingId === customer.uid}>
                      Approve
                    </button>
                    <button className="button secondary" onClick={() => void reject(customer.uid)} disabled={savingId === customer.uid}>
                      Reject
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  );
}
