import { type CSSProperties, useEffect, useRef, useState } from "react";

import { Bloque, useTic } from "../componentes/basicos";
import { FormCardio } from "../componentes/FormCardio";
import { Guia, type Paso } from "../componentes/Guia";
import { TarjetaEjercicio } from "../componentes/TarjetaEjercicio";
import { pitido, reloj, usePantallaEncendida } from "../lib/aviso";
import { type Datos, guardar, type Sesion as TSesion, type Serie } from "../lib/datos";
import { CARDIO_FINAL_MIN, EJERCICIOS, ESTIRAMIENTOS, INTERVALOS, SESIONES } from "../lib/plan";
import { minutosCardio, sugerir, ultimaVez } from "../lib/progresion";

// La pantalla mientras entrenas: calentamiento, lo principal, cardio final y estiramientos.

function pasosIntervalos(): Paso[] {
  const pasos: Paso[] = [
    { titulo: "Calienta suave", segundos: INTERVALOS.calentar, color: "var(--gris)", detalle: "Ritmo cómodo, sube poco a poco." },
  ];
  for (let ronda = 1; ronda <= INTERVALOS.rondas; ronda++) {
    const etiqueta = `Ronda ${ronda} de ${INTERVALOS.rondas}`;
    pasos.push(
      { titulo: "¡Fuerte!", etiqueta, segundos: INTERVALOS.fuerte, color: "var(--acento)", detalle: "Casi al máximo, sin perder la forma." },
      { titulo: "Suave", etiqueta, segundos: INTERVALOS.suave, color: "var(--tinta)", detalle: "Recupera el aire, sin detenerte." },
    );
  }
  pasos.push({ titulo: "Enfría", segundos: INTERVALOS.enfriar, color: "var(--gris)", detalle: "Muy suave, deja que baje el pulso." });
  return pasos;
}

function pasosEstiramientos(base: number): Paso[] {
  return ESTIRAMIENTOS.flatMap((e) =>
    e.porLado
      ? [
          { titulo: e.nombre, etiqueta: "Lado izquierdo", segundos: base, detalle: e.consejo },
          { titulo: e.nombre, etiqueta: "Lado derecho", segundos: base, detalle: e.consejo },
        ]
      : [{ titulo: e.nombre, segundos: e.segundos ?? base, detalle: e.consejo }],
  );
}

const minutosIntervalos = Math.round(
  (INTERVALOS.calentar + INTERVALOS.rondas * (INTERVALOS.fuerte + INTERVALOS.suave) + INTERVALOS.enfriar) / 60,
);

