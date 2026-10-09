import { initializeApp } from "firebase-admin/app";
import type { App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import type { Firestore } from "firebase-admin/firestore";

let app: App | undefined;

// Initialised on first use, with the service account in GOOGLE_APPLICATION_CREDENTIALS,
// so tests never touch Firebase.
function firebaseApp(): App {
  if (app === undefined) {
    app = initializeApp();
  }
  return app;
}

export function firestore(): Firestore {
  return getFirestore(firebaseApp());
}

export async function verifyIdToken(token: string): Promise<string> {
  const decoded = await getAuth(firebaseApp()).verifyIdToken(token);
  return decoded.uid;
}
