import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported as analyticsIsSupported } from "firebase/analytics";

// Keep config here; in production consider moving to env vars
const firebaseConfig = {
  apiKey: "AIzaSyBd01RXbxq5J92r9OuP7ZeCrJ98jFDxtQY",
  authDomain: "viebook-df8d2.firebaseapp.com",
  projectId: "viebook-df8d2",
  storageBucket: "viebook-df8d2.firebasestorage.app",
  messagingSenderId: "492800048365",
  appId: "1:492800048365:web:3566b926119f882f71a0e4",
  measurementId: "G-LHQH98Z10B"
};

let app;
let analytics;

export function getFirebaseApp() {
  if (!app) {
    app = initializeApp(firebaseConfig);
    // Analytics only if supported (browser contexts)
    analyticsIsSupported().then((supported) => {
      if (supported) {
        try { analytics = getAnalytics(app); } catch { /* noop */ }
      }
    });
  }
  return app;
}

export function getFirebaseAnalytics() {
  return analytics;
}


