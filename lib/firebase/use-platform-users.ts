"use client";

import { useEffect, useState } from "react";
import { collection, doc, onSnapshot, updateDoc } from "firebase/firestore";
import { useAuth, type AppUserRole, type UserProfile } from "@/lib/auth/auth-provider";
import { getFirebaseDb } from "@/lib/firebase/client";

export function usePlatformUsers() {
  const { firebaseEnabled, profile } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!firebaseEnabled || profile?.role !== "main_admin") {
      setLoading(false);
      setUsers([]);
      return;
    }

    const db = getFirebaseDb();
    if (!db) {
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(collection(db, "users"), (snapshot) => {
      const nextUsers = snapshot.docs
        .map((item) => ({ uid: item.id, ...(item.data() as Omit<UserProfile, "uid">) }))
        .sort((a, b) => a.email.localeCompare(b.email));
      setUsers(nextUsers);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [firebaseEnabled, profile?.role]);

  return { users, loading };
}

export async function updatePlatformUser(uid: string, patch: Partial<Pick<UserProfile, "role" | "status" | "workspaceId">>) {
  const db = getFirebaseDb();
  if (!db) throw new Error("Firebase database is unavailable.");
  await updateDoc(doc(db, "users", uid), patch);
}
