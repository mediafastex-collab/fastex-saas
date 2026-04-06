"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { User } from "firebase/auth";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { doc, getDocFromServer, serverTimestamp, setDoc } from "firebase/firestore";
import { getFirebaseAuth, getFirebaseDb, getFirebaseProjectId, isFirebaseConfigured } from "@/lib/firebase/client";
import { settings as seedSettings } from "@/lib/data/seed";

export type AppUserRole = "main_admin" | "agency" | "team_member";

export type UserProfile = {
  uid: string;
  name: string;
  company: string;
  email: string;
  mobile: string;
  role: AppUserRole;
  status: "Pending" | "Approved" | "Rejected";
  workspaceId: string;
};

type LoginInput = {
  email: string;
  password: string;
};

type SignupInput = {
  name: string;
  company: string;
  email: string;
  mobile: string;
  password: string;
};

type AuthContextValue = {
  firebaseEnabled: boolean;
  loading: boolean;
  busy: boolean;
  user: User | null;
  profile: UserProfile | null;
  login: (input: LoginInput) => Promise<{ ok: boolean; target?: "/admin" | "/workspace"; error?: string }>;
  signup: (input: SignupInput) => Promise<{ ok: boolean; message?: string; error?: string }>;
  resetPassword: (email: string) => Promise<{ ok: boolean; message?: string; error?: string }>;
  logout: () => Promise<void>;
};

const AuthCtx = createContext<AuthContextValue | null>(null);

const MAIN_ADMIN_EMAIL = "aagam@fastexmedia.com";
const resolvedProfileCache = new Map<string, UserProfile | null>();

function parseFirestoreValue(value: unknown): unknown {
  if (!value || typeof value !== "object") return value;
  const typed = value as Record<string, unknown>;
  if ("stringValue" in typed) return typed.stringValue;
  if ("integerValue" in typed) return Number(typed.integerValue);
  if ("doubleValue" in typed) return Number(typed.doubleValue);
  if ("booleanValue" in typed) return Boolean(typed.booleanValue);
  if ("nullValue" in typed) return null;
  if ("timestampValue" in typed) return typed.timestampValue;
  if ("mapValue" in typed) {
    const fields = ((typed.mapValue as { fields?: Record<string, unknown> })?.fields) ?? {};
    return Object.fromEntries(
      Object.entries(fields).map(([key, inner]) => [key, parseFirestoreValue(inner)])
    );
  }
  if ("arrayValue" in typed) {
    const values = ((typed.arrayValue as { values?: unknown[] })?.values) ?? [];
    return values.map((item) => parseFirestoreValue(item));
  }
  return value;
}

