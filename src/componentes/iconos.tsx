import type { ReactNode } from "react";

import type { TipoSesion } from "../lib/plan";

// Íconos dibujados a mano en SVG (sin librerías, así la app pesa poco y abre sin internet).

function Svg({ children, tamano = 24 }: { children: ReactNode; tamano?: number }) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height={tamano}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      viewBox="0 0 24 24"
      width={tamano}
    >
      {children}
    </svg>
  );
}

const DIBUJOS: Record<string, ReactNode> = {
  // Línea de pulso.
  cardio: <path d="M2 12h4l2.5-6 4 12 2.5-6H22" />,
  // Mancuerna.
  fuerza: (
    <>
      <path d="M7 12h10" />
      <rect height="12" rx="1.5" width="3" x="4" y="6" />
      <rect height="12" rx="1.5" width="3" x="17" y="6" />
      <path d="M2 10v4M22 10v4" />
    </>
  ),
  // Rayo.
  intervalos: <path d="M13 2 4 14h7l-1 8 9-12h-7z" />,
  // Persona estirando los brazos.
  estirar: (
    <>
      <circle cx="12" cy="4.5" r="2" />
      <path d="M4 8l8 2 8-2M12 10v5l-4 6M12 15l4 6" />
    </>
  ),
  hoy: (
    <>
      <rect height="17" rx="2.5" width="18" x="3" y="4.5" />
      <path d="M3 9.5h18M8 2.5v4M16 2.5v4" />
      <circle cx="12" cy="15" fill="currentColor" r="1.6" stroke="none" />
    </>
  ),
  historial: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  progreso: <path d="M3 20h18M5 16l4-5 4 3 6-8M15 6h4v4" />,
  respaldo: (
    <>
      <path d="M12 3v12M7 10l5 5 5-5" />
      <path d="M4 17v2.5A1.5 1.5 0 0 0 5.5 21h13a1.5 1.5 0 0 0 1.5-1.5V17" />
    </>
  ),
  palomita: <path d="M5 12.5l4.5 4.5L19 7.5" />,
};

const POR_TIPO: Record<TipoSesion, string> = {
  cardio: "cardio",
  "fuerza-a": "fuerza",
  "fuerza-b": "fuerza",
  intervalos: "intervalos",
  estirar: "estirar",
};

export function Icono({ nombre, tamano }: { nombre: keyof typeof DIBUJOS; tamano?: number }) {
  return <Svg tamano={tamano}>{DIBUJOS[nombre]}</Svg>;
}

export function IconoSesion({ tipo, tamano }: { tipo: TipoSesion; tamano?: number }) {
  return <Icono nombre={POR_TIPO[tipo]} tamano={tamano} />;
}

// Anillo de progreso: se llena según "fraccion" (de 0 a 1). Lo usan los temporizadores.
export function Anillo({
  fraccion,
  tamano,
  grosor = 8,
  children,
}: {
  fraccion: number;
  tamano: number;
  grosor?: number;
  children?: ReactNode;
}) {
  const radio = (tamano - grosor) / 2;
  const vuelta = 2 * Math.PI * radio;
  const lleno = Math.min(1, Math.max(0, fraccion));
  return (
    <div className="anillo" style={{ width: tamano, height: tamano }}>
      <svg aria-hidden="true" height={tamano} viewBox={`0 0 ${tamano} ${tamano}`} width={tamano}>
        <circle className="anillo-fondo" cx={tamano / 2} cy={tamano / 2} fill="none" r={radio} strokeWidth={grosor} />
        <circle
          className="anillo-lleno"
          cx={tamano / 2}
          cy={tamano / 2}
          fill="none"
          r={radio}
          strokeDasharray={vuelta}
          strokeDashoffset={vuelta * (1 - lleno)}
          strokeLinecap="round"
          strokeWidth={grosor}
          transform={`rotate(-90 ${tamano / 2} ${tamano / 2})`}
        />
      </svg>
      <div className="anillo-centro">{children}</div>
    </div>
  );
}
