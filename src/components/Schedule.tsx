import { Clock, MapPin, UserSquare2, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { DAYS, MOCK_SCHEDULE, ScheduleItem, TIME_SLOTS } from "../data/mock";

interface ScheduleProps {
  course: string;
  group: string;
  subgroup?: string;
}

export default function Schedule({ course, group, subgroup }: ScheduleProps) {
  const [selectedDay, setSelectedDay] = useState(() => {
    // Default to current day, or Monday if Sunday
    const today = new Date().getDay();
    return today === 0 ? 0 : today - 1; // 0 for Monday, 5 for Saturday
  });

  const scheduleForGroup = useMemo(() => {
    return MOCK_SCHEDULE.filter((item) => {
      // Must match course and have the group in its groups array
      if (item.course !== course) return false;
      if (!item.groups.includes(group)) return false;
      
      // If item has a subgroup, check if it matches the user's subgroup (or if user is 'Общая', maybe show all? Usually students only attend 'Общая' + their '1 подгруппа')
      if (item.subgroup && subgroup && subgroup !== "Общая") {
        if (item.subgroup !== subgroup) return false;
      }
      return true;
    }).sort((a, b) => {
      if (a.day !== b.day) return a.day - b.day;
      return a.timeSlot - b.timeSlot;
    });
  }, [course, group, subgroup]);

  const todaysSchedule = useMemo(() => {
    return scheduleForGroup.filter((item) => item.day === selectedDay);
  }, [scheduleForGroup, selectedDay]);

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Лекция":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "Практика":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "Лабораторная":
        return "bg-purple-50 text-purple-700 border-purple-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="max-w-3xl mx-auto pb-24 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Расписание
        </h1>
        <p className="text-slate-500 mt-1 flex items-center gap-2">
          {course} • {group} {subgroup && subgroup !== "Общая" && `• ${subgroup}`}
        </p>
      </header>

      {/* Day Selector - Horizontal Scroll on Mobile */}
      <div className="-mx-4 px-4 sm:mx-0 sm:px-0 mb-6 overflow-x-auto pb-2 scrollbar-none">
        <div className="flex gap-2 w-max sm:w-full">
          {DAYS.map((day, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedDay(idx)}
              className={`px-4 py-2.5 rounded-full text-sm font-medium transition-all cursor-pointer whitespace-nowrap
                ${
                  selectedDay === idx
                    ? "bg-slate-900 text-white shadow-md"
                    : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                }
              `}
            >
              {day}
            </button>
          ))}
        </div>
      </div>

      {/* Schedule List */}
      <div className="space-y-4">
        {todaysSchedule.length > 0 ? (
          todaysSchedule.map((item) => (
            <div
              key={item.id}
              className="bg-white border text-left border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group"
            >
              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-slate-200 group-hover:bg-blue-400 transition-colors" />
              
              <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                {/* Time Badge */}
                <div className="min-w-[120px] shrink-0">
                  <div className="text-lg font-bold text-slate-900 tracking-tight">
                    {TIME_SLOTS[item.timeSlot].split(' - ')[0]}
                  </div>
                  <div className="text-sm text-slate-500 flex items-center gap-1.5 mt-0.5">
                    <Clock className="w-3.5 h-3.5" />
                    {TIME_SLOTS[item.timeSlot]}
                  </div>
                  <div className="text-xs font-semibold text-slate-400 mt-1">
                    {item.timeSlot + 1} пара
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-md border ${getTypeColor(
                        item.type
                      )}`}
                    >
                      {item.type}
                    </span>
                    {item.groups.length > 1 && (
                      <span className="text-xs font-medium px-2.5 py-1 rounded-md bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" />
                        Поток ({item.groups.length} групп)
                      </span>
                    )}
                    {item.subgroup && (
                      <span className="text-xs font-medium px-2.5 py-1 rounded-md bg-rose-50 text-rose-700 border border-rose-200">
                        {item.subgroup}
                      </span>
                    )}
                  </div>
                  
                  <h3 className="text-lg font-semibold text-slate-900 leading-tight mb-3">
                    {item.subject}
                  </h3>
                  
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <UserSquare2 className="w-4 h-4 text-slate-400" />
                      <span>{item.teacher}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      <span>{item.room}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-16 bg-slate-50 rounded-2xl border border-slate-200 border-dashed">
            <h3 className="text-lg font-medium text-slate-600 mb-2">Окон нет! Пар тоже.</h3>
            <p className="text-slate-500">В этот день занятий не найдено.</p>
          </div>
        )}
      </div>
    </div>
  );
}
