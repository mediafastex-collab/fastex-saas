"use client";

import { getApp, getApps, initializeApp } from "firebase/app";
import { Auth, getAuth } from "firebase/auth";
import { Firestore, initializeFirestore } from "firebase/firestore";
import { FirebaseStorage, getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export function getFirebaseProjectId() {
  return firebaseConfig.projectId || null;
}

let firebaseAppSingleton: ReturnType<typeof initializeApp> | null = null;
let firebaseAuthSingleton: Auth | null = null;
let firebaseDbSingleton: Firestore | null = null;
let firebaseStorageSingleton: FirebaseStorage | null = null;

export function isFirebaseConfigured() {
  return Boolean(
    firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId &&
    firebaseConfig.storageBucket &&
    firebaseConfig.messagingSenderId &&
    firebaseConfig.appId
  );
}

export function getFirebaseApp() {
  if (!isFirebaseConfigured()) return null;
  if (firebaseAppSingleton) return firebaseAppSingleton;
  firebaseAppSingleton = getApps().length ? getApp() : initializeApp(firebaseConfig);
  return firebaseAppSingleton;
}

export function getFirebaseAuth() {
  const app = getFirebaseApp();
  if (!app) return null;
  if (firebaseAuthSingleton) return firebaseAuthSingleton;
  firebaseAuthSingleton = getAuth(app);
  return firebaseAuthSingleton;
}

export function getFirebaseDb() {
  const app = getFirebaseApp();
  if (!app) return null;
  if (firebaseDbSingleton) return firebaseDbSingleton;
  firebaseDbSingleton = initializeFirestore(app, {
    experimentalForceLongPolling: true,
  });
  return firebaseDbSingleton;
}

export function getFirebaseStorage() {
  const app = getFirebaseApp();
  if (!app) return null;
  if (firebaseStorageSingleton) return firebaseStorageSingleton;
  firebaseStorageSingleton = getStorage(app);
  return firebaseStorageSingleton;
}
