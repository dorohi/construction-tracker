export interface CalendarDay {
  date: Date;
  dateKey: string;
  isCurrentMonth: boolean;
  isToday: boolean;
}

export function formatDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function formatMonthYear(date: Date): string {
  return date.toLocaleDateString("ru-RU", { month: "long", year: "numeric" });
}

export function formatDayLong(dateKey: string): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function buildCalendarGrid(monthStart: Date): CalendarDay[] {
  const year = monthStart.getFullYear();
  const month = monthStart.getMonth();

  // Monday = 0, Sunday = 6
  let firstDow = monthStart.getDay();
  firstDow = firstDow === 0 ? 6 : firstDow - 1;

  const startDate = new Date(year, month, 1 - firstDow);
  const todayKey = formatDateKey(new Date());

  const days: CalendarDay[] = [];
  for (let i = 0; i < 42; i++) {
    const date = new Date(
      startDate.getFullYear(),
      startDate.getMonth(),
      startDate.getDate() + i,
    );
    const dateKey = formatDateKey(date);
    days.push({
      date,
      dateKey,
      isCurrentMonth: date.getMonth() === month && date.getFullYear() === year,
      isToday: dateKey === todayKey,
    });
  }
  return days;
}

export function getTypeColor(type: string): string {
  switch (type) {
    case "MATERIAL":
      return "primary.main";
    case "LABOR":
      return "secondary.main";
    case "DELIVERY":
      return "success.main";
    default:
      return "text.secondary";
  }
}
