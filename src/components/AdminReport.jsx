
function AdminExport() {
  const aportes = load(LS_KEYS.aportes, []);
  const reportes = load(LS_KEYS.reportes, []);
  const [pass, setPass] = useState("");

  function exportarDatos() {
    if (pass !== "TallerUNO") {
      alert("Acceso restringido: clave incorrecta");
      return;
    }
    // Exporta dos CSV: aportes y reportes
    exportCSV(
      `aportes_${new Date().toISOString().slice(0, 10)}`,
      aportes.flatMap((a) =>
        a.items.map((it) => ({
          aporte_id: a.id,
          fecha: a.fecha,
          vecino: a.vecino,
          material: it.materialId,
          cantidad: it.cantidad,
          limpio: it.limpio,
          humedo: !!it.humedo,
          roto: !!it.roto,
          notas: a.notas || "",
        }))
      )
    );
    exportCSV(
      `reportes_${new Date().toISOString().slice(0, 10)}`,
      reportes.map((r) => ({
        id: r.id,
        fecha: r.fecha,
        porcentajeNoReciclable: r.porcentajeNoReciclable,
        observaciones: r.observaciones || "",
      }))
    );
  }

  return (
    <section className="py-10">
      <h2 className="text-xl font-bold mb-2">Administración (Taller UNO)</h2>
      <p className="text-sm text-slate-600 mb-4">
        Descargá plantillas CSV con los datos comunitarios para análisis en Excel.
      </p>

      <div className="grid md:grid-cols-3 gap-4 items-end">
        <div className="md:col-span-2 rounded-2xl border bg-white p-4">
          <label className="text-sm font-medium">Clave de acceso</label>
          <input
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            className="mt-1 w-full rounded-lg border px-3 py-2"
            placeholder="Ingresá la clave"
          />
        </div>
        <button
          onClick={exportarDatos}
          className="px-4 py-2 rounded-xl bg-emerald-600 text-white flex items-center gap-2"
        >
          <FolderDown className="w-4 h-4" /> Exportar CSV
        </button>
      </div>

      <div className="mt-6 rounded-2xl border bg-white p-4 text-sm text-slate-600">
        <p>
          Nota: la app guarda datos localmente (localStorage) solo con fines demostrativos. En una versión productiva,
          los aportes se registrarían en una base de datos y los recordatorios se enviarían por un servicio de
          mensajería (p. ej., WhatsApp/Facebook/Email).
        </p>
      </div>
    </section>
  );
}

export default AdminExport;