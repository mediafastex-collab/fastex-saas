import { settings } from "@/lib/data/seed";

export default function AdminSettingsPage() {
  return (
    <>
      <section className="topbar">
        <div>
          <h2>Settings</h2>
          <p>Platform-side company defaults and future auth/system controls.</p>
        </div>
      </section>

      <section className="grid two">
        <article className="card">
          <div className="card-header">
            <div>
              <h3>Company defaults</h3>
              <p className="card-subtitle">Used in invoices, quotations, and system branding.</p>
            </div>
          </div>
          <div className="list">
            <div className="list-row">
              <div>
                <strong>{settings.companyName}</strong>
                <span className="muted" style={{ whiteSpace: "pre-line" }}>{settings.companyAddress}</span>
              </div>
            </div>
          </div>
        </article>

        <article className="card">
          <div className="card-header">
            <div>
              <h3>System notes</h3>
              <p className="card-subtitle">Backend providers that will be wired in the full SaaS build.</p>
            </div>
          </div>
          <div className="list">
            <div className="list-row">
              <div>
                <strong>Auth provider</strong>
                <span className="muted">Supabase Auth in the final SaaS version</span>
              </div>
            </div>
            <div className="list-row">
              <div>
                <strong>Billing provider</strong>
                <span className="muted">Stripe when subscriptions are connected</span>
              </div>
            </div>
            <div className="list-row">
              <div>
                <strong>Storage</strong>
                <span className="muted">Postgres for records, object storage for files and QR assets</span>
              </div>
            </div>
          </div>
        </article>
      </section>
    </>
  );
}
