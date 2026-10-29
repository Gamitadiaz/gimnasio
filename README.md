# Gimnasio

App para el celular (PWA) para registrar mis entrenamientos de cardio, fuerza y flexibilidad.

- Funciona sin internet: se instala desde el navegador en la pantalla de inicio.
- Los datos se guardan **solo en el celular**. En la pestaña *Respaldo* se exporta un archivo para no perderlos.
- La rutina (ejercicios, pesos iniciales, estiramientos) está en `src/lib/plan.ts`.

Publicada en https://gamitadiaz.github.io/gimnasio/

## Desarrollo

```sh
npm install
npm run dev     # http://localhost:5173/gimnasio/
npm run build   # comprueba tipos y genera dist/
```

Cada push a `main` la publica sola en GitHub Pages (`.github/workflows/publicar.yml`).
