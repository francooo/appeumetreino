// Datas do medidor de calorias. Os dias sao chaves "YYYY-MM-DD" no fuso do aparelho.

const MONTHS = [
  "janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
];
const WEEKDAYS_SHORT = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export function dayKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function todayKey(): string {
  return dayKey(new Date());
}

// Converte a chave em Date local (meio-dia, para nao virar o dia em fusos diferentes)
export function keyToDate(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d, 12);
}

export function addDays(key: string, days: number): string {
  const date = keyToDate(key);
  date.setDate(date.getDate() + days);
  return dayKey(date);
}

// "Hoje, 17 de outubro" / "Ontem, 16 de outubro" / "Qui, 15 de outubro"
export function formatDayLong(key: string): string {
  const date = keyToDate(key);
  const label = `${date.getDate()} de ${MONTHS[date.getMonth()]}`;
  if (key === todayKey()) return `Hoje, ${label}`;
  if (key === addDays(todayKey(), -1)) return `Ontem, ${label}`;
  return `${WEEKDAYS_SHORT[date.getDay()]}, ${label}`;
}

// "Hoje" ou dia da semana abreviado (eixo do grafico de peso)
export function formatWeekdayShort(key: string): string {
  if (key === todayKey()) return "Hoje";
  return WEEKDAYS_SHORT[keyToDate(key).getDay()];
}

// "hoje" / "ontem" / "15/10"
export function formatRelativeDay(key: string): string {
  if (key === todayKey()) return "hoje";
  if (key === addDays(todayKey(), -1)) return "ontem";
  const date = keyToDate(key);
  return `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export function formatTime(iso: string): string {
  const date = new Date(iso);
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}
