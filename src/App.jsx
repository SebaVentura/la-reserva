import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { testFirebaseConnection } from "./firabasetest";
import AportesForm from "./components/Aportes";
import AdminExport from "./components/AdminReport";
import ProcesamientoImagenes from "./components/ProcesamientoImage/Procesamiento";
import {
  Recycle,
  Bell,
  ChartBar,
  BookOpen,
  Users,
  MessageSquareText,
  Settings,
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

// Exportación CSV simple (por si la usás luego)
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

// Sugerencias educativas automáticas (motor simple "IA offline")
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

// ======= APP ======= //
export default function App() {
  useEffect(() => {
    testFirebaseConnection();
  }, []);

  const [tab, setTab] = useState("inicio");
  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white text-slate-800">
      <Header onChangeTab={setTab} tab={tab} />
      <main className="mx-auto max-w-6xl px-4 pb-24">
        {tab === "inicio" && <Inicio />}
        {tab === "guia" && <GuiaReciclaje />}
        {tab === "aportes" && <AportesForm />}
        {tab === "recordatorios" && <Recordatorios />}
        {tab === "comunidad" && <ComunidadDashboard />}
        {tab === "Imagenes" && <ProcesamientoImagenes />}
        {tab === "reportes" && <ReportesSemanales />}
        {tab === "admin" && <AdminExport />}
      </main>
      <Footer />
    </div>
  );
}

