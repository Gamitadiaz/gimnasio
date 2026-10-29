import { type CSSProperties, useState } from "react";

import { fechaLarga } from "../lib/aviso";
import { type Datos, guardar, type Sesion } from "../lib/datos";
import { EJERCICIOS, SESIONES } from "../lib/plan";

// Todas tus sesiones, de la más nueva a la más vieja.

const NOMBRES = new Map(Object.values(EJERCICIOS).flat().map((e) => [e.id, e]));

function resumen(sesion: Sesion) {
  const partes: string[] = [];
  const series = Object.values(sesion.series).reduce((suma, s) => suma + s.length, 0);
  if (series) partes.push(`${series} series`);
  const cardio = (sesion.cardio?.minutos ?? 0) + (sesion.cardioFinal?.minutos ?? 0);
  if (cardio) partes.push(`${cardio} min de cardio`);
  if (sesion.estiramiento) partes.push("estiramientos");
  return partes.join(" · ") || "Sin registros";
}

export function Historial({ datos }: { datos: Datos }) {
  const sesiones = datos.sesiones.filter((s) => s.fin).toReversed();
  const [abierta, setAbierta] = useState<string>();

  if (sesiones.length === 0) {
    return (
      <div className="vacio">
        <h1>Historial</h1>
        <p>Aquí aparecerá cada sesión que termines, con tus pesos, repeticiones y minutos de cardio.</p>
      </div>
    );
  }

  return (
    <div className="historial">
      <h1>Historial</h1>
      <ul>
        {sesiones.map((sesion) => {
          const info = SESIONES[sesion.tipo];
          const duracion = sesion.fin
            ? Math.round((new Date(sesion.fin).getTime() - new Date(sesion.inicio).getTime()) / 60_000)
            : 0;
          return (
            <li key={sesion.id} style={{ "--color-sesion": info.color } as CSSProperties}>
              <button className="historial-fila" onClick={() => setAbierta(abierta === sesion.id ? undefined : sesion.id)} type="button">
                <span className="historial-tipo">{info.nombre}</span>
                <span className="historial-fecha">
                  {fechaLarga(sesion.inicio)} · {duracion} min
                </span>
                <span className="historial-resumen">{resumen(sesion)}</span>
              </button>
              {abierta === sesion.id ? (
                <div className="historial-detalle">
                  {Object.entries(sesion.series).map(([id, series]) =>
                    series.length ? (
                      <p key={id}>
                        <b>{NOMBRES.get(id)?.nombre ?? id}:</b>{" "}
                        {series
                          .map((s) => `${s.peso ? `${s.peso} kg × ` : ""}${s.cantidad}`)
                          .join(", ")}
                      </p>
                    ) : null,
                  )}
                  {[sesion.cardio, sesion.cardioFinal].map((c, i) =>
                    c ? (
                      <p key={i === 0 ? "cardio" : "final"}>
                        <b>{i === 0 ? "Cardio" : "Cardio suave"}:</b> {c.maquina}, {c.minutos} min
                        {c.velocidad ? `, ${c.velocidad} km/h` : ""}
                        {c.inclinacion ? `, ${c.inclinacion}${c.maquina === "Caminadora" ? " %" : " de resistencia"}` : ""}
                        {c.distancia ? `, ${c.distancia} km` : ""}
                      </p>
                    ) : null,
                  )}
                  {sesion.nota ? <p className="historial-nota">“{sesion.nota}”</p> : null}
                  <button
                    className="enlace peligro"
                    onClick={() => {
                      if (confirm("¿Borrar esta sesión del historial?")) {
                        guardar((d) => ({ ...d, sesiones: d.sesiones.filter((s) => s.id !== sesion.id) }));
                      }
                    }}
                    type="button"
                  >
                    Borrar sesión
                  </button>
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
