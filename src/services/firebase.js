// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, signInAnonymously } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDDn0scNPa0ShKCzal-LA__jnJvJXu2Hhc",
  authDomain: "la-reserva-ad06d.firebaseapp.com",
  projectId: "la-reserva-ad06d",
  storageBucket: "la-reserva-ad06d.firebasestorage.app",
  messagingSenderId: "442213613501",
  appId: "1:442213613501:web:b4276ad3174f11513e5cd4",
  measurementId: "G-D4GYRPK8PQ",
};

const app = initializeApp(firebaseConfig);

// Analytics funciona en https/localhost; envolvemos en try/catch para evitar errores en dev
let analytics;
try { analytics = getAnalytics(app); } catch (_) {}

const auth = getAuth(app);
const db = getFirestore(app);

// login anónimo para que las reglas request.auth != null se cumplan
signInAnonymously(auth).catch((e) => console.error("Auth anónima falló:", e));

export { app, analytics, auth, db };
