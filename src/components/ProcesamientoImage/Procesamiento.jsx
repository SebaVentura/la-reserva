import React, { useState } from "react";
import { Upload, Image as ImageIcon, Loader2 } from "lucide-react";

// === Componente: Procesamiento de Imágenes (simulación de API) === //
export default function ProcesamientoImagenes() {
  const [imagen, setImagen] = useState(null);
  const [procesando, setProcesando] = useState(false);
  const [resultado, setResultado] = useState(null);

  function handleFile(e) {
    const file = e.target.files[0];
    if (file) {
      setImagen(URL.createObjectURL(file));
      setResultado(null);
    }
  }

  async function procesarImagen() {
    if (!imagen) return alert("Subí una imagen primero");
    setProcesando(true);

    // Simulación de análisis en servidor (detección de materiales o etiquetas)
    setTimeout(() => {
      const etiquetas = ["plástico", "vidrio", "metal", "papel", "orgánico"];
      const hallazgos = Array.from(
        { length: Math.floor(Math.random() * 3) + 1 },
        () => etiquetas[Math.floor(Math.random() * etiquetas.length)]
      );

      const probabilidad = (Math.random() * 20 + 80).toFixed(1);
      setResultado({ etiquetas: hallazgos, confianza: probabilidad });
      setProcesando(false);
    }, 1200);
  }

  return (
    <section className="py-10">
      <h2 className="text-xl font-bold mb-3">Procesamiento de imágenes (simulación API)</h2>
      <p className="text-sm text-slate-600 mb-5">
        Cargá una imagen y simulá el análisis del servidor para identificar materiales o categorías.
      </p>

      <div className="rounded-2xl border bg-white p-5 flex flex-col items-center gap-4">
        <label className="flex flex-col items-center cursor-pointer border rounded-xl px-4 py-6 bg-emerald-50 hover:bg-emerald-100">
          <Upload className="w-6 h-6 mb-2 text-emerald-700" />
          <span className="text-sm font-medium text-emerald-800">Seleccionar imagen</span>
          <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
        </label>

        {imagen && (
          <div className="w-full md:w-1/2">
            <img src={imagen} alt="Preview" className="rounded-xl border shadow-sm w-full" />
          </div>
        )}

        <button
          onClick={procesarImagen}
          disabled={!imagen || procesando}
          className="px-4 py-2 rounded-xl bg-emerald-600 text-white flex items-center gap-2 disabled:opacity-50"
        >
          {procesando ? <Loader2 className="animate-spin w-4 h-4" /> : <ImageIcon className="w-4 h-4" />} Procesar imagen
        </button>

        {resultado && (
          <div className="mt-6 w-full md:w-2/3 rounded-2xl border bg-white p-4 text-sm text-slate-700">
            <div className="font-semibold mb-1">Resultado del servidor simulado:</div>
            <ul className="list-disc list-inside">
              {resultado.etiquetas.map((et, i) => (
                <li key={i}>{et}</li>
              ))}
            </ul>
            <p className="mt-2 text-emerald-700">
              Confianza promedio: {resultado.confianza}%
            </p>
          </div>
        )}
      </div>
    </section>
  );
}