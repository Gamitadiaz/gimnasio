import { useEffect, useState } from "react";

import { Icono } from "./componentes/iconos";
import { pedirPersistencia, useDatos } from "./lib/datos";
import { Historial } from "./pantallas/Historial";
import { Inicio } from "./pantallas/Inicio";
import { Progreso } from "./pantallas/Progreso";
import { Respaldo } from "./pantallas/Respaldo";
import { Sesion } from "./pantallas/Sesion";

type Pantalla = "inicio" | "historial" | "progreso" | "respaldo";

const PESTANAS: { id: Pantalla; texto: string }[] = [
  { id: "inicio", texto: "Hoy" },
  { id: "historial", texto: "Historial" },
  { id: "progreso", texto: "Progreso" },
  { id: "respaldo", texto: "Respaldo" },
];

export function App() {
  const datos = useDatos();
  const [pantalla, setPantalla] = useState<Pantalla>("inicio");
  const [entrenando, setEntrenando] = useState(false);

  useEffect(() => {
    void pedirPersistencia();
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pantalla, entrenando]);

  if (entrenando && datos.actual) {
    return <Sesion datos={datos} onSalir={() => setEntrenando(false)} />;
  }

  return (
    <>
      <main className="pagina">
        {pantalla === "inicio" ? <Inicio datos={datos} onEntrenar={() => setEntrenando(true)} onIr={setPantalla} /> : null}
        {pantalla === "historial" ? <Historial datos={datos} /> : null}
        {pantalla === "progreso" ? <Progreso datos={datos} /> : null}
        {pantalla === "respaldo" ? <Respaldo datos={datos} /> : null}
      </main>
      <nav className="pestanas">
        {PESTANAS.map((p) => (
          <button aria-current={pantalla === p.id ? "page" : undefined} key={p.id} onClick={() => setPantalla(p.id)} type="button">
            <Icono nombre={p.id === "inicio" ? "hoy" : p.id} tamano={22} />
            <span>{p.texto}</span>
          </button>
        ))}
      </nav>
    </>
  );
}
