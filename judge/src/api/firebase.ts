import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import type { Firestore } from "firebase-admin/firestore";

let db: Firestore | undefined;

// Initialised on first use, with the service account in GOOGLE_APPLICATION_CREDENTIALS,
// so tests never touch Firebase.
export function firestore(): Firestore {
  db ??= getFirestore(initializeApp());
  return db;
}
