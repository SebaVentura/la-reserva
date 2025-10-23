
// src/firebaseTest.js
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { app } from "./services/firebase";

const db = getFirestore(app);

export async function testFirebaseConnection() {
  try {
    console.log("🟢 Conectando a Firebase...");
    // Intenta leer una colección de prueba (podés crearla en Firestore)
    const snapshot = await getDocs(collection(db, "test"));
    console.log("✅ Conexión exitosa a Firestore");
    snapshot.forEach((doc) => {
      console.log(`${doc.id} =>`, doc.data());
    });
  } catch (error) {
    console.error("❌ Error al conectar con Firebase:", error);
  }
}
