import { PageShell } from "@/components/layout/page-shell";
import { AuthGuard } from "@/components/auth/auth-guard";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard area="admin">
      <PageShell title="Fastex Super Admin" subtitle="Platform control center" variant="admin">
        {children}
      </PageShell>
    </AuthGuard>
  );
}
