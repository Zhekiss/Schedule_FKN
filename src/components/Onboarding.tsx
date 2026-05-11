import { useState } from "react";
import { COURSES, GROUPS, SUBGROUPS } from "../data/constants";

interface OnboardingProps {
  onComplete: (data: {
    course: string;
    group: string;
    subgroup: string;
  }) => void;
  initialData?: { course: string; group: string; subgroup: string } | null;
  isSettingsMode?: boolean;
}

export default function Onboarding({
  onComplete,
  initialData,
  isSettingsMode = false,
}: OnboardingProps) {
  const [course, setCourse] = useState(initialData?.course || "");
  const [group, setGroup] = useState(initialData?.group || "");
  const [subgroup, setSubgroup] = useState(initialData?.subgroup || "");

  const handleComplete = () => {
    if (course && group && subgroup) {
      onComplete({ course, group, subgroup });
    }
  };

  const isFormValid = course !== "" && group !== "" && subgroup !== "";

  return (
    <div
      className={`max-w-md mx-auto animate-in fade-in zoom-in-95 duration-300 ${!isSettingsMode ? "pt-20" : ""}`}
    >
      <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100">
        {!isSettingsMode && (
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg shadow-blue-600/20 text-white font-bold text-2xl">
              УР
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Добро пожаловать
            </h1>
            <p className="text-slate-500 mt-2">
              Давайте настроим ваше расписание
            </p>
          </div>
        )}

        <div className="space-y-6">
          {/* Course */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              1. Выберите курс
            </label>
            <div className="grid grid-cols-2 gap-2">
              {COURSES.map((c) => (
                <button
                  key={c}
                  onClick={() => {
                    setCourse(c);
                    setGroup("");
                  }}
                  className={`py-3 px-4 rounded-xl text-sm font-medium transition-all ${
                    course === c
                      ? "bg-blue-50 text-blue-700 ring-2 ring-blue-600 ring-inset"
                      : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Group */}
          <div
            className={`transition-opacity duration-300 ${!course ? "opacity-50 pointer-events-none" : ""}`}
          >
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              2. Укажите группу
            </label>
            <select
              value={group}
              onChange={(e) => setGroup(e.target.value)}
              disabled={!course}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none transition-all disabled:opacity-50"
            >
              <option value="" disabled>
                -- Выберите --
              </option>
              {course &&
                GROUPS[course]?.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
            </select>
          </div>

          {/* Subgroup */}
          <div
            className={`transition-opacity duration-300 ${!group ? "opacity-50 pointer-events-none" : ""}`}
          >
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              3. Ваша подгруппа
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {SUBGROUPS.map((sg) => (
                <button
                  key={sg}
                  disabled={!group}
                  onClick={() => setSubgroup(sg)}
                  className={`py-3 px-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                    subgroup === sg
                      ? "bg-blue-50 text-blue-700 ring-2 ring-blue-600 ring-inset"
                      : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {sg}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 mt-6">
            <button
              onClick={handleComplete}
              disabled={!isFormValid}
              className="w-full bg-slate-900 text-white font-medium py-3.5 rounded-xl hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md active:scale-[0.98]"
            >
              {isSettingsMode ? "Сохранить изменения" : "Продолжить"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
