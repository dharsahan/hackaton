import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  projectId: "farmertopia-prod-v1",
  appId: "1:725194566207:web:4508fe56b54d36d9a1268a",
  storageBucket: "farmertopia-prod-v1.firebasestorage.app",
  apiKey: "AIzaSyC10nuXUUXskw52GBi3ayAm45Qmle0e4tA",
  authDomain: "farmertopia-prod-v1.firebaseapp.com",
  messagingSenderId: "725194566207"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);

// Enable persistence only on client-side
if (typeof window !== "undefined") {
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn("Multiple tabs open, persistence can only be enabled in one tab at a time.");
    } else if (err.code === 'unimplemented') {
      console.warn("The current browser does not support all of the features required to enable persistence");
    }
  });
}

export const auth = getAuth(app);
