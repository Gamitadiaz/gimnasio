import { type CSSProperties, useEffect, useRef, useState } from "react";

import { pitido, reloj } from "../lib/aviso";
import { useTic } from "./basicos";
import { Anillo } from "./iconos";

// Temporizador por pasos: lo usan los intervalos y los estiramientos.
// Pita al cambiar de paso y hace cuenta regresiva en los últimos 3 segundos.

export type Paso = { titulo: string; detalle?: string; segundos: number; color?: string; etiqueta?: string };

type Estado =
  | { modo: "listo" }
  | { modo: "corriendo"; indice: number; fin: number }
  | { modo: "pausa"; indice: number; restante: number }
  | { modo: "terminado" };

export function Guia({
  pasos,
  textoEmpezar,
  onTerminar,
}: {
  pasos: Paso[];
  textoEmpezar: string;
  onTerminar: () => void;
}) {
  const [estado, setEstado] = useState<Estado>({ modo: "listo" });
  const ultimoPitido = useRef(-1);
  useTic(estado.modo === "corriendo");

  const total = pasos.reduce((suma, paso) => suma + paso.segundos, 0);

  // En cada tic: pita en los últimos 3 segundos y avanza los pasos que ya pasaron
  // (aunque la pantalla haya estado apagada un rato).
  useEffect(() => {
    if (estado.modo !== "corriendo") return;
    const ahora = Date.now();
    if (ahora < estado.fin) {
      const segundo = Math.ceil((estado.fin - ahora) / 1000);
      const marca = estado.indice * 1000 + segundo;
      if (segundo <= 3 && ultimoPitido.current !== marca) {
        ultimoPitido.current = marca;
        pitido(1);
      }
      return;
    }
    let { indice, fin } = estado;
    while (indice < pasos.length && ahora >= fin) {
      indice++;
      if (indice < pasos.length) fin += pasos[indice].segundos * 1000;
    }
    if (indice >= pasos.length) {
      setEstado({ modo: "terminado" });
      pitido(3, true);
      onTerminar();
    } else {
      setEstado({ modo: "corriendo", indice, fin });
      pitido(2, true);
    }
  });

  const vista = estado;
  if (vista.modo === "listo") {
    return (
      <div className="guia">
        <p className="guia-total">
          {pasos.length} pasos · {Math.round(total / 60)} min
        </p>
        <button
          className="boton grande"
          onClick={() => setEstado({ modo: "corriendo", indice: 0, fin: Date.now() + pasos[0].segundos * 1000 })}
          type="button"
        >
          {textoEmpezar}
        </button>
      </div>
    );
  }

  if (vista.modo === "terminado") {
    return (
      <div className="guia">
        <p className="guia-fin">¡Listo!</p>
        <button className="boton secundario" onClick={() => setEstado({ modo: "listo" })} type="button">
          Repetir
        </button>
      </div>
    );
  }

  const paso = pasos[vista.indice];
  const restante = vista.modo === "corriendo" ? (vista.fin - Date.now()) / 1000 : vista.restante;
  const segundo = Math.ceil(restante);
  const siguiente = pasos[vista.indice + 1];

  const irA = (indice: number) => {
    if (indice >= pasos.length) {
      setEstado({ modo: "terminado" });
      onTerminar();
      return;
    }
    const nuevo = Math.max(0, indice);
    setEstado({ modo: "corriendo", indice: nuevo, fin: Date.now() + pasos[nuevo].segundos * 1000 });
  };

  return (
    <div className="guia" style={{ "--color-paso": paso.color ?? "var(--acento-texto)" } as CSSProperties}>
      <div className="guia-paso">
        {paso.etiqueta ? <span className="guia-etiqueta">{paso.etiqueta}</span> : null}
        <h3>{paso.titulo}</h3>
        <Anillo fraccion={1 - restante / paso.segundos} grosor={10} tamano={232}>
          <p className="guia-reloj" data-final={segundo <= 3 || undefined}>
            {reloj(restante)}
          </p>
          <p className="guia-de">
            paso {vista.indice + 1} de {pasos.length}
          </p>
        </Anillo>
        {paso.detalle ? <p className="guia-detalle">{paso.detalle}</p> : null}
      </div>
      <p className="guia-siguiente">{siguiente ? `Después: ${siguiente.titulo}` : "Es el último paso"}</p>
      <div className="guia-controles">
        <button className="boton secundario" onClick={() => irA(vista.indice - 1)} type="button">
          Atrás
        </button>
        {vista.modo === "corriendo" ? (
          <button
            className="boton"
            onClick={() => setEstado({ modo: "pausa", indice: vista.indice, restante })}
            type="button"
          >
            Pausa
          </button>
        ) : (
          <button
            className="boton"
            onClick={() =>
              setEstado({ modo: "corriendo", indice: vista.indice, fin: Date.now() + vista.restante * 1000 })
            }
            type="button"
          >
            Seguir
          </button>
        )}
        <button className="boton secundario" onClick={() => irA(vista.indice + 1)} type="button">
          Saltar
        </button>
      </div>
    </div>
  );
}
