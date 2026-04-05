import { PageShell } from "@/components/layout/page-shell";
import { AuthGuard } from "@/components/auth/auth-guard";
import { DataProvider } from "@/lib/data/store";

export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard area="workspace">
      <DataProvider>
        <PageShell title="Fastex Workspace" subtitle="Agency operations" variant="workspace">
          {children}
        </PageShell>
      </DataProvider>
    </AuthGuard>
  );
}
