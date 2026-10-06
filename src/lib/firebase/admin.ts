import "server-only";
import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { env, isFirebaseConfigured } from "@/lib/env";

let app: App | undefined;

function getApp(): App {
  if (!isFirebaseConfigured()) {
    throw new Error("Firebase is not configured (FIREBASE_PROJECT_ID / FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY).");
  }
  if (!app) {
    app =
      getApps()[0] ??
      initializeApp({
        credential: cert({
          projectId: env.firebaseProjectId,
          clientEmail: env.firebaseClientEmail,
          privateKey: env.firebasePrivateKey,
        }),
      });
  }
  return app;
}

/** Server-only Firestore. The browser never talks to Firestore directly (rules deny everything). */
export function db(): Firestore {
  return getFirestore(getApp());
}

export const collections = {
  events: "events",
  ticketTypes: "ticketTypes",
  customers: "customers",
  orders: "orders",
  payments: "payments",
  tickets: "tickets",
  stripeEvents: "stripeEvents",
  checkins: "checkins",
  submissions: "submissions",
} as const;
