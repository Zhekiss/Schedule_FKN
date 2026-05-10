export const TIME_SLOTS = [
  "8:00 - 9:35",
  "9:45 - 11:20",
  "11:30 - 13:05",
  "13:25 - 15:00",
  "15:10 - 16:45",
  "16:55 - 18:30",
  "18:40 - 20:00",
  "20:10 - 21:30",
];

export const DAYS = [
  "Понедельник",
  "Вторник",
  "Среда",
  "Четверг",
  "Пятница",
  "Суббота",
];

export const COURSES = ["1 курс", "2 курс", "3 курс", "4 курс", "Магистратура"];

export const GROUPS: Record<string, string[]> = {
  "1 курс": ["ПИ-101", "ПИ-102", "ИБ-101"],
  "2 курс": ["ПИ-201", "ПИ-202", "ИБ-201"],
  "3 курс": ["ПИ-301", "ПИ-302", "ИБ-301"],
  "4 курс": ["ПИ-401", "ПИ-402", "ИБ-401"],
  Магистратура: ["М-ПИ-11", "М-ИБ-11"],
};

export const SUBGROUPS = ["1 подгруппа", "2 подгруппа", "Общая"];

export interface ScheduleItem {
  id: string;
  day: number; // 0-5 (Mon-Sat)
  timeSlot: number; // 0-7
  subject: string;
  type: "Лекция" | "Практика" | "Лабораторная";
  teacher: string;
  room: string;
  course: string;
  groups: string[];
  subgroup?: string; // Optional, applies to specific subgroup
}

export const ROOMS = [
  "Ауд. 101",
  "Ауд. 102",
  "Ауд. 201 (Комп. класс)",
  "Ауд. 202 (Комп. класс)",
  "Ауд. 301 (Лекционная)",
  "Ауд. 302",
  "Ауд. 401",
];

// Helper to generate some random mock schedule
const generateMockSchedule = (): ScheduleItem[] => {
  const schedule: ScheduleItem[] = [];
  let idCounter = 1;

  const subjects = [
    "Математический анализ",
    "Программирование на Python",
    "Базы данных",
    "Алгоритмы и структуры данных",
    "Операционные системы",
    "Веб-разработка",
  ];
  const teachers = [
    "Иванов И.И.",
    "Петров П.П.",
    "Сидоров С.С.",
    "Смирнова А.А.",
    "Кузнецов В.В.",
  ];

  for (let course of COURSES) {
    const courseGroups = GROUPS[course];
    if (!courseGroups) continue;

    for (let day = 0; day < 6; day++) {
      // 1-3 pairs per day per group
      for (let group of courseGroups) {
        const numPairs = Math.floor(Math.random() * 3) + 1;
        const usedSlots = new Set<number>();

        for (let i = 0; i < numPairs; i++) {
          let timeSlot;
          do {
            timeSlot = Math.floor(Math.random() * 5); // Usually earlier pairs
          } while (usedSlots.has(timeSlot));
          usedSlots.add(timeSlot);

          const isLecture = Math.random() > 0.6;
          // For lecture, we can combine groups
          const itemGroups = isLecture
            ? [group, courseGroups.find((g) => g !== group) || group]
            : [group];
          const uniqueGroups = Array.from(new Set(itemGroups));

          let type: "Лекция" | "Практика" | "Лабораторная" = isLecture
            ? "Лекция"
            : Math.random() > 0.5
              ? "Практика"
              : "Лабораторная";
          let subgroup = undefined;

          if (type === "Лабораторная") {
            subgroup = Math.random() > 0.5 ? "1 подгруппа" : "2 подгруппа";
          }

          schedule.push({
            id: `item-${idCounter++}`,
            day,
            timeSlot,
            subject: subjects[Math.floor(Math.random() * subjects.length)],
            type,
            teacher: teachers[Math.floor(Math.random() * teachers.length)],
            room: ROOMS[Math.floor(Math.random() * ROOMS.length)],
            course,
            groups: uniqueGroups,
            subgroup,
          });
        }
      }
    }
  }

  // Ensure some specific data for testing
  schedule.push({
    id: "test-lecture-1",
    day: 0, // Понедельник
    timeSlot: 0, // 8:00
    subject: "Высшая математика",
    type: "Лекция",
    teacher: "Проф. Александров",
    room: "Ауд. 301 (Лекционная)",
    course: "1 курс",
    groups: ["ПИ-101", "ПИ-102", "ИБ-101"], // Потоковая лекция!
  });

  return schedule;
};

export const MOCK_SCHEDULE = generateMockSchedule();
