import { useState } from "react";

import { Contador, Opciones } from "../componentes/basicos";
import { fechaCorta } from "../lib/aviso";
import { type Datos, guardar, nuevoId, type Prueba } from "../lib/datos";
import { EJERCICIOS } from "../lib/plan";
import { diasDesde } from "../lib/progresion";

// Tus números: pruebas cada 4 semanas y cómo han cambiado tus pesos.

const PRUEBAS = {
  resistencia: {
    nombre: "Resistencia",
    unidad: "km",
    como: "Calienta 5 min. Luego avanza lo más que puedas en 12 minutos a un ritmo que aguantes todo el tiempo. Usa siempre la misma máquina, sin inclinación.",
  },
  flexibilidad: {
    nombre: "Flexibilidad",
    unidad: "cm",
    como: "Ya caliente, siéntate con las piernas estiradas y juntas. Estira los brazos hacia los pies sin rebotar. Si no llegas a las puntas, anota los cm que faltan en negativo; si las pasas, en positivo.",
  },
} as const;

type TipoPrueba = keyof typeof PRUEBAS;

function TarjetaPrueba({ tipo, pruebas }: { tipo: TipoPrueba; pruebas: Prueba[] }) {
  const info = PRUEBAS[tipo];
  const propias = pruebas.filter((p) => p.tipo === tipo);
  const primera = propias[0];
  const ultima = propias.at(-1);
  const [valor, setValor] = useState(ultima?.valor ?? (tipo === "resistencia" ? 1.2 : -10));
  const [maquina, setMaquina] = useState<"Caminadora" | "Bicicleta">(
    (ultima?.maquina as "Caminadora" | "Bicicleta" | undefined) ?? "Caminadora",
  );
  const [capturando, setCapturando] = useState(false);
  const cambio = primera && ultima && propias.length > 1 ? Math.round((ultima.valor - primera.valor) * 10) / 10 : null;

  return (
    <section className="prueba">
      <header>
        <h2>{info.nombre}</h2>
        {ultima ? <span className="prueba-fecha">hace {diasDesde(ultima.fecha)} días</span> : null}
      </header>
      {ultima ? (
        <p className="prueba-valor">
          <strong>
            {ultima.valor > 0 && tipo === "flexibilidad" ? "+" : ""}
            {ultima.valor}
          </strong>{" "}
          {info.unidad}
          {cambio !== null ? (
            <span className="prueba-cambio" data-mejor={cambio > 0 || undefined}>
              {cambio > 0 ? "+" : ""}
              {cambio} {info.unidad} desde el inicio
            </span>
          ) : null}
        </p>
      ) : (
        <p className="ayuda">Aún no tienes esta prueba. Hazla hoy para tener tu punto de partida.</p>
      )}

      {propias.length > 1 ? (
        <ol className="prueba-lista">
          {propias.map((p) => (
            <li key={p.id}>
              <span>{fechaCorta(p.fecha)}</span>
              <span>
                {p.valor} {info.unidad}
                {p.maquina ? ` · ${p.maquina}` : ""}
              </span>
            </li>
          ))}
        </ol>
      ) : null}

      {capturando ? (
        <div className="prueba-captura">
          <p>{info.como}</p>
          {tipo === "resistencia" ? (
            <Opciones onCambio={setMaquina} opciones={["Caminadora", "Bicicleta"] as const} valor={maquina} />
          ) : null}
          <Contador
            etiqueta={tipo === "resistencia" ? "Distancia en 12 min" : "Centímetros"}
            minimo={tipo === "resistencia" ? 0 : -60}
            onCambio={setValor}
            paso={tipo === "resistencia" ? 0.1 : 1}
            unidad={info.unidad}
            valor={valor}
          />
          <button
            className="boton grande"
            onClick={() => {
              guardar((d) => ({
                ...d,
                pruebas: [
                  ...d.pruebas,
                  {
                    id: nuevoId(),
                    fecha: new Date().toISOString(),
                    tipo,
                    valor,
                    maquina: tipo === "resistencia" ? maquina : undefined,
                  },
                ],
              }));
              setCapturando(false);
            }}
            type="button"
          >
            Guardar prueba
          </button>
        </div>
      ) : (
        <button className="boton secundario" onClick={() => setCapturando(true)} type="button">
          {ultima ? "Anotar prueba nueva" : "Hacer la prueba"}
        </button>
      )}
    </section>
  );
}

export function Progreso({ datos }: { datos: Datos }) {
  const terminadas = datos.sesiones.filter((s) => s.fin);

  // Por ejercicio: el peso de la primera vez y el de la última.
  const fuerza = Object.values(EJERCICIOS)
    .flat()
    .map((ejercicio) => {
      const veces = terminadas.map((s) => s.series[ejercicio.id]).filter((series) => series?.length);
      if (!veces.length) return null;
      const mejor = (series: (typeof veces)[number]) =>
        Math.max(...series.map((s) => (ejercicio.unidadPeso ? s.peso : s.cantidad)));
      return {
        ejercicio,
        primera: mejor(veces[0]),
        ultima: mejor(veces.at(-1) ?? veces[0]),
        veces: veces.length,
        unidad: ejercicio.unidadPeso ? "kg" : ejercicio.medida === "segundos" ? "s" : "m",
      };
    })
    .filter((fila) => fila !== null);

  const cardioLargo = terminadas.filter((s) => s.tipo === "cardio" && s.cardio);

  return (
    <div className="progreso">
      <h1>Progreso</h1>
      <p className="ayuda">Repite las pruebas cada 4 semanas, en el mismo lugar y de la misma forma.</p>
      <TarjetaPrueba pruebas={datos.pruebas} tipo="resistencia" />
      <TarjetaPrueba pruebas={datos.pruebas} tipo="flexibilidad" />

      <section className="prueba">
        <header>
          <h2>Fuerza</h2>
        </header>
        {fuerza.length ? (
          <table className="tabla">
            <thead>
              <tr>
                <th>Ejercicio</th>
                <th>Al inicio</th>
                <th>Ahora</th>
              </tr>
            </thead>
            <tbody>
              {fuerza.map((fila) => (
                <tr key={fila.ejercicio.id}>
                  <td>{fila.ejercicio.nombre}</td>
                  <td>
                    {fila.primera} {fila.unidad}
                  </td>
                  <td data-mejor={fila.ultima > fila.primera || undefined}>
                    {fila.ultima} {fila.unidad}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="ayuda">Cuando termines tu primera sesión de fuerza verás aquí tus pesos.</p>
        )}
      </section>

      {cardioLargo.length ? (
        <section className="prueba">
          <header>
            <h2>Cardio largo</h2>
          </header>
          <ol className="prueba-lista">
            {cardioLargo.slice(-6).map((s) => (
              <li key={s.id}>
                <span>{fechaCorta(s.inicio)}</span>
                <span>
                  {s.cardio?.minutos} min · {s.cardio?.maquina}
                  {s.cardio?.distancia ? ` · ${s.cardio.distancia} km` : ""}
                </span>
              </li>
            ))}
          </ol>
        </section>
      ) : null}
    </div>
  );
}
