// El plan de entrenamiento: qué ejercicios hay, en qué orden y con qué metas.
// Si quieres cambiar la rutina, este es el archivo que se edita.

export type TipoSesion = "cardio" | "fuerza-a" | "intervalos" | "fuerza-b" | "estirar";

// Cómo se mide cada serie: repeticiones, segundos (plancha) o metros (caminata).
export type Medida = "reps" | "segundos" | "metros";

export type Ejercicio = {
  id: string;
  nombre: string;
  series: number;
  meta: number;
  medida: Medida;
  descanso: number;
  porLado?: boolean;
  // Peso con el que empiezas y cuánto subes cuando toca. Sin peso = 0.
  pesoInicial: number;
  subir: number;
  unidadPeso?: string;
  consejo: string;
};

export type Estiramiento = { nombre: string; porLado?: boolean; segundos?: number; consejo: string };

export const ROTACION: TipoSesion[] = ["cardio", "fuerza-a", "intervalos", "fuerza-b"];

export const SESIONES: Record<TipoSesion, { nombre: string; corto: string; color: string; resumen: string }> = {
  cardio: {
    nombre: "Cardio largo",
    corto: "Cardio",
    color: "var(--cardio)",
    resumen: "Caminadora inclinada o bici a ritmo constante, luego estiramientos.",
  },
  "fuerza-a": {
    nombre: "Fuerza A",
    corto: "Fuerza A",
    color: "var(--fuerza)",
    resumen: "Sentadilla, press de pecho, remo, peso muerto rumano y plancha.",
  },
  intervalos: {
    nombre: "Intervalos",
    corto: "Intervalos",
    color: "var(--cardio)",
    resumen: "8 rondas de 30 s fuerte y 90 s suave en bici o elíptica.",
  },
  "fuerza-b": {
    nombre: "Fuerza B",
    corto: "Fuerza B",
    color: "var(--fuerza)",
    resumen: "Prensa, press de hombro, jalón, hip thrust y caminata del granjero.",
  },
  estirar: {
    nombre: "Estirar",
    corto: "Estirar",
    color: "var(--flex)",
    resumen: "Rutina larga de flexibilidad. Puedes hacerla en casa cualquier día.",
  },
};

