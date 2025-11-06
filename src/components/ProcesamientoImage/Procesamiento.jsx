import React, { useEffect, useRef, useState } from "react";
import { Upload, Image as ImageIcon, Loader2 } from "lucide-react";
import * as tf from "@tensorflow/tfjs";

// 👇 Orden EXACTO de las clases en Teachable Machine
const CLASS_IDS = ["Aluminio", "Otro"];

const NOMBRES_MATERIALES = {
  Aluminio: "Aluminio",
  Otro: "Otro / No aluminio",
  desconocido: "No reconocido",
};

export default function ProcesamientoImagenes({ onMaterialDetectado }) {
  const [imagen, setImagen] = useState(null);
  const [procesando, setProcesando] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [error, setError] = useState("");
  const [modelo, setModelo] = useState(null);
  const [cargandoModelo, setCargandoModelo] = useState(true);

  const imgRef = useRef(null);

  // Cargar modelo una sola vez al montar
  useEffect(() => {
    async function cargarModelo() {
      try {
        const base = import.meta.env.BASE_URL || "/";
        const MODEL_URL = `${base}modelo-materiales/model.json`;

        console.log("Intentando cargar modelo desde:", MODEL_URL);

        // Teachable Machine (image project web) → LayersModel
        const m = await tf.loadLayersModel(MODEL_URL);
        setModelo(m);
        console.log("✅ Modelo cargado", m);
      } catch (err) {
        console.error("Error cargando modelo:", err);
        setError(
          "No se pudo cargar el modelo de IA. Revisá la ruta del model.json (mirá consola)."
        );
      } finally {
        setCargandoModelo(false);
      }
    }
    cargarModelo();
  }, []);

  function handleFile(e) {
    const file = e.target.files[0];
    if (file) {
      setImagen(URL.createObjectURL(file));
      setResultado(null);
      setError("");
    }
  }

  async function procesarImagen() {
    if (!imagen) return alert("Subí una imagen primero");
    if (!modelo) {
      return alert("El modelo de IA no está listo todavía.");
    }

    setProcesando(true);
    setResultado(null);
    setError("");

    try {
      // Darle un toque para que la imagen se pinte en el DOM
      await new Promise((r) => setTimeout(r, 50));

      const imgEl = imgRef.current;
      if (!imgEl) {
        throw new Error("No se encontró el elemento de imagen");
      }

      const IMAGE_SIZE = 224; // tamaño típico de Teachable Machine

      const input = tf.tidy(() => {
        return tf.browser
          .fromPixels(imgEl)
          .resizeBilinear([IMAGE_SIZE, IMAGE_SIZE])
          .toFloat()
          .div(255.0)
          .expandDims(0); // [1, h, w, 3]
      });

      const preds = modelo.predict(input);
      const data = await preds.data();
      tf.dispose([input, preds]);

      console.log("📊 Predicciones crudas:", data); // ej. [0.85, 0.15]

      // Buscar la clase con mayor probabilidad
      let maxIdx = 0;
      let maxVal = data[0];
      for (let i = 1; i < data.length; i++) {
        if (data[i] > maxVal) {
          maxVal = data[i];
          maxIdx = i;
        }
      }

      let materialId = CLASS_IDS[maxIdx] || "desconocido";
      const confianza = Math.round(maxVal * 100);

      // Umbral: si la confianza es baja, marcamos como desconocido
      const UMBRAL_CONF = 60; // podés ajustar
      if (confianza < UMBRAL_CONF) {
        materialId = "desconocido";
      }

      const res = {
        materialId,
        nombre: NOMBRES_MATERIALES[materialId] || materialId,
        confianza,
      };

      setResultado(res);

      // Avisar al padre solo si realmente detectó "Aluminio"
      if (onMaterialDetectado && materialId === "Aluminio") {
        onMaterialDetectado(res);
      }
    } catch (err) {
      console.error("Error al procesar imagen:", err);
      setError("Ocurrió un error al analizar la imagen.");
    } finally {
      setProcesando(false);
    }
  }

  return (
    <section className="py-10">
      <h2 className="text-xl font-bold mb-3">Procesamiento de imágenes con IA</h2>
      <p className="text-sm text-slate-600 mb-5">
        Subí una foto de un material; el modelo trata de distinguir entre Aluminio y Otro
        tipo de material. Podés corregir el resultado en el formulario.
      </p>

      <div className="rounded-2xl border bg-white p-5 flex flex-col items-center gap-4">
        <label className="flex flex-col items-center cursor-pointer border rounded-xl px-4 py-6 bg-emerald-50 hover:bg-emerald-100">
          <Upload className="w-6 h-6 mb-2 text-emerald-700" />
          <span className="text-sm font-medium text-emerald-800">
            Seleccionar imagen
          </span>
          <input
            type="file"
            accept="image/*"
            onChange={handleFile}
            className="hidden"
          />
        </label>

        {imagen && (
          <div className="w-full md:w-1/2">
            <img
              ref={imgRef}
              src={imagen}
              alt="Preview"
              className="rounded-xl border shadow-sm w-full object-contain max-h-64"
            />
          </div>
        )}

        <button
          onClick={procesarImagen}
          disabled={!imagen || procesando || cargandoModelo}
          className="px-4 py-2 rounded-xl bg-emerald-600 text-white flex items-center gap-2 disabled:opacity-50"
        >
          {procesando ? (
            <Loader2 className="animate-spin w-4 h-4" />
          ) : (
            <ImageIcon className="w-4 h-4" />
          )}
          {cargandoModelo ? "Cargando modelo..." : "Procesar imagen"}
        </button>

        {error && (
          <div className="mt-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {resultado && (
          <div className="mt-6 w-full md:w-2/3 rounded-2xl border bg-white p-4 text-sm text-slate-700">
            <div className="font-semibold mb-1">Resultado del modelo:</div>
            <p>
              Material detectado:{" "}
              <span className="font-semibold">{resultado.nombre}</span>
            </p>
            <p>Confianza: {resultado.confianza}%</p>
            <p className="mt-2 text-xs text-slate-500">
              Este resultado es una ayuda automática. Revisá y corregí si no
              coincide con el material real.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
