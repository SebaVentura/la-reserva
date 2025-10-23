// src/services/aportes.js
import { db } from "./firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

export async function guardarAporte(aporte) {
  // Normalizamos el payload al shape esperado en base:
  const payload = {
    alias: aporte.alias?.trim() || null,
    direccion: aporte.direccion?.trim() || null,
    notas: aporte.notas?.trim() || null,
    observaciones: aporte.observaciones?.trim() || null,
    vecino: (aporte.alias?.trim() || "(anónimo)"), // compat con tus dashboards actuales
    items: (aporte.items || [])
      .filter(i => (i?.cantidad ?? 0) > 0)
      .map(i => ({
        materialId: i.materialId,
        cantidad: Number(i.cantidad || 0),
        unidad: i.unidad || "kg/unidad",
        limpio: !!i.limpio,
        humedo: i.humedo ?? null,
        roto: i.roto ?? null,
      })),
    createdAt: serverTimestamp(),
  };

  const ref = await addDoc(collection(db, "aportes"), payload);
  return ref.id;
}
