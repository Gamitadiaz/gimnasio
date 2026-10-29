import { useState } from "react";

import type { Serie, Sobraban } from "../lib/datos";
import type { Ejercicio } from "../lib/plan";
import type { Sugerencia } from "../lib/progresion";
import { Contador } from "./basicos";

// Un ejercicio de fuerza: muestra la sugerencia, las series hechas y el formulario de la siguiente.

const UNIDAD = { reps: "reps", segundos: "s", metros: "m" } as const;
const SOBRABAN: { valor: Sobraban; texto: string }[] = [
  { valor: 0, texto: "0" },
  { valor: 1, texto: "1" },
  { valor: 2, texto: "2" },
  { valor: 3, texto: "3+" },
];

export function TarjetaEjercicio({
  ejercicio,
  sugerencia,
  series,
  abierta,
  onAbrir,
  onAgregar,
  onBorrar,
}: {
  ejercicio: Ejercicio;
  sugerencia: Sugerencia;
  series: Serie[];
  abierta: boolean;
  onAbrir: () => void;
  onAgregar: (serie: Serie) => void;
  onBorrar: (indice: number) => void;
}) {
  const ultima = series.at(-1);
  const [peso, setPeso] = useState(ultima?.peso ?? sugerencia.peso);
  const [cantidad, setCantidad] = useState(ultima?.cantidad ?? sugerencia.meta);
  const completo = series.length >= ejercicio.series;
  const unidad = UNIDAD[ejercicio.medida];
  const conPeso = ejercicio.unidadPeso !== undefined;

  return (
    <article className="ejercicio" data-abierta={abierta || undefined} data-completo={completo || undefined}>
      <button className="ejercicio-cabeza" onClick={onAbrir} type="button">
        <span className="ejercicio-nombre">{ejercicio.nombre}</span>
        <span className="ejercicio-cuenta">
          {series.length}/{ejercicio.series}
        </span>
      </button>

      {abierta ? (
        <div className="ejercicio-cuerpo">
          <p className="ejercicio-meta">
            {ejercicio.series} series de {sugerencia.meta} {unidad}
            {ejercicio.porLado ? " por lado" : ""}
            {conPeso ? ` · ${sugerencia.peso}\u00a0${ejercicio.unidadPeso}` : ""} · descanso&nbsp;{ejercicio.descanso}&nbsp;s
          </p>
          <p className="sugerencia" data-tono={sugerencia.tono}>
            {sugerencia.texto}
          </p>
          <p className="consejo">{ejercicio.consejo}</p>

          {series.length > 0 ? (
            <ol className="series">
              {series.map((serie, i) => (
                <li key={`${i}-${serie.peso}-${serie.cantidad}`}>
                  <span>
                    {conPeso ? `${serie.peso} kg × ` : ""}
                    {serie.cantidad} {unidad}
                  </span>
                  <span className="series-sobra">sobraban {serie.sobraban === 3 ? "3+" : serie.sobraban}</span>
                  <button aria-label={`Borrar serie ${i + 1}`} onClick={() => onBorrar(i)} type="button">
                    ×
                  </button>
                </li>
              ))}
            </ol>
          ) : null}

          {completo ? (
            <p className="ejercicio-listo">Ejercicio completo. Si quieres, agrega otra serie.</p>
          ) : null}

          <div className="captura">
            {conPeso ? (
              <Contador
                etiqueta={ejercicio.unidadPeso === "kg" ? "Peso" : `Peso (${ejercicio.unidadPeso?.replace("kg ", "")})`}
                onCambio={setPeso}
                paso={ejercicio.subir > 2 ? 2.5 : 1}
                unidad="kg"
                valor={peso}
              />
            ) : null}
            <Contador
              etiqueta={ejercicio.medida === "reps" ? "Repeticiones" : ejercicio.medida === "segundos" ? "Segundos" : "Metros"}
              minimo={1}
              onCambio={setCantidad}
              paso={ejercicio.medida === "reps" ? 1 : 5}
              unidad={unidad}
              valor={cantidad}
            />
          </div>

          <p className="pregunta">Al terminar la serie, ¿cuántas más te salían con buena técnica?</p>
          <div className="sobraban">
            {SOBRABAN.map((opcion) => (
              <button
                key={opcion.valor}
                onClick={() => onAgregar({ peso: conPeso ? peso : 0, cantidad, sobraban: opcion.valor })}
                type="button"
              >
                {opcion.texto}
              </button>
            ))}
          </div>
          <p className="ayuda">Lo ideal es que te sobren 2 o 3. Tocar un número guarda la serie e inicia el descanso.</p>
        </div>
      ) : null}
    </article>
  );
}