export function Sesion({ datos, onSalir }: { datos: Datos; onSalir: () => void }) {
  const sesion = datos.actual as TSesion;
  const info = SESIONES[sesion.tipo];
  const esFuerza = sesion.tipo === "fuerza-a" || sesion.tipo === "fuerza-b";
  const ejercicios = esFuerza ? EJERCICIOS[sesion.tipo as "fuerza-a" | "fuerza-b"] : [];

  usePantallaEncendida();
  useTic(true);

  const cambiar = (cambio: Partial<TSesion>) =>
    guardar((d) => (d.actual ? { ...d, actual: { ...d.actual, ...cambio } } : d));

  // Ejercicio abierto: el primero que no está completo.
  const primeroPendiente = ejercicios.find((e) => (sesion.series[e.id]?.length ?? 0) < e.series)?.id;
  const [abierto, setAbierto] = useState<string | undefined>(primeroPendiente);

  // Descanso entre series.
  const [descanso, setDescanso] = useState<{ fin: number; total: number } | null>(null);
  const restante = descanso ? (descanso.fin - Date.now()) / 1000 : 0;
  const avisado = useRef(false);
  useEffect(() => {
    if (descanso && restante <= 0 && !avisado.current) {
      avisado.current = true;
      pitido(3, true);
      setDescanso(null);
    }
  });

  const agregarSerie = (id: string, serie: Serie, segundosDescanso: number, totalSeries: number) => {
    const series = [...(sesion.series[id] ?? []), serie];
    cambiar({ series: { ...sesion.series, [id]: series } });
    avisado.current = false;
    setDescanso({ fin: Date.now() + segundosDescanso * 1000, total: segundosDescanso });
    // Al completar un ejercicio, abre el siguiente.
    if (series.length === totalSeries) {
      const siguiente = ejercicios.find((e) => e.id !== id && (sesion.series[e.id]?.length ?? 0) < e.series);
      setAbierto(siguiente?.id);
    }
  };

  const borrarSerie = (id: string, indice: number) => {
    const series = (sesion.series[id] ?? []).filter((_, i) => i !== indice);
    cambiar({ series: { ...sesion.series, [id]: series } });
  };

  const totalSeries = Object.values(sesion.series).reduce((suma, s) => suma + s.length, 0);
  const algoHecho = totalSeries > 0 || sesion.cardio || sesion.cardioFinal || sesion.estiramiento;

  const terminar = () => {
    if (!algoHecho && !confirm("No anotaste nada. ¿Terminar de todos modos?")) return;
    guardar((d) => {
      if (!d.actual) return d;
      return { ...d, sesiones: [...d.sesiones, { ...d.actual, fin: new Date().toISOString() }], actual: undefined };
    });
    onSalir();
  };

  const descartar = () => {
    if (!confirm("¿Descartar esta sesión? Se borra lo que anotaste hoy.")) return;
    guardar((d) => ({ ...d, actual: undefined }));
    onSalir();
  };

  const minutos = Math.floor((Date.now() - new Date(sesion.inicio).getTime()) / 60_000);
  const metaCardio = minutosCardio(datos.sesiones);

  return (
    <div className="sesion" style={{ "--color-sesion": info.color } as CSSProperties}>
      <header className="sesion-cabeza">
        <button className="enlace" onClick={onSalir} type="button">
          ‹ Inicio
        </button>
        <span className="sesion-tiempo">{minutos} min</span>
      </header>
      <h1 className="sesion-nombre">{info.nombre}</h1>

      {sesion.tipo !== "intervalos" ? (
        <Bloque hecho={sesion.calentamiento} titulo="Calentamiento">
          <p>
            {sesion.tipo === "estirar"
              ? "3 a 5 minutos caminando o moviendo brazos, cadera y tobillos. Estirar en frío cuesta más."
              : esFuerza
                ? "5 minutos de cardio suave y una serie ligera del primer ejercicio."
                : "Los primeros 5 minutos van suaves; luego sube al ritmo de la sesión."}
          </p>
          {!sesion.calentamiento ? (
            <button className="boton secundario" onClick={() => cambiar({ calentamiento: true })} type="button">
              Ya calenté
            </button>
          ) : null}
        </Bloque>
      ) : null}

      {esFuerza ? (
        <div className="ejercicios">
          {ejercicios.map((ejercicio) => (
            <TarjetaEjercicio
              abierta={abierto === ejercicio.id}
              ejercicio={ejercicio}
              key={ejercicio.id}
              onAbrir={() => setAbierto(abierto === ejercicio.id ? undefined : ejercicio.id)}
              onAgregar={(serie) => agregarSerie(ejercicio.id, serie, ejercicio.descanso, ejercicio.series)}
              onBorrar={(i) => borrarSerie(ejercicio.id, i)}
              series={sesion.series[ejercicio.id] ?? []}
              sugerencia={sugerir(ejercicio, ultimaVez(datos.sesiones, ejercicio.id))}
            />
          ))}
        </div>
      ) : null}

      {sesion.tipo === "cardio" ? (
        <Bloque hecho={!!sesion.cardio} titulo={`Cardio constante · ${metaCardio} min`}>
          <p>
            Caminadora con 8–12 % de inclinación a 4.5–5.5 km/h, o bici con resistencia media. El ritmo correcto: puedes
            hablar en frases cortas, pero no cantar.
          </p>
          {!sesion.cardio ? (
            <>
              <Guia
                onTerminar={() => undefined}
                pasos={[{ titulo: "Ritmo constante", segundos: metaCardio * 60, color: "var(--acento)", detalle: "Respira por la nariz si puedes." }]}
                textoEmpezar={`Iniciar ${metaCardio} min`}
              />
              <h3 className="subtitulo">Al terminar, anota cómo te fue</h3>
              <FormCardio minutos={metaCardio} onGuardar={(cardio) => cambiar({ cardio })} textoGuardar="Guardar cardio" />
            </>
          ) : (
            <ResumenCardio cardio={sesion.cardio} onEditar={() => cambiar({ cardio: undefined })} />
          )}
        </Bloque>
      ) : null}

      {sesion.tipo === "intervalos" ? (
        <Bloque hecho={!!sesion.cardio} titulo={`Intervalos · ${minutosIntervalos} min`}>
          <p>Bici o elíptica. La app te avisa con pitidos cuándo cambiar de ritmo.</p>
          {!sesion.cardio ? (
            <>
              <Guia onTerminar={() => undefined} pasos={pasosIntervalos()} textoEmpezar="Iniciar intervalos" />
              <h3 className="subtitulo">Al terminar, anota la máquina</h3>
              <FormCardio
                inicial={{ maquina: "Bicicleta", minutos: minutosIntervalos }}
                minutos={minutosIntervalos}
                onGuardar={(cardio) => cambiar({ cardio })}
                textoGuardar="Guardar intervalos"
              />
            </>
          ) : (
            <ResumenCardio cardio={sesion.cardio} onEditar={() => cambiar({ cardio: undefined })} />
          )}
        </Bloque>
      ) : null}

      {esFuerza ? (
        <Bloque hecho={!!sesion.cardioFinal} titulo={`Cardio suave · ${CARDIO_FINAL_MIN} min`}>
          <p>En cualquier máquina, a ritmo cómodo. Suma resistencia sin cansarte de más.</p>
          {!sesion.cardioFinal ? (
            <FormCardio
              minutos={CARDIO_FINAL_MIN}
              onGuardar={(cardioFinal) => cambiar({ cardioFinal })}
              textoGuardar="Guardar cardio suave"
            />
          ) : (
            <ResumenCardio cardio={sesion.cardioFinal} onEditar={() => cambiar({ cardioFinal: undefined })} />
          )}
        </Bloque>
      ) : null}

      <Bloque hecho={sesion.estiramiento} titulo={sesion.tipo === "estirar" ? "Rutina de flexibilidad" : "Estiramientos"}>
        <p>
          {sesion.tipo === "estirar"
            ? "Cada postura dura 45 segundos. Estira hasta sentir tensión, nunca dolor, y respira lento."
            : "Con el cuerpo caliente es cuando más avanzas. Tensión sí, dolor no."}
        </p>
        <Guia
          onTerminar={() => cambiar({ estiramiento: true })}
          pasos={pasosEstiramientos(sesion.tipo === "estirar" ? 45 : 30)}
          textoEmpezar="Empezar estiramientos"
        />
        {!sesion.estiramiento ? (
          <button className="enlace" onClick={() => cambiar({ estiramiento: true })} type="button">
            Ya estiré por mi cuenta
          </button>
        ) : null}
      </Bloque>

      <label className="nota">
        <span>Nota de hoy (opcional)</span>
        <textarea
          onChange={(e) => cambiar({ nota: e.target.value })}
          placeholder="Cómo te sentiste, molestias, la máquina estaba ocupada…"
          rows={2}
          value={sesion.nota ?? ""}
        />
      </label>

      <div className="sesion-final">
        <button className="boton grande" onClick={terminar} type="button">
          Terminar sesión
        </button>
        <button className="enlace peligro" onClick={descartar} type="button">
          Descartar sesión
        </button>
      </div>

      {descanso && restante > 0 ? (
        <div className="descanso" role="timer">
          <div className="descanso-barra" style={{ width: `${(restante / descanso.total) * 100}%` }} />
          <span className="descanso-texto">Descanso</span>
          <span className="descanso-reloj">{reloj(restante)}</span>
          <button onClick={() => setDescanso({ ...descanso, fin: descanso.fin + 15_000, total: descanso.total + 15 })} type="button">
            +15 s
          </button>
          <button onClick={() => setDescanso(null)} type="button">
            Saltar
          </button>
        </div>
      ) : null}
    </div>
  );
}

function ResumenCardio({ cardio, onEditar }: { cardio: NonNullable<TSesion["cardio"]>; onEditar: () => void }) {
  const partes = [
    cardio.maquina,
    `${cardio.minutos} min`,
    cardio.velocidad ? `${cardio.velocidad} km/h` : null,
    cardio.inclinacion ? `${cardio.inclinacion}${cardio.maquina === "Caminadora" ? " %" : " de resistencia"}` : null,
    cardio.distancia ? `${cardio.distancia} km` : null,
  ].filter(Boolean);
  return (
    <div className="resumen-cardio">
      <p>{partes.join(" · ")}</p>
      <button className="enlace" onClick={onEditar} type="button">
        Corregir
      </button>
    </div>
  );
}