function Header({ tab, onChangeTab }) {
  const tabs = [
    { key: "inicio", label: "Inicio", icon: <Recycle className="w-4 h-4" /> },
    { key: "guia", label: "Guía", icon: <BookOpen className="w-4 h-4" /> },
    { key: "aportes", label: "Aportes", icon: <MessageSquareText className="w-4 h-4" /> },
    { key: "recordatorios", label: "Recordatorios", icon: <Bell className="w-4 h-4" /> },
    { key: "comunidad", label: "Comunidad", icon: <Users className="w-4 h-4" /> },
    { key: "reportes", label: "Reportes", icon: <ChartBar className="w-4 h-4" /> },
    { key: "admin", label: "Admin", icon: <Settings className="w-4 h-4" /> },
  ];
  return (
    <div className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center gap-3 justify-between">
        <div className="flex items-center gap-3">
          <Recycle className="w-6 h-6 text-emerald-600" />
          <span className="font-semibold">Proyecto “La Reserva”</span>
        </div>
        <nav className="flex flex-wrap items-center gap-2">
          {tabs.map(({ key, label, icon }) => (
            <button
              key={key}
              onClick={() => onChangeTab(key)}
              className={clsx(
                "px-3 py-1.5 rounded-full text-sm border transition",
                tab === key
                  ? "bg-emerald-600 text-white border-emerald-600 shadow"
                  : "bg-white hover:bg-emerald-50 border-slate-200"
              )}
            >
              <span className="inline-flex items-center gap-2">
                {icon}
                {label}
              </span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}

function Footer() {
  return (
    <div className="border-t py-6 text-center text-xs text-slate-500">
      Taller UNO · Educación ambiental y economía circular — App demo comunitaria
    </div>
  );
}

// ======= SECCIONES ======= //
function Inicio() {
  return (
    <section className="py-10">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Bienvenidos/as</h1>
        <p className="text-slate-600 max-w-2xl">
          Esta app comunitaria acompaña la separación en origen, envía recordatorios de recolección,
          brinda recomendaciones educativas y genera reportes semanales agregados a nivel barrio.
          Los datos son comunitarios, no individuales.
        </p>
      </motion.div>
      <div className="grid md:grid-cols-3 gap-4 mt-8">
        <Card
          title="Guía de separación"
          desc="Consejos por material"
          icon={<BookOpen className="w-5 h-5" />}
        />
        <Card
          title="Cargar aporte"
          desc="Indicá qué residuos generaste"
          icon={<MessageSquareText className="w-5 h-5" />}
        />
        <Card
          title="Ver evolución"
          desc="Dashboard comunitario"
          icon={<ChartBar className="w-5 h-5" />}
        />
      </div>
    </section>
  );
}

function Card({ title, desc, icon }) {
  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3 mb-2 text-emerald-700">
        {icon}
        <h3 className="font-semibold">{title}</h3>
      </div>
      <p className="text-sm text-slate-600">{desc}</p>
    </div>
  );
}

function GuiaReciclaje() {
  const grupos = useMemo(() => {
    const g = {};
    for (const m of MATERIALES) {
      g[m.tipo] = g[m.tipo] || [];
      g[m.tipo].push(m);
    }
    return g;
  }, []);

  return (
    <section className="py-10">
      <h2 className="text-xl font-bold mb-4">Guía por material</h2>
      <div className="grid md:grid-cols-2 gap-4">
        {Object.entries(grupos).map(([tipo, arr]) => (
          <div key={tipo} className="rounded-2xl border bg-white p-4">
            <h3 className="font-semibold capitalize mb-3">{tipo}</h3>
            <ul className="space-y-3">
              {arr.map((m) => (
                <li key={m.id} className="border rounded-xl p-3">
                  <div className="font-medium">{m.nombre}</div>
                  <ul className="list-disc list-inside text-sm text-slate-600">
                    {KB_REGLAS[m.id].map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

function Recordatorios() {
  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("");
  const [mensaje, setMensaje] = useState("¡Sale recolección! Prepará tus reciclables limpios y secos.");
  const [actual, setActual] = useState(load(LS_KEYS.recordatorios, null));

  function guardar() {
    if (!fecha || !hora) {
      alert("Completá fecha y hora");
      return;
    }
    const iso = new Date(`${fecha}T${hora}`).toISOString();
    const rec = { proximaFechaISO: iso, mensaje };
    save(LS_KEYS.recordatorios, rec);
    setActual(rec);
    setFecha("");
    setHora("");
    alert("Recordatorio programado (local, demostración)");
  }

  return (
    <section className="py-10">
      <h2 className="text-xl font-bold mb-2">Recordatorios de recolección</h2>
      <p className="text-sm text-slate-600 mb-4">
        Configurá un recordatorio local (simulado). En producción real se conectaría a un servicio de mensajería.
      </p>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="rounded-2xl border bg-white p-4">
          <label className="text-sm font-medium">Fecha</label>
          <input
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            className="mt-1 w-full rounded-lg border px-3 py-2"
          />
        </div>
        <div className="rounded-2xl border bg-white p-4">
          <label className="text-sm font-medium">Hora</label>
          <input
            type="time"
            value={hora}
            onChange={(e) => setHora(e.target.value)}
            className="mt-1 w-full rounded-lg border px-3 py-2"
          />
        </div>
        <div className="rounded-2xl border bg-white p-4">
          <label className="text-sm font-medium">Mensaje</label>
          <input
            value={mensaje}
            onChange={(e) => setMensaje(e.target.value)}
            className="mt-1 w-full rounded-lg border px-3 py-2"
          />
        </div>
      </div>

      <div className="flex gap-3 mt-5">
        <button onClick={guardar} className="px-4 py-2 rounded-xl bg-emerald-600 text-white">
          Guardar recordatorio
        </button>
      </div>

      {actual && (
        <div className="mt-6 rounded-2xl border bg-white p-4">
          <div className="text-sm text-slate-600">Próximo recordatorio</div>
          <div className="font-medium">{fmtDate(actual.proximaFechaISO)}</div>
          <div className="text-sm">{actual.mensaje}</div>
        </div>
      )}
    </section>
  );
}

function ComunidadDashboard() {
  const aportes = load(LS_KEYS.aportes, []);

  const resumenPorMaterial = useMemo(() => {
    const acc = {};
    for (const ap of aportes) {
      for (const it of ap.items) {
        acc[it.materialId] = (acc[it.materialId] || 0) + (it.cantidad || 0);
      }
    }
    return Object.entries(acc).map(([materialId, total]) => ({
      material: MATERIALES.find((m) => m.id === materialId)?.nombre || materialId,
      total,
    }));
  }, [aportes]);

  const serieTemporal = useMemo(() => {
    // Sumar por fecha (día)
    const byDay = {};
    for (const ap of aportes) {
      const day = new Date(ap.fecha).toISOString().slice(0, 10);
      const suma = ap.items.reduce((s, it) => s + (it.cantidad || 0), 0);
      byDay[day] = (byDay[day] || 0) + suma;
    }
    return Object.entries(byDay)
      .map(([fecha, total]) => ({ fecha, total }))
      .sort((a, b) => a.fecha.localeCompare(b.fecha));
  }, [aportes]);

  return (
    <section className="py-10">
      <h2 className="text-xl font-bold mb-2">Evolución comunitaria</h2>
      <p className="text-sm text-slate-600 mb-4">Totales agregados a nivel barrio (demo, datos locales).</p>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="rounded-2xl border bg-white p-4 h-[360px]">
          <div className="font-medium mb-2">Aportes por material</div>
          <ResponsiveContainer width="100%" height="90%">
            <BarChart data={resumenPorMaterial}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="material" interval={0} angle={-15} textAnchor="end" height={60} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="total" name="Total" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="rounded-2xl border bg-white p-4 h-[360px]">
          <div className="font-medium mb-2">Serie temporal (kg/unid por día)</div>
          <ResponsiveContainer width="100%" height="90%">
            <BarChart data={serieTemporal}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="fecha" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="total" name="Total diario" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}

function ReportesSemanales() {
  const [porc, setPorc] = useState("");
  const [obs, setObs] = useState("");
  const reportes = load(LS_KEYS.reportes, []);

  function publicar() {
    const valor = Number(porc.replace(",", "."));
    if (isNaN(valor) || valor < 0 || valor > 100) {
      alert("Ingresá un porcentaje válido entre 0 y 100");
      return;
    }
    const r = {
      id: crypto.randomUUID(),
      fecha: new Date().toISOString(),
      porcentajeNoReciclable: valor,
      observaciones: obs || undefined,
    };
    const next = [r, ...reportes];
    save(LS_KEYS.reportes, next);
    setPorc("");
    setObs("");
  }

  return (
    <section className="py-10">
      <h2 className="text-xl font-bold mb-2">Reporte semanal (difusión comunitaria)</h2>
      <p className="text-sm text-slate-600 mb-4">
        Aproximadamente una semana después de cada recolección, publicá el % de material no reciclable detectado en planta.
      </p>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="rounded-2xl border bg-white p-4">
          <label className="text-sm font-medium">% no reciclable</label>
          <input
            value={porc}
            onChange={(e) => setPorc(e.target.value)}
            className="mt-1 w-full rounded-lg border px-3 py-2"
            placeholder="Ej: 7.5"
          />
        </div>
        <div className="md:col-span-2 rounded-2xl border bg-white p-4">
          <label className="text-sm font-medium">Observaciones</label>
          <input
            value={obs}
            onChange={(e) => setObs(e.target.value)}
            className="mt-1 w-full rounded-lg border px-3 py-2"
            placeholder="Errores comunes, recomendaciones, próximos pasos"
          />
        </div>
      </div>

      <div className="flex gap-3 mt-5">
        <button onClick={publicar} className="px-4 py-2 rounded-xl bg-emerald-600 text-white">
          Publicar reporte
        </button>
      </div>

      <div className="mt-8 grid md:grid-cols-2 gap-4">
        {reportes.map((r) => (
          <div key={r.id} className="rounded-2xl border bg-white p-4">
            <div className="text-xs text-slate-500">{fmtDate(r.fecha)}</div>
            <div className="font-semibold text-lg">
              No reciclable: {r.porcentajeNoReciclable.toFixed(2)}%
            </div>
            {r.observaciones && <div className="text-sm mt-1">{r.observaciones}</div>}
            <div className="text-sm text-emerald-700 mt-2">
              {mensajeDifusion(r.porcentajeNoReciclable)}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function mensajeDifusion(porcentaje) {
  if (porcentaje < 5)
    return "¡Excelente! El barrio está separando muy bien. Sigamos así.";
  if (porcentaje < 12)
    return "Muy bien. Podemos mejorar en plásticos limpios y cartones secos.";
  if (porcentaje < 20)
    return "Bien, pero hay oportunidades: revisar humedad en cartones y restos en envases.";
  return "Atención: necesitamos reforzar la separación. Leé la guía y prepará tus reciclables limpios y secos.";
}
