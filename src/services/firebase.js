// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDDn0scNPa0ShKCzal-LA__jnJvJXu2Hhc",
  authDomain: "la-reserva-ad06d.firebaseapp.com",
  projectId: "la-reserva-ad06d",
  storageBucket: "la-reserva-ad06d.firebasestorage.app",
  messagingSenderId: "442213613501",
  appId: "1:442213613501:web:b4276ad3174f11513e5cd4",
  measurementId: "G-D4GYRPK8PQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export { app, analytics };
