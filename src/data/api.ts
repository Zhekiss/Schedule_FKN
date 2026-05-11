const API_BASE = "http://localhost:8000";

export interface ScheduleItem {
  id: string;
  day: number;
  timeSlot: number;
  subject: string;
  type: string;
  teacher: string;
  room: string;
  course: string;
  groups: string[];
  subgroup?: string;
}

export async function fetchSchedule(
  course: string,
  group: string,
  subgroup?: string,
): Promise<ScheduleItem[]> {
  const params = new URLSearchParams({ course, group });
  if (subgroup && subgroup !== "Общая") {
    params.append("subgroup", subgroup);
  } else if (subgroup === "Общая") {
    params.append("subgroup", "Общая");
  }
  const res = await fetch(`${API_BASE}/api/schedule?${params}`);
  if (!res.ok) throw new Error("Не удалось загрузить расписание");
  const data: any[] = await res.json();
  return data.map((item) => ({ ...item, id: String(item.id) }));
}

export async function fetchEmptyRooms(
  day: number,
  timeSlot: number,
): Promise<string[]> {
  const res = await fetch(
    `${API_BASE}/api/rooms/empty?day=${day}&timeSlot=${timeSlot}`,
  );
  if (!res.ok) throw new Error("Не удалось загрузить список аудиторий");
  return res.json();
}
