import { X } from "lucide-react";
import { useEffect, useState } from "react";
import {
  fetchCourses,
  fetchGroups,
  fetchRooms,
  fetchTeachers,
  createSchedule,
  updateSchedule,
  deleteSchedule,
  fetchScheduleById,
  ScheduleCreatePayload,
} from "../data/api";

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  editScheduleId: number | null;
}

export default function ScheduleModal({
  isOpen,
  onClose,
  onSaved,
  editScheduleId,
}: ScheduleModalProps) {
  const [day, setDay] = useState(0);
  const [timeSlot, setTimeSlot] = useState(0);
  const [subject, setSubject] = useState("");
  const [type, setType] = useState("Лекция");
  const [teacherId, setTeacherId] = useState<number | "">("");
  const [roomId, setRoomId] = useState<number | "">("");
  const [courseId, setCourseId] = useState<number | "">("");
  const [groupIds, setGroupIds] = useState<number[]>([]);
  const [subgroup, setSubgroup] = useState<string | null>(null);

  const [courses, setCourses] = useState<{ id: number; name: string }[]>([]);
  const [allGroups, setAllGroups] = useState<
    { id: number; name: string; course_id: number }[]
  >([]);
  const [rooms, setRooms] = useState<{ id: number; name: string }[]>([]);
  const [teachers, setTeachers] = useState<{ id: number; name: string }[]>([]);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      Promise.all([fetchCourses(), fetchRooms(), fetchTeachers()]).then(
        ([c, r, t]) => {
          setCourses(c);
          setRooms(r);
          setTeachers(t);
        },
      );
      fetchGroups().then(setAllGroups);

      if (editScheduleId) {
        fetchScheduleById(editScheduleId)
          .then((item) => {
            setDay(item.day);
            setTimeSlot(item.timeSlot);
            setSubject(item.subject);
            setType(item.type);
            setTeacherId(item.teacher_id!);
            setRoomId(item.room_id!);
            setCourseId(item.course_id!);
            setGroupIds(item.group_ids!);
            setSubgroup(item.subgroup ?? null);
          })
          .catch(() => setError("Не удалось загрузить занятие"));
      } else {
        // Reset form
        setDay(0);
        setTimeSlot(0);
        setSubject("");
        setType("Лекция");
        setTeacherId("");
        setRoomId("");
        setCourseId("");
        setGroupIds([]);
        setSubgroup(null);
      }
    }
  }, [isOpen, editScheduleId]);

  const filteredGroups = courseId
    ? allGroups.filter((g) => g.course_id === courseId)
    : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseId || !teacherId || !roomId || groupIds.length === 0) {
      setError("Заполните все обязательные поля");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const payload: ScheduleCreatePayload = {
        day,
        time_slot: timeSlot,
        subject,
        type,
        teacher_id: teacherId as number,
        room_id: roomId as number,
        course_id: courseId as number,
        group_ids: groupIds,
        subgroup: subgroup || null,
      };
      if (editScheduleId) {
        await updateSchedule(editScheduleId, payload);
      } else {
        await createSchedule(payload);
      }
      onSaved();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!editScheduleId) return;
    if (!confirm("Вы уверены, что хотите удалить это занятие?")) return;
    try {
      await deleteSchedule(editScheduleId);
      onSaved();
      onClose();
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-screen overflow-auto p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            {editScheduleId ? "Редактировать занятие" : "Добавить занятие"}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 rounded-xl mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                День недели
              </label>
              <select
                value={day}
                onChange={(e) => setDay(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 p-3"
              >
                {[
                  "Понедельник",
                  "Вторник",
                  "Среда",
                  "Четверг",
                  "Пятница",
                  "Суббота",
                ].map((name, idx) => (
                  <option key={idx} value={idx}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Пара (слот)
              </label>
              <select
                value={timeSlot}
                onChange={(e) => setTimeSlot(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 p-3"
              >
                {Array.from({ length: 8 }, (_, i) => i).map((slot) => (
                  <option key={slot} value={slot}>
                    {slot + 1} пара
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Предмет
            </label>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-3"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Тип занятия
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-3"
            >
              <option value="Лекция">Лекция</option>
              <option value="Практика">Практика</option>
              <option value="Лабораторная">Лабораторная</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Курс
              </label>
              <select
                value={courseId}
                onChange={(e) => {
                  setCourseId(Number(e.target.value));
                  setGroupIds([]); // Reset nhóm khi đổi khóa
                }}
                className="w-full rounded-xl border border-slate-200 p-3"
              >
                <option value="">— Выберите —</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Группы
              </label>
              {filteredGroups.length > 0 ? (
                <div className="max-h-32 overflow-y-auto border border-slate-200 rounded-xl p-2 space-y-1">
                  {filteredGroups.map((g) => (
                    <label
                      key={g.id}
                      className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-1 rounded"
                    >
                      <input
                        type="checkbox"
                        checked={groupIds.includes(g.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setGroupIds([...groupIds, g.id]);
                          } else {
                            setGroupIds(groupIds.filter((id) => id !== g.id));
                          }
                        }}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm">{g.name}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500 p-3 border border-dashed border-slate-200 rounded-xl">
                  Сначала выберите курс
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Преподаватель
              </label>
              <select
                value={teacherId}
                onChange={(e) => setTeacherId(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 p-3"
              >
                <option value="">— Выберите —</option>
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Аудитория
              </label>
              <select
                value={roomId}
                onChange={(e) => setRoomId(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 p-3"
              >
                <option value="">— Выберите —</option>
                {rooms.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Подгруппа (необязательно)
            </label>
            <select
              value={subgroup || ""}
              onChange={(e) => setSubgroup(e.target.value || null)}
              className="w-full rounded-xl border border-slate-200 p-3"
            >
              <option value="">Общая / Не указано</option>
              <option value="1 подгруппа">1 подгруппа</option>
              <option value="2 подгруппа">2 подгруппа</option>
            </select>
          </div>

          <div className="flex justify-between pt-4">
            {editScheduleId && (
              <button
                type="button"
                onClick={handleDelete}
                className="text-red-600 hover:underline"
              >
                Удалить
              </button>
            )}
            <div className="flex gap-2 ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-slate-200 rounded-xl"
              >
                Отмена
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? "Сохранение..." : "Сохранить"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
