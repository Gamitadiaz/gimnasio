import type { Serie, Sesion } from "./datos";
import { CARDIO_INICIAL, CARDIO_MAXIMO, type Ejercicio, ROTACION, type TipoSesion } from "./plan";

// Reglas para decidir qué toca hoy y cuánto peso usar.

const terminadas = (sesiones: Sesion[]) => sesiones.filter((s) => s.fin);

// La siguiente sesión de la rotación, según la última que hiciste (sin contar "Estirar").
export function siguienteSesion(sesiones: Sesion[]): TipoSesion {
  const ultima = terminadas(sesiones)
    .filter((s) => s.tipo !== "estirar")
    .at(-1);
  if (!ultima) return ROTACION[0];
  return ROTACION[(ROTACION.indexOf(ultima.tipo) + 1) % ROTACION.length];
}

// Las series de la última vez que hiciste este ejercicio.
export function ultimaVez(sesiones: Sesion[], ejercicioId: string): Serie[] | undefined {
  for (const sesion of terminadas(sesiones).toReversed()) {
    const series = sesion.series[ejercicioId];
    if (series?.length) return series;
  }
  return undefined;
}

export type Sugerencia = { peso: number; meta: number; texto: string; tono: "subir" | "igual" | "bajar" | "nuevo" };

// La regla: si en todas las series te sobraron 2 o más, subes. Si quedaste sin aire, bajas.
export function sugerir(ejercicio: Ejercicio, previas: Serie[] | undefined): Sugerencia {
  const conPeso = ejercicio.subir > 0;
  if (!previas) {
    return {
      peso: ejercicio.pesoInicial,
      meta: ejercicio.meta,
      tono: "nuevo",
      texto: "Primera vez: empieza ligero y cuida la técnica.",
    };
  }

  const peso = previas[0].peso;
  const meta = Math.max(ejercicio.meta, ...previas.map((s) => s.cantidad));
  const completas = previas.length >= ejercicio.series && previas.every((s) => s.cantidad >= ejercicio.meta);
  const holgado = previas.every((s) => s.sobraban >= 2);
  const alLimite = previas.filter((s) => s.sobraban === 0).length >= 2;

  if (completas && holgado) {
    if (!conPeso) {
      const nueva = Math.min(meta + 5, 60);
      return { peso, meta: nueva, tono: "subir", texto: `Te sobró aire: intenta ${nueva} s.` };
    }
    return {
      peso: peso + ejercicio.subir,
      meta: ejercicio.meta,
      tono: "subir",
      texto: `Te sobraban repeticiones: sube a ${peso + ejercicio.subir} kg.`,
    };
  }
  if (!completas && alLimite && conPeso && peso > 0) {
    const menos = Math.max(0, peso - ejercicio.subir);
    return { peso: menos, meta: ejercicio.meta, tono: "bajar", texto: `Quedaste al límite: baja a ${menos} kg.` };
  }
  return {
    peso,
    meta: conPeso ? ejercicio.meta : meta,
    tono: "igual",
    texto: conPeso
      ? "Repite el peso. Cuando te sobren 2 en todas las series, subes."
      : "Repite la meta. Cuando te sobre aire en todas las series, subes.",
  };
}

// Minutos del cardio largo: empieza en 30 y suma 5 cada 2 sesiones completas, hasta 45.
export function minutosCardio(sesiones: Sesion[]) {
  const hechas = terminadas(sesiones).filter((s) => s.tipo === "cardio" && s.cardio).length;
  return Math.min(CARDIO_MAXIMO, CARDIO_INICIAL + 5 * Math.floor(hechas / 2));
}

export const diasDesde = (fecha: string) => Math.floor((Date.now() - new Date(fecha).getTime()) / 86_400_000);
