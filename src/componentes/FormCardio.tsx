import { useState } from "react";

import type { Cardio } from "../lib/datos";
import { MAQUINAS } from "../lib/plan";
import { Contador, Opciones } from "./basicos";

// Lo que se anota de una sesión de cardio: máquina, minutos y, si quieres, velocidad o distancia.

export function FormCardio({
  inicial,
  minutos,
  textoGuardar,
  onGuardar,
}: {
  inicial?: Cardio;
  minutos: number;
  textoGuardar: string;
  onGuardar: (cardio: Cardio) => void;
}) {
  const [cardio, setCardio] = useState<Cardio>(inicial ?? { maquina: "Caminadora", minutos });
  const cambiar = (cambio: Partial<Cardio>) => setCardio((previo) => ({ ...previo, ...cambio }));
  const esCaminadora = cardio.maquina === "Caminadora";

  return (
    <div className="form-cardio">
      <Opciones onCambio={(maquina) => cambiar({ maquina })} opciones={MAQUINAS} valor={cardio.maquina} />
      <div className="captura">
        <Contador etiqueta="Minutos" minimo={1} onCambio={(m) => cambiar({ minutos: m })} paso={5} unidad="min" valor={cardio.minutos} />
        {esCaminadora ? (
          <Contador
            etiqueta="Velocidad"
            onCambio={(v) => cambiar({ velocidad: v })}
            paso={0.5}
            unidad="km/h"
            valor={cardio.velocidad ?? 5}
          />
        ) : null}
        <Contador
          etiqueta={esCaminadora ? "Inclinación" : "Resistencia"}
          onCambio={(i) => cambiar({ inclinacion: i })}
          paso={1}
          unidad={esCaminadora ? "%" : "nivel"}
          valor={cardio.inclinacion ?? (esCaminadora ? 8 : 5)}
        />
        <Contador
          etiqueta="Distancia (si la marca)"
          onCambio={(d) => cambiar({ distancia: d })}
          paso={0.1}
          unidad="km"
          valor={cardio.distancia ?? 0}
        />
      </div>
      <button
        className="boton grande"
        onClick={() =>
          onGuardar({
            ...cardio,
            velocidad: esCaminadora ? (cardio.velocidad ?? 5) : undefined,
            inclinacion: cardio.inclinacion ?? (esCaminadora ? 8 : 5),
            distancia: cardio.distancia || undefined,
          })
        }
        type="button"
      >
        {textoGuardar}
      </button>
    </div>
  );
}
