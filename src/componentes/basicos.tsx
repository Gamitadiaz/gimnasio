import { type ReactNode, useEffect, useState } from "react";

// Piezas pequeñas que se repiten en varias pantallas.

// Vuelve a dibujar el componente cada cuarto de segundo mientras "activo" sea true.
export function useTic(activo: boolean) {
  const [, setTic] = useState(0);
  useEffect(() => {
    if (!activo) return;
    const id = setInterval(() => setTic((t) => t + 1), 250);
    return () => clearInterval(id);
  }, [activo]);
}

export function Contador({
  etiqueta,
  valor,
  paso,
  minimo = 0,
  unidad,
  onCambio,
}: {
  etiqueta: string;
  valor: number;
  paso: number;
  minimo?: number;
  unidad?: string;
  onCambio: (valor: number) => void;
}) {
  const cambiar = (delta: number) => onCambio(Math.max(minimo, Math.round((valor + delta) * 10) / 10));
  // El texto se guarda aparte para poder escribir "7." antes de "7.5".
  const [texto, setTexto] = useState(String(valor));
  useEffect(() => {
    setTexto((previo) => (Number(previo.replace(",", ".")) === valor ? previo : String(valor)));
  }, [valor]);
  return (
    <div className="contador">
      <span className="contador-etiqueta">{etiqueta}</span>
      <div className="contador-fila">
        <button aria-label={`Menos ${etiqueta}`} onClick={() => cambiar(-paso)} type="button">
          −
        </button>
        <label className="contador-valor">
          <input
            aria-label={etiqueta}
            inputMode="decimal"
            onChange={(e) => {
              setTexto(e.target.value);
              const numero = Number(e.target.value.replace(",", "."));
              if (e.target.value !== "" && !Number.isNaN(numero)) onCambio(Math.max(minimo, numero));
            }}
            onFocus={(e) => e.target.select()}
            style={{ width: `${texto.length + 0.6}ch` }}
            value={texto}
          />
          {unidad ? <small>{unidad}</small> : null}
        </label>
        <button aria-label={`Más ${etiqueta}`} onClick={() => cambiar(paso)} type="button">
          +
        </button>
      </div>
    </div>
  );
}

export function Opciones<T extends string>({
  opciones,
  valor,
  onCambio,
}: {
  opciones: readonly T[];
  valor: T | undefined;
  onCambio: (valor: T) => void;
}) {
  return (
    <div className="opciones">
      {opciones.map((opcion) => (
        <button aria-pressed={valor === opcion} key={opcion} onClick={() => onCambio(opcion)} type="button">
          {opcion}
        </button>
      ))}
    </div>
  );
}

export function Bloque({
  titulo,
  hecho,
  children,
  extra,
}: {
  titulo: string;
  hecho?: boolean;
  children: ReactNode;
  extra?: ReactNode;
}) {
  return (
    <section className="bloque" data-hecho={hecho || undefined}>
      <header className="bloque-titulo">
        <h2>{titulo}</h2>
        {hecho ? <span className="palomita">Hecho</span> : extra}
      </header>
      {children}
    </section>
  );
}
