import { useEffect } from "react";

// Pitidos, vibración y pantalla encendida.

let audio: AudioContext | undefined;

// Los celulares solo dejan sonar audio después de un toque: se llama al empezar la sesión.
export function activarSonido() {
  audio ??= new AudioContext();
  if (audio.state === "suspended") void audio.resume();
}

export function pitido(veces = 1, agudo = false) {
  if (audio) {
    for (let i = 0; i < veces; i++) {
      const tono = audio.createOscillator();
      const volumen = audio.createGain();
      const inicio = audio.currentTime + i * 0.25;
      tono.frequency.value = agudo ? 1320 : 880;
      volumen.gain.setValueAtTime(0.25, inicio);
      volumen.gain.exponentialRampToValueAtTime(0.001, inicio + 0.18);
      tono.connect(volumen).connect(audio.destination);
      tono.start(inicio);
      tono.stop(inicio + 0.2);
    }
  }
  // iPhone no permite vibrar desde una página; en Android sí.
  navigator.vibrate?.(Array.from({ length: veces * 2 - 1 }, (_, i) => (i % 2 ? 120 : 200)));
}

// Mantiene la pantalla encendida mientras el componente está en pantalla.
export function usePantallaEncendida(activo = true) {
  useEffect(() => {
    if (!activo || !("wakeLock" in navigator)) return;
    let candado: WakeLockSentinel | undefined;
    const pedir = async () => {
      try {
        if (document.visibilityState === "visible") candado = await navigator.wakeLock.request("screen");
      } catch {
        // Si no se puede (batería baja, por ejemplo), la app sigue funcionando igual.
      }
    };
    void pedir();
    document.addEventListener("visibilitychange", pedir);
    return () => {
      document.removeEventListener("visibilitychange", pedir);
      void candado?.release();
    };
  }, [activo]);
}

export const reloj = (segundos: number) => {
  const s = Math.max(0, Math.ceil(segundos));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};

// "Jueves, 29 de octubre": solo la primera letra en mayúscula.
export const fechaLarga = (iso: string) => {
  const texto = new Date(iso).toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long" });
  return texto.charAt(0).toUpperCase() + texto.slice(1);
};

export const fechaCorta = (iso: string) =>
  new Date(iso).toLocaleDateString("es-MX", { day: "numeric", month: "short" });
