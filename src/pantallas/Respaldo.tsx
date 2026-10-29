import { useEffect, useState } from "react";

import { fechaLarga } from "../lib/aviso";
import { aRespaldo, type Datos, desdeRespaldo, guardar, pedirPersistencia } from "../lib/datos";

// Como todo vive solo en el celular, el respaldo es un archivo que guardas donde quieras.

export function Respaldo({ datos }: { datos: Datos }) {
  const [protegido, setProtegido] = useState<boolean>();
  const [mensaje, setMensaje] = useState<string>();

  useEffect(() => {
    void pedirPersistencia().then(setProtegido);
  }, []);

  const exportar = async () => {
    const nombre = `gimnasio-respaldo-${new Date().toISOString().slice(0, 10)}.json`;
    const archivo = new File([aRespaldo(datos)], nombre, { type: "application/json" });
    // En el celular, "Compartir" deja mandarlo a Drive, WhatsApp o correo.
    if (navigator.canShare?.({ files: [archivo] })) {
      try {
        await navigator.share({ files: [archivo], title: "Respaldo de Gimnasio" });
      } catch (error) {
        if ((error as Error).name === "AbortError") return;
        throw error;
      }
    } else {
      const enlace = document.createElement("a");
      enlace.href = URL.createObjectURL(archivo);
      enlace.download = nombre;
      enlace.click();
      URL.revokeObjectURL(enlace.href);
    }
    guardar((d) => ({ ...d, ultimoRespaldo: new Date().toISOString() }));
    setMensaje("Respaldo listo. Guárdalo en un lugar fuera del celular, como Drive o tu PC.");
  };

  const importar = async (archivo: File) => {
    try {
      const nuevos = desdeRespaldo(await archivo.text());
      const cuantas = nuevos.sesiones.length;
      if (!confirm(`Este respaldo tiene ${cuantas} sesiones. Va a reemplazar lo que hay ahora en la app. ¿Seguir?`)) return;
      guardar((d) => ({ ...nuevos, actual: d.actual }));
      setMensaje(`Listo: se cargaron ${cuantas} sesiones.`);
    } catch (error) {
      setMensaje(error instanceof SyntaxError ? "El archivo está dañado o no es un respaldo." : (error as Error).message);
    }
  };

  return (
    <div className="respaldo">
      <h1>Respaldo</h1>
      <p>
        Tus datos se guardan <b>solo en este celular</b>; no se suben a internet. Si borras los datos del navegador o
        cambias de teléfono, se pierden. Haz un respaldo cada par de semanas.
      </p>

      <section className="prueba">
        <p className="respaldo-estado">
          {datos.sesiones.length} {datos.sesiones.length === 1 ? "sesión" : "sesiones"} y {datos.pruebas.length}{" "}
          {datos.pruebas.length === 1 ? "prueba guardada" : "pruebas guardadas"}.
          <br />
          {datos.ultimoRespaldo ? `Último respaldo: ${fechaLarga(datos.ultimoRespaldo)}.` : "Todavía no has hecho un respaldo."}
        </p>
        <button className="boton grande" onClick={() => void exportar()} type="button">
          Exportar respaldo
        </button>
        <label className="boton secundario archivo">
          Importar respaldo
          <input
            accept="application/json,.json"
            onChange={(e) => {
              const archivo = e.target.files?.[0];
              if (archivo) void importar(archivo);
              e.target.value = "";
            }}
            type="file"
          />
        </label>
        {mensaje ? <p className="mensaje">{mensaje}</p> : null}
      </section>

      <p className="ayuda">
        {protegido === undefined
          ? ""
          : protegido
            ? "El navegador marcó tus datos como protegidos: no los borrará aunque falte espacio."
            : "El navegador no garantiza guardar tus datos para siempre. Instala la app en la pantalla de inicio y haz respaldos."}
      </p>
    </div>
  );
}
