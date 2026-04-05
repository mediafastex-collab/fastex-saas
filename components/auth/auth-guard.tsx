"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-provider";

type AuthGuardProps = {
  area: "admin" | "workspace";
  children: React.ReactNode;
};

export function AuthGuard({ area, children }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { firebaseEnabled, loading, user, profile } = useAuth();

  useEffect(() => {
    if (!firebaseEnabled || loading) return;
    if (!user || !profile) {
      router.replace("/login");
      return;
    }

    if (area === "admin" && profile.role !== "main_admin") {
      router.replace("/workspace");
      return;
    }

    if (area === "workspace" && profile.role !== "main_admin" && profile.role !== "agency" && profile.role !== "team_member") {
      router.replace("/login");
      return;
    }

    if (profile.status !== "Approved" && profile.role !== "main_admin") {
      router.replace("/login");
    }
  }, [area, firebaseEnabled, loading, pathname, profile, router, user]);

  if (firebaseEnabled && (loading || !user || !profile)) {
    return (
      <div className="auth-shell">
        <div className="auth-card">
          <h1>Fastex Admin</h1>
          <p>Checking your access and loading the right workspace.</p>
        </div>
      </div>
    );
  }

  if (firebaseEnabled) {
    if (area === "admin" && profile?.role !== "main_admin") return null;
    if (area === "workspace" && !["main_admin", "agency", "team_member"].includes(profile?.role || "")) return null;
  }

  return <>{children}</>;
}
