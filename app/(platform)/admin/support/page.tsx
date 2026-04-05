import { ModulePage } from "@/components/ui/module-page";

export default function AdminSupportPage() {
  return (
    <>
      <section className="topbar">
        <div>
          <h2>Audit & Support</h2>
          <p>Centralize health checks, support actions, and safe tenant troubleshooting.</p>
        </div>
      </section>
      <ModulePage
        title="Support workflow — coming soon"
        description="Use this area for admin-safe impersonation, audit logs, and organization support events."
        bullets={["Audit timeline", "Tenant health alerts", "Support notes and resolution tracking"]}
      />
    </>
  );
}
