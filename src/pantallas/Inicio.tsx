import { IconoSesion } from "../componentes/iconos";
import { activarSonido, fechaLarga } from "../lib/aviso";
import { type Datos, guardar, nuevoId } from "../lib/datos";
import { EJERCICIOS, ESTIRAMIENTOS, INTERVALOS, SESIONES, type TipoSesion } from "../lib/plan";
import { diasDesde, minutosCardio, siguienteSesion } from "../lib/progresion";

// Lo primero que ves: qué toca hoy y un botón grande para empezar.

// El número grande de la portada: lo que más importa de cada sesión.
const CIFRA: Record<TipoSesion, (minutosCardio: number) => { valor: number; texto: string }> = {
  cardio: (minutos) => ({ valor: minutos, texto: "minutos a ritmo constante" }),
  "fuerza-a": () => ({ valor: EJERCICIOS["fuerza-a"].length, texto: "ejercicios de 3 series" }),
  intervalos: () => ({ valor: INTERVALOS.rondas, texto: "rondas de 30 s a tope" }),
  "fuerza-b": () => ({ valor: EJERCICIOS["fuerza-b"].length, texto: "ejercicios de 3 series" }),
  estirar: () => ({ valor: ESTIRAMIENTOS.length, texto: "posturas de 45 s" }),
};

const ORDEN: TipoSesion[] = ["cardio", "fuerza-a", "intervalos", "fuerza-b", "estirar"];

export function Inicio({ datos, onEntrenar, onIr }: { datos: Datos; onEntrenar: () => void; onIr: (pantalla: "progreso" | "respaldo") => void }) {
  const toca = siguienteSesion(datos.sesiones);
  const info = SESIONES[toca];
  const terminadas = datos.sesiones.filter((s) => s.fin);
  const cifra = CIFRA[toca](minutosCardio(datos.sesiones));

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

  // Tira de la semana: un círculo por día, con el ícono de lo que entrenaste.
  const dias = Array.from({ length: 7 }, (_, i) => {
    const dia = new Date(lunes);
    dia.setDate(lunes.getDate() + i);
    const hecha = semana.find((s) => new Date(s.inicio).toDateString() === dia.toDateString());
    return { letra: "LMMJVSD"[i], dia, hecha, hoy: dia.toDateString() === new Date().toDateString() };
  });

  const actual = datos.actual;

  return (
    <div className="inicio">
      <header className="inicio-cabeza">
        <p className="fecha">{fechaLarga(new Date().toISOString())}</p>
        <ol aria-label="Esta semana" className="dias">
          {dias.map((d) => (
            <li data-hecha={d.hecha ? true : undefined} data-hoy={d.hoy || undefined} key={d.dia.toDateString()}>
              <span className="dias-letra">{d.letra}</span>
              <span className="dias-punto">
                {d.hecha ? <IconoSesion tamano={15} tipo={d.hecha.tipo} /> : d.dia.getDate()}
              </span>
            </li>
          ))}
        </ol>
      </header>

      {actual ? (
        <section className="hoy">
          <div className="hoy-arriba">
            <span className="hoy-icono">
              <IconoSesion tamano={20} tipo={actual.tipo} />
            </span>
            <p className="hoy-etiqueta">Sesión en curso</p>
          </div>
          <h1 className="hoy-nombre">{SESIONES[actual.tipo].nombre}</h1>
          <p className="hoy-resumen">
            Empezaste hace {Math.floor((Date.now() - new Date(actual.inicio).getTime()) / 60_000)} min. Lo que
            anotaste sigue guardado.
          </p>
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
        <>
          <section className="hoy">
            <div className="hoy-arriba">
              <span className="hoy-icono">
                <IconoSesion tamano={20} tipo={toca} />
              </span>
              <p className="hoy-etiqueta">{terminadas.length === 0 ? "Tu primer día" : "Hoy toca"}</p>
            </div>
            <h1 className="hoy-nombre">{info.nombre}</h1>
            <p className="cifra">
              <strong>{cifra.valor}</strong>
              <span>{cifra.texto}</span>
            </p>
            <p className="hoy-resumen">{info.resumen}</p>
            <button className="boton grande" onClick={() => empezar(toca)} type="button">
              Empezar
            </button>
          </section>
          <section className="otras">
            <h2>¿Prefieres otra sesión?</h2>
            <div className="otras-lista">
              {ORDEN.filter((t) => t !== toca).map((tipo) => (
                <button key={tipo} onClick={() => empezar(tipo)} type="button">
                  <IconoSesion tamano={20} tipo={tipo} />
                  <span>{SESIONES[tipo].corto}</span>
                </button>
              ))}
            </div>
          </section>
        </>
      )}

      {terminadas.length > 0 ? (
        <section aria-label="Tu avance" className="semana">
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
