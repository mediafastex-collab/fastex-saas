import { ModulePage } from "@/components/ui/module-page";

export default function AdminSubscriptionsPage() {
  return (
    <>
      <section className="topbar">
        <div>
          <h2>Subscriptions</h2>
          <p>Track paid plans, trials, renewals, failed charges, and seat usage.</p>
        </div>
      </section>
      <ModulePage
        title="Billing backend — coming soon"
        description="This will connect to Stripe and become the platform-level SaaS billing center."
        bullets={["Plan catalog", "Tenant billing status", "Renewal and dunning actions"]}
      />
    </>
  );
}
