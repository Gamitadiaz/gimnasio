import type { CSSProperties } from "react";

import { activarSonido, fechaLarga } from "../lib/aviso";
import { type Datos, guardar, nuevoId } from "../lib/datos";
import { SESIONES, type TipoSesion } from "../lib/plan";
import { diasDesde, minutosCardio, siguienteSesion } from "../lib/progresion";

// Lo primero que ves: qué toca hoy y un botón grande para empezar.

const ORDEN: TipoSesion[] = ["cardio", "fuerza-a", "intervalos", "fuerza-b", "estirar"];

export function Inicio({ datos, onEntrenar, onIr }: { datos: Datos; onEntrenar: () => void; onIr: (pantalla: "progreso" | "respaldo") => void }) {
  const toca = siguienteSesion(datos.sesiones);
  const info = SESIONES[toca];
  const terminadas = datos.sesiones.filter((s) => s.fin);

  const empezar = (tipo: TipoSesion) => {
    activarSonido();
    guardar((d) => ({
      ...d,
      actual: {
        id: nuevoId(),
        tipo,
        inicio: new Date().toISOString(),
        calentamiento: false,
        series: {},
        estiramiento: false,
      },
    }));
    onEntrenar();
  };

  // Lo de esta semana (desde el lunes).
  const lunes = new Date();
  lunes.setHours(0, 0, 0, 0);
  lunes.setDate(lunes.getDate() - ((lunes.getDay() + 6) % 7));
  const semana = terminadas.filter((s) => new Date(s.inicio) >= lunes);
  const minutosSemana = semana.reduce((suma, s) => suma + (s.cardio?.minutos ?? 0) + (s.cardioFinal?.minutos ?? 0), 0);

  const ultimaPrueba = datos.pruebas.at(-1);
  const tocaPrueba = terminadas.length > 0 && (!ultimaPrueba || diasDesde(ultimaPrueba.fecha) >= 28);
  const tocaRespaldo =
    terminadas.length >= 3 && (!datos.ultimoRespaldo || diasDesde(datos.ultimoRespaldo) >= 14);
  const instalada = matchMedia("(display-mode: standalone)").matches || ("standalone" in navigator && navigator.standalone);

  return (
    <div className="inicio">
      <p className="fecha">{fechaLarga(new Date().toISOString())}</p>

      {datos.actual ? (
        <section className="hoy" style={{ "--color-sesion": SESIONES[datos.actual.tipo].color } as CSSProperties}>
          <p className="hoy-etiqueta">Sesión en curso</p>
          <h1 className="hoy-nombre">{SESIONES[datos.actual.tipo].nombre}</h1>
          <button
            className="boton grande"
            onClick={() => {
              activarSonido();
              onEntrenar();
            }}
            type="button"
          >
            Continuar
          </button>
        </section>
      ) : (
        <section className="hoy" style={{ "--color-sesion": info.color } as CSSProperties}>
          <p className="hoy-etiqueta">{terminadas.length === 0 ? "Tu primer día" : "Hoy toca"}</p>
          <h1 className="hoy-nombre">{info.nombre}</h1>
          <p className="hoy-resumen">
            {toca === "cardio" ? `${minutosCardio(datos.sesiones)} min. ` : ""}
            {info.resumen}
          </p>
          <button className="boton grande" onClick={() => empezar(toca)} type="button">
            Empezar
          </button>
          <div className="otras">
            <span>¿Otra cosa hoy?</span>
            {ORDEN.filter((t) => t !== toca).map((tipo) => (
              <button key={tipo} onClick={() => empezar(tipo)} style={{ "--color-sesion": SESIONES[tipo].color } as CSSProperties} type="button">
                {SESIONES[tipo].corto}
              </button>
            ))}
          </div>
        </section>
      )}

      {!datos.avisoVisto ? (
        <section className="aviso">
          <h2>Escucha a tu cuerpo</h2>
          <p>
            Si sientes dolor en el pecho, mareo o una falta de aire que no se calma al bajar el ritmo, detente y busca
            atención. El cansancio y el ardor en los músculos son normales.
          </p>
          <button className="boton secundario" onClick={() => guardar((d) => ({ ...d, avisoVisto: true }))} type="button">
            Entendido
          </button>
        </section>
      ) : null}

      {terminadas.length > 0 ? (
        <section className="semana">
          <div>
            <strong>{semana.length}</strong>
            <span>sesiones esta semana</span>
          </div>
          <div>
            <strong>{minutosSemana}</strong>
            <span>min de cardio esta semana</span>
          </div>
          <div>
            <strong>{terminadas.length}</strong>
            <span>sesiones en total</span>
          </div>
        </section>
      ) : null}

      {tocaPrueba ? (
        <button className="recordatorio" onClick={() => onIr("progreso")} type="button">
          <strong>{ultimaPrueba ? "Toca tu prueba mensual" : "Haz tus pruebas iniciales"}</strong>
          <span>Dos medidas rápidas para ver cuánto avanzas en resistencia y flexibilidad.</span>
        </button>
      ) : null}

      {tocaRespaldo ? (
        <button className="recordatorio" onClick={() => onIr("respaldo")} type="button">
          <strong>Guarda un respaldo</strong>
          <span>
            {datos.ultimoRespaldo
              ? `Tu último respaldo fue hace ${diasDesde(datos.ultimoRespaldo)} días.`
              : "Todavía no tienes respaldo. Si se borra el navegador, pierdes tu historial."}
          </span>
        </button>
      ) : null}

      {!instalada ? (
        <section className="instalar">
          <h2>Instálala en tu celular</h2>
          <p>
            Así abre sin internet y el teléfono no borra tus datos. En Android (Chrome): menú de tres puntos → <b>Instalar app</b>. En iPhone
            (Safari): botón Compartir → <b>Agregar a inicio</b>.
          </p>
        </section>
      ) : null}
    </div>
  );
}
