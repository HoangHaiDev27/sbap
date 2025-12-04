import { getFirebaseApp } from "./firebase";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";

let recaptchaVerifier;

export function getAuthInstance() {
  const app = getFirebaseApp();
  return getAuth(app);
}

export function setupInvisibleRecaptcha(containerId = "recaptcha-container") {
  const auth = getAuthInstance();
  if (!recaptchaVerifier) {
    recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
      size: "invisible"
    });
  }
  return recaptchaVerifier;
}

export async function sendOtpToPhone(phoneE164, containerId) {
  const auth = getAuthInstance();
  const verifier = setupInvisibleRecaptcha(containerId);
  return await signInWithPhoneNumber(auth, phoneE164, verifier);
}


