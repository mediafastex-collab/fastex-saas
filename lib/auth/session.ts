import type { PlatformRole } from "@/lib/modules/navigation";

export type AppSession = {
  userId: string;
  email: string;
  role: PlatformRole;
  organizationId?: string;
};

export async function getMockSession(kind: "admin" | "workspace" = "workspace"): Promise<AppSession> {
  if (kind === "admin") {
    return {
      userId: "usr_platform_owner",
      email: "aagam@fastexmedia.com",
      role: "platform_owner"
    };
  }

  return {
    userId: "usr_agency_owner",
    email: "owner@fastexmedia.com",
    role: "agency_owner",
    organizationId: "org_fastex_media"
  };
}
