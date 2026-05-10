import { MapPin, Search } from "lucide-react";
import { useState, useMemo } from "react";
import { ROOMS, MOCK_SCHEDULE, DAYS, TIME_SLOTS } from "../data/mock";

export default function EmptyRooms() {
  const [selectedDay, setSelectedDay] = useState(0);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(0);

  // Find busy rooms for the selected time and day
  const emptyRooms = useMemo(() => {
    const busyRooms = new Set(
      MOCK_SCHEDULE.filter(
        (item) => item.day === selectedDay && item.timeSlot === selectedTimeSlot
      ).map((item) => item.room)
    );

    return ROOMS.filter((room) => !busyRooms.has(room));
  }, [selectedDay, selectedTimeSlot]);

  return (
    <div className="max-w-3xl mx-auto pb-24 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-6">
        <div className="p-6">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900 flex items-center gap-2 mb-6">
            <Search className="w-6 h-6 text-blue-500" />
            Свободные аудитории
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                День недели
              </label>
              <select
                value={selectedDay}
                onChange={(e) => setSelectedDay(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              >
                {DAYS.map((day, idx) => (
                  <option key={idx} value={idx}>
                    {day}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Время (Пара)
              </label>
              <select
                value={selectedTimeSlot}
                onChange={(e) => setSelectedTimeSlot(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              >
                {TIME_SLOTS.map((slot, idx) => (
                  <option key={idx} value={idx}>
                    {idx + 1} пара ({slot})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <h3 className="text-lg font-medium text-slate-800">
          Свободно сейчас ({emptyRooms.length}):
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {emptyRooms.length > 0 ? (
          emptyRooms.map((room) => (
            <div
              key={room}
              className="bg-white border border-slate-100 shadow-sm rounded-xl p-4 flex items-center justify-between hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-50 text-green-600 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <span className="font-medium text-slate-900">{room}</span>
              </div>
              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                Свободно
              </span>
            </div>
          ))
        ) : (
          <div className="col-span-full py-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-100">
            <Search className="w-12 h-12 text-slate-200 mx-auto mb-3" />
            <p>Нет свободных аудиторий в это время</p>
          </div>
        )}
      </div>
    </div>
  );
}
