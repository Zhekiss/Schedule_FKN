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
  subgroup?: string | null;
  teacher_id?: number;
  room_id?: number;
  course_id?: number;
  group_ids?: number[];
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

// Admin danh mục
export async function fetchCourses(): Promise<{ id: number; name: string }[]> {
  const res = await fetch(`${API_BASE}/api/admin/courses`);
  if (!res.ok) throw new Error("Ошибка загрузки курсов");
  return res.json();
}

export async function fetchGroups(
  courseId?: number,
): Promise<{ id: number; name: string; course_id: number }[]> {
  const params = courseId ? `?course_id=${courseId}` : "";
  const res = await fetch(`${API_BASE}/api/admin/groups${params}`);
  if (!res.ok) throw new Error("Ошибка загрузки групп");
  return res.json();
}

export async function fetchRooms(): Promise<{ id: number; name: string }[]> {
  const res = await fetch(`${API_BASE}/api/admin/rooms`);
  if (!res.ok) throw new Error("Ошибка загрузки аудиторий");
  return res.json();
}

export async function fetchTeachers(): Promise<{ id: number; name: string }[]> {
  const res = await fetch(`${API_BASE}/api/admin/teachers`);
  if (!res.ok) throw new Error("Ошибка загрузки преподавателей");
  return res.json();
}

export interface ScheduleCreatePayload {
  day: number;
  time_slot: number;
  subject: string;
  type: string;
  teacher_id: number;
  room_id: number;
  course_id: number;
  group_ids: number[];
  subgroup?: string | null;
}

export async function createSchedule(
  payload: ScheduleCreatePayload,
): Promise<ScheduleItem> {
  const res = await fetch(`${API_BASE}/api/schedule`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Ошибка создания");
  }
  const item = await res.json();
  return { ...item, id: String(item.id) };
}

export async function updateSchedule(
  id: number,
  payload: ScheduleCreatePayload,
): Promise<ScheduleItem> {
  const res = await fetch(`${API_BASE}/api/schedule/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Ошибка обновления");
  }
  const item = await res.json();
  return { ...item, id: String(item.id) };
}

export async function deleteSchedule(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/api/schedule/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Ошибка удаления");
  }
}

export async function fetchScheduleById(id: number): Promise<ScheduleItem> {
  const res = await fetch(`${API_BASE}/api/schedule/${id}`);
  if (!res.ok) throw new Error("Занятие не найдено");
  const item = await res.json();
  return { ...item, id: String(item.id) };
}
