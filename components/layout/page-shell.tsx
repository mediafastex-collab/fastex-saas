import { Sidebar } from "@/components/layout/sidebar";

type PageShellProps = {
  title: string;
  subtitle: string;
  variant: "workspace" | "admin";
  children: React.ReactNode;
};

export function PageShell({ title, subtitle, variant, children }: PageShellProps) {
  return (
    <div className="shell">
      <Sidebar title={title} subtitle={subtitle} variant={variant} />
      <main className="page">{children}</main>
    </div>
  );
}
