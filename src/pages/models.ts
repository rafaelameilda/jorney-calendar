export interface Holiday {
  date: string;
  start: Date;
  end: Date;
  name: string;
  type: string;
  rule: string;
  substitute?: boolean;
}

export interface Event {
  id: string;
  title: string;
  details: string;
  date: string;
  hours: number;
  duration?: number;
  bgColor?: string;
  icon?: string;
  days?: number;
}

export interface GroupedEvent {
  title: string;
  totalWeek: number;
  totalSaturday: number;
  totalSunday: number;
  totalGeneral: number;
}

export enum WEEK_DAY_ENUM {
  DOMINGO = "DOMINGO",
  SABADO = "SABADO",
  SEGUNDA = "SEGUNDA",
  TERCA = "TERCA",
  QUARTA = "QUARTA",
  QUINTA = "QUINTA",
  SEXTA = "SEXTA",
}

export const WEEKDAY: { [key: number]: string } = {
  0: WEEK_DAY_ENUM.DOMINGO,
  1: WEEK_DAY_ENUM.SEGUNDA,
  2: WEEK_DAY_ENUM.TERCA,
  3: WEEK_DAY_ENUM.QUARTA,
  4: WEEK_DAY_ENUM.QUINTA,
  5: WEEK_DAY_ENUM.SEXTA,
  6: WEEK_DAY_ENUM.SABADO,
};

export const HOURS_VALUE: { [key: string]: number } = {
  [WEEK_DAY_ENUM.DOMINGO]: 14,
  [WEEK_DAY_ENUM.SABADO]: 12,
  [WEEK_DAY_ENUM.SEGUNDA]: 8,
  [WEEK_DAY_ENUM.TERCA]: 8,
  [WEEK_DAY_ENUM.QUARTA]: 8,
  [WEEK_DAY_ENUM.QUINTA]: 8,
  [WEEK_DAY_ENUM.SEXTA]: 8,
} as const;

export const HOLYDAY_TYPE_MAP: Record<string, string> = {
  public: "Feriado Público",
  observance: "Observância",
  optional: "Opcional",
  bank: "Feriado Bancário",
  school: "Feriado Escolar",
} as const;

export const HOLYDAY_HOURS_VALUE_MAP: Record<
  keyof typeof HOLYDAY_TYPE_MAP,
  number
> = {
  public: HOURS_VALUE[WEEK_DAY_ENUM.DOMINGO]!,
  observance: HOURS_VALUE[WEEK_DAY_ENUM.SEGUNDA]!,
  optional: HOURS_VALUE[WEEK_DAY_ENUM.SEGUNDA]!,
  bank: HOURS_VALUE[WEEK_DAY_ENUM.SEGUNDA]!,
  school: HOURS_VALUE[WEEK_DAY_ENUM.SEGUNDA]!,
} as const;
