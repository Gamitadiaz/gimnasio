import { useSyncExternalStore } from "react";

import type { TipoSesion } from "./plan";

// Todo se guarda en el propio celular (localStorage). Nada sale a internet.

export type Sobraban = 0 | 1 | 2 | 3;

export type Serie = { peso: number; cantidad: number; sobraban: Sobraban };

export type Cardio = {
  maquina: string;
  minutos: number;
  velocidad?: number;
  inclinacion?: number;
  distancia?: number;
};

export type Sesion = {
  id: string;
  tipo: TipoSesion;
  inicio: string;
  fin?: string;
  calentamiento: boolean;
  series: Record<string, Serie[]>;
  cardio?: Cardio;
  cardioFinal?: Cardio;
  estiramiento: boolean;
  nota?: string;
};

export type Prueba = {
  id: string;
  fecha: string;
  tipo: "resistencia" | "flexibilidad";
  valor: number;
  maquina?: string;
};

export type Datos = {
  version: 1;
  sesiones: Sesion[];
  actual?: Sesion;
  pruebas: Prueba[];
  ultimoRespaldo?: string;
  avisoVisto?: boolean;
};

const CLAVE = "gimnasio:datos";
const VACIO: Datos = { version: 1, sesiones: [], pruebas: [] };

function leer(): Datos {
  try {
    const crudo = localStorage.getItem(CLAVE);
    return crudo ? { ...VACIO, ...(JSON.parse(crudo) as Datos) } : VACIO;
  } catch {
    return VACIO;
  }
}

let datos = leer();
const oyentes = new Set<() => void>();

export function guardar(cambio: (previo: Datos) => Datos) {
  datos = cambio(datos);
  try {
    localStorage.setItem(CLAVE, JSON.stringify(datos));
  } catch {
    alert("No se pudo guardar en el celular. Revisa que no esté lleno el almacenamiento.");
  }
  for (const oyente of oyentes) oyente();
}

export function useDatos() {
  return useSyncExternalStore(
    (oyente) => {
      oyentes.add(oyente);
      return () => oyentes.delete(oyente);
    },
    () => datos,
  );
}

export const nuevoId = () => crypto.randomUUID();

// Respaldo: el archivo es el mismo objeto Datos en JSON.
export function aRespaldo(d: Datos) {
  const { actual: _actual, ...resto } = d;
  return JSON.stringify(resto, null, 1);
}

export function desdeRespaldo(texto: string): Datos {
  const leido = JSON.parse(texto) as Partial<Datos>;
  if (leido.version !== 1 || !Array.isArray(leido.sesiones) || !Array.isArray(leido.pruebas)) {
    throw new Error("Este archivo no es un respaldo de la app Gimnasio.");
  }
  return { ...VACIO, ...leido } as Datos;
}

// Le pide al navegador que no borre los datos aunque falte espacio.
export async function pedirPersistencia() {
  try {
    if (!navigator.storage?.persist) return false;
    return (await navigator.storage.persisted()) || (await navigator.storage.persist());
  } catch {
    return false;
  }
}