export const EJERCICIOS: Record<"fuerza-a" | "fuerza-b", Ejercicio[]> = {
  "fuerza-a": [
    {
      id: "sentadilla-goblet",
      nombre: "Sentadilla goblet",
      series: 3,
      meta: 10,
      medida: "reps",
      descanso: 90,
      pesoInicial: 8,
      subir: 2,
      unidadPeso: "kg",
      consejo: "Mancuerna pegada al pecho. Baja como si te sentaras; las rodillas siguen a las puntas de los pies.",
    },
    {
      id: "press-pecho",
      nombre: "Press de pecho con mancuernas",
      series: 3,
      meta: 10,
      medida: "reps",
      descanso: 90,
      pesoInicial: 8,
      subir: 1,
      unidadPeso: "kg por mano",
      consejo: "Banco plano. Baja hasta que los codos queden un poco debajo del banco.",
    },
    {
      id: "remo-mancuerna",
      nombre: "Remo con mancuerna a una mano",
      series: 3,
      meta: 10,
      medida: "reps",
      descanso: 60,
      porLado: true,
      pesoInicial: 10,
      subir: 2,
      unidadPeso: "kg",
      consejo: "Mano y rodilla en el banco. Jala el codo hacia la cadera.",
    },
    {
      id: "peso-muerto-rumano",
      nombre: "Peso muerto rumano",
      series: 3,
      meta: 10,
      medida: "reps",
      descanso: 90,
      pesoInicial: 10,
      subir: 2,
      unidadPeso: "kg por mano",
      consejo: "Espalda recta. Empuja la cadera hacia atrás y baja hasta media espinilla.",
    },
    {
      id: "plancha",
      nombre: "Plancha",
      series: 3,
      meta: 30,
      medida: "segundos",
      descanso: 45,
      pesoInicial: 0,
      subir: 0,
      consejo: "Aprieta abdomen y glúteos. Que la cadera no se caiga.",
    },
  ],
  "fuerza-b": [
    {
      id: "prensa",
      nombre: "Prensa de piernas",
      series: 3,
      meta: 12,
      medida: "reps",
      descanso: 90,
      pesoInicial: 40,
      subir: 5,
      unidadPeso: "kg agregados",
      consejo: "Baja hasta unos 90° de rodilla sin despegar la espalda baja.",
    },
    {
      id: "press-hombro",
      nombre: "Press de hombro sentado",
      series: 3,
      meta: 10,
      medida: "reps",
      descanso: 90,
      pesoInicial: 6,
      subir: 1,
      unidadPeso: "kg por mano",
      consejo: "Sube sin arquear la espalda.",
    },
    {
      id: "jalon-pecho",
      nombre: "Jalón al pecho en polea",
      series: 3,
      meta: 10,
      medida: "reps",
      descanso: 60,
      pesoInicial: 25,
      subir: 5,
      unidadPeso: "kg",
      consejo: "Lleva la barra a la parte alta del pecho, con el pecho hacia arriba.",
    },
    {
      id: "hip-thrust",
      nombre: "Hip thrust o puente de glúteo",
      series: 3,
      meta: 12,
      medida: "reps",
      descanso: 60,
      pesoInicial: 0,
      subir: 5,
      unidadPeso: "kg en la barra",
      consejo: "Empieza con tu peso. Aprieta el glúteo un segundo arriba.",
    },
    {
      id: "caminata-granjero",
      nombre: "Caminata del granjero",
      series: 3,
      meta: 30,
      medida: "metros",
      descanso: 60,
      pesoInicial: 14,
      subir: 2,
      unidadPeso: "kg por mano",
      consejo: "Camina erguido y con pasos cortos.",
    },
  ],
};

// Estiramientos al final de cada sesión (30 s) o en la rutina larga (45 s).
export const ESTIRAMIENTOS: Estiramiento[] = [
  { nombre: "Parte de atrás del muslo", porLado: true, consejo: "Sentado, una pierna estirada. Inclínate desde la cadera con la espalda recta." },
  { nombre: "Frente del muslo", porLado: true, consejo: "De pie, lleva el talón al glúteo. Rodillas juntas; apóyate en algo." },
  { nombre: "Flexor de cadera", porLado: true, consejo: "Rodilla atrás en el piso, la otra al frente. Empuja la cadera hacia adelante." },
  { nombre: "Glúteo en figura 4", porLado: true, consejo: "Acostado, tobillo sobre la rodilla contraria. Jala la pierna de abajo hacia ti." },
  { nombre: "Pantorrilla en la pared", porLado: true, consejo: "Manos en la pared, una pierna atrás estirada con el talón en el piso." },
  { nombre: "Pecho en el marco de una puerta", consejo: "Antebrazo en el marco a la altura del hombro. Gira el cuerpo hacia el otro lado." },
  { nombre: "Hombro cruzado", porLado: true, consejo: "Cruza el brazo frente al pecho y empújalo suave con el otro." },
  { nombre: "Gato-vaca", segundos: 40, consejo: "En cuatro puntos: arquea y redondea la espalda despacio, con la respiración." },
  { nombre: "Postura del niño", segundos: 45, consejo: "Sentado sobre los talones, brazos al frente. Respira lento." },
];

// Al ritmo de la rotación, el cardio largo sube 5 min cada 2 sesiones hasta 45.
export const CARDIO_INICIAL = 30;
export const CARDIO_MAXIMO = 45;

export const INTERVALOS = { calentar: 300, fuerte: 30, suave: 90, rondas: 8, enfriar: 180 };

export const CARDIO_FINAL_MIN = 10;

export const MAQUINAS = ["Caminadora", "Bicicleta", "Elíptica", "Escaladora", "Remo"];
