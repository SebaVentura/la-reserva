import React, { useEffect, useMemo, useState } from "react";

import { guardarAporte } from "../services/aportes";

import {
  Recycle,
  Bell,
  ChartBar,
  BookOpen,
  Users,
  MessageSquareText,
  Settings,
  FolderDown,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";


// ======= CONFIGURACIÓN Y DATOS BASE ======= //
const MATERIALES = [
  { id: "aluminio", nombre: "Aluminio", tipo: "metal" },
  { id: "carton", nombre: "Cartón", tipo: "papel" },
  { id: "papel", nombre: "Papel", tipo: "papel" },
  { id: "chatarra", nombre: "Chatarra / Hojalata", tipo: "metal" },
  { id: "nylon", nombre: "Nylon", tipo: "plastico" },
  { id: "plasticos", nombre: "Plásticos", tipo: "plastico" },
  { id: "telgopor", nombre: "Telgopor", tipo: "plastico" },
  { id: "tetra", nombre: "Tetra", tipo: "compuesto" },
  { id: "vidrio", nombre: "Vidrio", tipo: "vidrio" },
];

const KB_REGLAS = {
  aluminio: [
    "Enjuagar latas para remover restos.",
    "Aplastar para reducir volumen.",
  ],
  carton: ["Evitar que esté húmedo o con grasa.", "Doblar/compactar cajas."],
  papel: [
    "No incluir papel sanitario ni servilletas sucias.",
    "Quitar clips/espirales si es posible.",
  ],
  chatarra: [
    "Elementos pequeños y limpios.",
    "Evitar puntas cortantes sueltas: proteger en bolsa.",
  ],
  nylon: ["Lavar y secar.", "Evitar mezclar con films muy sucios."],
  plasticos: [
    "Enjuagar envases.",
    "Tapas y etiquetas pueden ir (si están limpias).",
  ],
  telgopor: ["Limpio y seco.", "No romper en migas: embolsar."],
  tetra: ["Enjuagar, escurrir, aplastar.", "Dejar la tapa colocada."],
  vidrio: [
    "Enjuagar frascos y botellas.",
    "No incluir vidrios rotos sueltos (proteger).",
  ],
};

// Claves de almacenamiento local
const LS_KEYS = {
  aportes: "lareserva_aportes", // lista de aportes de los vecinos
  recordatorios: "lareserva_recordatorios", // fecha/hora de recordatorio próxima recolección
  reportes: "lareserva_reportes", // reportes semanales agregados a nivel barrio
};

// ======= UTILIDADES ======= //
function clsx(...xs) {
  return xs.filter(Boolean).join(" ");
}

function fmtDate(d) {
  return new Date(d).toLocaleString();
}

function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function load(key, fallback) {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch {
    return fallback;
  }
}

// Exportación CSV simple para Taller UNO
function exportCSV(nombre, rows) {
  const headers = Array.from(
    rows.reduce((set, row) => {
      Object.keys(row).forEach((k) => set.add(k));
      return set;
    }, new Set())
  );
  const csv = [headers.join(",")]
    .concat(
      rows.map((r) =>
        headers
          .map((h) => {
            const v = r[h] ?? "";
            const s = typeof v === "string" ? v : JSON.stringify(v);
            return `"${s.replace(/"/g, '""')}"`;
          })
          .join(",")
      )
    )
    .join("\n");
  const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${nombre}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// Sugerencias educativas automáticas (motor muy simple estilo "IA offline")
function sugerenciasEducativas(aporte) {
  const tips = [];
  for (const item of aporte.items) {
    if (["plasticos", "nylon", "tetra"].includes(item.materialId) && !item.limpio) {
      tips.push("Recordá enjuagar plásticos/nylon/tetra para mejorar la calidad.");
    }
    if (item.materialId === "carton" && item.humedo) {
      tips.push("El cartón húmedo no se recupera: mantenelo seco.");
    }
    if (item.materialId === "vidrio" && item.roto) {
      tips.push("Si el vidrio está roto, envolvelo para evitar riesgos.");
    }
  }
  return Array.from(new Set(tips));
}
function AportesForm() {
  // ===== Estado unificado del aporte =====
  const EMPTY_MATERIALES = MATERIALES.map(m => ({
    materialId: m.id,
    cantidad: 0,
    unidad: "kg/unidad",
    limpio: true,
    humedo: false,
    roto: false,
  }));

  const [aporte, setAporte] = useState({
    alias: "",          // "Calle / Manzana / Alias" (opcional)
    direccion: "",      // si querés separar alias/dirección
    notas: "",
    observaciones: "",
    items: EMPTY_MATERIALES,
  });

  const [sugerencias, setSugerencias] = useState([]);
  const aportes = load(LS_KEYS.aportes, []);

  // ===== Helpers =====
  const updateAporte = (patch) =>
    setAporte(a => ({ ...a, ...patch }));

  const updateMaterial = (materialId, patch) =>
    setAporte(a => ({
      ...a,
      items: a.items.map(it =>
        it.materialId === materialId ? { ...it, ...patch } : it
      ),
    }));

  // ===== Acciones =====
  function handlePrevisualizar() {
    const fake = {
      ...aporte,
      id: crypto.randomUUID(),
      fecha: new Date().toISOString(),
      items: aporte.items.filter(i => i.cantidad > 0),
    };
    setSugerencias(sugerenciasEducativas(fake));
  }

  // dentro de AportesForm, reemplazá handleGuardar por este:
async function handleGuardar() {
  // armamos objeto desde el state unificado
  const toSave = {
    ...aporte,
    // items ya está en aporte.items; filtramos en el servicio
  };

  try {
    const id = await guardarAporte(toSave);
    // reset UI
    setAporte({
      alias: "",
      direccion: "",
      notas: "",
      observaciones: "",
      items: MATERIALES.map(m => ({
        materialId: m.id,
        cantidad: 0,
        unidad: "kg/unidad",
        limpio: true,
        humedo: false,
        roto: false,
      })),
    });
    setSugerencias([]);
    alert(`¡Gracias! Aporte guardado en Firebase. ID: ${id}`);
  } catch (err) {
    console.error(err);
    alert("❌ No se pudo guardar en Firebase. Revisá consola y reglas.");
  }
}


  return (
    <section className="py-10">
      <h2 className="text-xl font-bold mb-2">Cargar aporte vecinal</h2>
      <p className="text-sm text-slate-600 mb-4">
        Indicá cantidades aproximadas (kg o unidades). Los datos serán usados para estadísticas comunitarias.
      </p>

      {/* === Grid de materiales === */}
      <div className="grid md:grid-cols-3 gap-4">
        {MATERIALES.map((m) => {
const it = aporte.items.find(x => x.materialId === m.id) || {
  materialId: m.id,
  cantidad: 0,
  unidad: "kg/unidad",
  limpio: true,
  humedo: false,
  roto: false,
};
          return (
            <div key={m.id} className="rounded-2xl border bg-white p-4 space-y-3">
              <div className="font-medium">{m.nombre}</div>

              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  value={it.cantidad}
                  onChange={(e) =>
                    updateMaterial(m.id, { cantidad: Number(e.target.value || 0) })
                  }
                  className="w-24 rounded-lg border px-2 py-1"
                />
                <span className="text-sm text-slate-500">kg/unid</span>
              </div>

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={it.limpio}
                  onChange={(e) => updateMaterial(m.id, { limpio: e.target.checked })}
                />
                Limpio
              </label>

              {m.id === "carton" && (
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={it.humedo}
                    onChange={(e) => updateMaterial(m.id, { humedo: e.target.checked })}
                  />
                  ¿Húmedo?
                </label>
              )}

              {m.id === "vidrio" && (
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={it.roto}
                    onChange={(e) => updateMaterial(m.id, { roto: e.target.checked })}
                  />
                  ¿Roto?
                </label>
              )}
            </div>
          );
        })}
      </div>

      {/* === Datos del aporte === */}
      <div className="mt-6 grid md:grid-cols-2 gap-4">
        <div className="rounded-2xl border bg-white p-4">
          <label className="text-sm font-medium">Alias (opcional)</label>
          <input
            value={aporte.alias}
            onChange={(e) => updateAporte({ alias: e.target.value })}
            className="mt-1 w-full rounded-lg border px-3 py-2"
            placeholder="Calle / Manzana / Alias"
          />
        </div>

        <div className="rounded-2xl border bg-white p-4">
          <label className="text-sm font-medium">Notas</label>
          <textarea
            value={aporte.notas}
            onChange={(e) => updateAporte({ notas: e.target.value })}
            className="mt-1 w-full rounded-lg border px-3 py-2"
            rows={3}
            placeholder="Observaciones breves"
          />
        </div>
      </div>

      {/* === Acciones === */}
      <div className="flex flex-wrap gap-3 mt-5">
        <button
          onClick={handlePrevisualizar}
          className="px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-200"
        >
          Previsualizar sugerencias
        </button>
        <button
          onClick={handleGuardar}
          className="px-4 py-2 rounded-xl bg-emerald-600 text-white"
        >
          Guardar aporte
        </button>
      </div>

      {/* === Sugerencias === */}
      {sugerencias.length > 0 && (
        <div className="mt-6 rounded-2xl border bg-white p-4">
          <div className="font-medium mb-2">Sugerencias educativas</div>
          <ul className="list-disc list-inside text-sm text-slate-700 space-y-1">
            {sugerencias.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

export default AportesForm;