async function readProfileViaRest(uid: string, idToken: string) {
  const projectId = getFirebaseProjectId();
  if (!projectId) return null;

  const response = await fetch(
    `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/users/${uid}`,
    {
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
      cache: "no-store",
    }
  );

  if (response.status === 404) return null;
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Firestore REST profile read failed: ${response.status} ${text}`);
  }

  const payload = (await response.json()) as { fields?: Record<string, unknown> };
  const fields = payload.fields ?? {};
  return { uid, ...(parseFirestoreValue({ mapValue: { fields } }) as Omit<UserProfile, "uid">) } as UserProfile;
}

async function readProfile(uid: string, idToken?: string) {
  const db = getFirebaseDb();
  try {
    if (!db) throw new Error("Firestore SDK unavailable");
    const snapshot = await getDocFromServer(doc(db, "users", uid));
    if (!snapshot.exists()) return null;
    return { uid, ...(snapshot.data() as Omit<UserProfile, "uid">) } as UserProfile;
  } catch (error) {
    const maybeError = error as { code?: string };
    if (idToken && maybeError?.code === "unavailable") {
      return readProfileViaRest(uid, idToken);
    }
    throw error;
  }
}

function formatFirebaseError(error: unknown, stage: string) {
  if (typeof error === "object" && error !== null) {
    const maybeError = error as { code?: string; message?: string };
    const parts = [stage];
    if (maybeError.code) parts.push(`code=${maybeError.code}`);
    if (maybeError.message) parts.push(`message=${maybeError.message.replace(/^Firebase:\s*/i, "")}`);
    return parts.join(" | ");
  }
  return `${stage} | message=Unknown Firebase error`;
}

function createEmptyWorkspace(company?: string) {
  return {
    clients: [],
    services: [],
    packages: [],
    teamMembers: [],
    credentials: [],
    invoices: [],
    quotations: [],
    payments: [],
    tasks: [],
    checklists: [],
    leads: [],
    settings: {
      ...seedSettings,
      companyName: company || seedSettings.companyName,
    },
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const firebaseEnabled = isFirebaseConfigured();
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (!firebaseEnabled) {
      setLoading(false);
      return;
    }

    const auth = getFirebaseAuth();
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (nextUser) => {
      setUser(nextUser);
      if (!nextUser) {
        resolvedProfileCache.clear();
        setProfile(null);
        setLoading(false);
        return;
      }

      try {
        const cachedProfile = resolvedProfileCache.get(nextUser.uid);
        const nextProfile = cachedProfile !== undefined
          ? cachedProfile
          : await readProfile(nextUser.uid, await nextUser.getIdToken());
        setProfile(nextProfile);
      } catch (error) {
        console.error("Auth state profile read failed", error);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [firebaseEnabled]);

  async function login(input: LoginInput) {
    if (!firebaseEnabled) {
      return { ok: false, error: "Firebase is not configured yet in this app." };
    }

    const auth = getFirebaseAuth();
    if (!auth) {
      return { ok: false, error: "Firebase auth is unavailable." };
    }

    setBusy(true);
    try {
      const credential = await signInWithEmailAndPassword(auth, input.email.trim(), input.password);
      return {
        ok: true,
        target: (credential.user.email?.trim().toLowerCase() === MAIN_ADMIN_EMAIL ? "/admin" : "/workspace") as "/admin" | "/workspace",
      };
    } catch (error) {
      console.error("Login failed", error);
      return { ok: false, error: formatFirebaseError(error, "login_or_profile_read_failed") };
    } finally {
      setBusy(false);
    }
  }

  async function signup(input: SignupInput) {
    if (!firebaseEnabled) {
      return { ok: false, error: "Firebase is not configured yet in this app." };
    }

    const auth = getFirebaseAuth();
    const db = getFirebaseDb();
    if (!auth || !db) {
      return { ok: false, error: "Firebase services are unavailable." };
    }

    setBusy(true);
    try {
      const credential = await createUserWithEmailAndPassword(
        auth,
        input.email.trim(),
        input.password
      );

      const role: AppUserRole = input.email.trim().toLowerCase() === MAIN_ADMIN_EMAIL ? "main_admin" : "agency";
      const status: UserProfile["status"] = role === "main_admin" ? "Approved" : "Pending";
      const workspaceId = credential.user.uid;

      await setDoc(doc(db, "users", credential.user.uid), {
        name: input.name.trim(),
        company: input.company.trim() || "Fastex Workspace",
        email: input.email.trim(),
        mobile: input.mobile.trim(),
        role,
        status,
        workspaceId,
        createdAt: serverTimestamp(),
        approvedAt: status === "Approved" ? serverTimestamp() : null,
      });

      await setDoc(doc(db, "workspaces", workspaceId), {
        workspaceId,
        ownerUid: credential.user.uid,
        company: input.company.trim() || "Fastex Workspace",
        data: createEmptyWorkspace(input.company.trim() || "Fastex Workspace"),
        updatedAt: serverTimestamp(),
      }, { merge: true });

      await signOut(auth);

      return {
        ok: true,
        message: status === "Approved"
          ? "Account created. You can log in now."
          : "Signup submitted. Once approved from Customer Master, you can log in.",
      };
    } catch (error) {
      console.error("Signup failed", error);
      return { ok: false, error: formatFirebaseError(error, "signup_failed") };
    } finally {
      setBusy(false);
    }
  }

  async function resetPassword(email: string) {
    if (!firebaseEnabled) {
      return { ok: false, error: "Firebase is not configured yet in this app." };
    }

    const auth = getFirebaseAuth();
    if (!auth) {
      return { ok: false, error: "Firebase auth is unavailable." };
    }

    setBusy(true);
    try {
      await sendPasswordResetEmail(auth, email.trim());
      return { ok: true, message: "Password reset email sent." };
    } catch (error) {
      console.error("Password reset failed", error);
      return { ok: false, error: formatFirebaseError(error, "password_reset_failed") };
    } finally {
      setBusy(false);
    }
  }

  async function logout() {
    const auth = getFirebaseAuth();
    if (!auth) return;
    if (auth.currentUser?.uid) {
      resolvedProfileCache.delete(auth.currentUser.uid);
    }
    await signOut(auth);
  }

  const value = useMemo<AuthContextValue>(() => ({
    firebaseEnabled,
    loading,
    busy,
    user,
    profile,
    login,
    signup,
    resetPassword,
    logout,
  }), [firebaseEnabled, loading, busy, user, profile]);

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
