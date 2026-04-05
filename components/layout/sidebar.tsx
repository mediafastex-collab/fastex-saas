"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getAdminNavigation, getWorkspaceNavigation } from "@/lib/modules/navigation";
import { useAuth } from "@/lib/auth/auth-provider";

type SidebarProps = {
  title: string;
  subtitle: string;
  variant: "workspace" | "admin";
};

export function Sidebar({ title, subtitle, variant }: SidebarProps) {
  const pathname = usePathname();
  const { profile, logout, busy } = useAuth();
  const navigation =
    variant === "admin"
      ? getAdminNavigation()
      : getWorkspaceNavigation(profile?.role ?? "agency");

  function isActive(href: string) {
    if (href === "/workspace" || href === "/admin") return pathname === href;
    return pathname === href || pathname.startsWith(href + "/");
  }

  const initials = title
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("");

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-icon">{initials}</div>
        <div className="brand-text">
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>
      </div>

      {navigation.map((group) => (
        <section className="sidebar-group" key={group.label}>
          <p className="sidebar-group-label">{group.label}</p>
          <div className="nav-list">
            {group.items.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`nav-item${active ? " active" : ""}`}
                >
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 9 }}>
                    <Icon size={15} />
                    {item.label}
                  </span>
                  {item.badge ? <span className="nav-badge">{item.badge}</span> : null}
                </Link>
              );
            })}
          </div>
        </section>
      ))}

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <strong>{profile?.name || "Workspace User"}</strong>
          <span>{profile?.email || subtitle}</span>
        </div>
        <button className="button secondary sidebar-logout" onClick={() => void logout()} disabled={busy}>
          {busy ? "Working..." : "Logout"}
        </button>
      </div>
    </aside>
  );
}
