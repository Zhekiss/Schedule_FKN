import { useEffect, useState } from "react";
import { Settings, CalendarDays, Search } from "lucide-react";
import Onboarding from "./components/Onboarding";
import Schedule from "./components/Schedule";
import EmptyRooms from "./components/EmptyRooms";

type ViewState = "schedule" | "rooms" | "settings";

interface UserData {
  course: string;
  group: string;
  subgroup: string;
}

export default function App() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [view, setView] = useState<ViewState>("schedule");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Load from LocalStorage
    const saved = localStorage.getItem("scheduleUser");
    if (saved) {
      try {
        setUserData(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse settings");
      }
    }
    setIsLoaded(true);
  }, []);

  const handleSaveData = (data: UserData) => {
    setUserData(data);
    localStorage.setItem("scheduleUser", JSON.stringify(data));
    setView("schedule");
  };

  if (!isLoaded) return null;

  if (!userData) {
    return (
      <div className="min-h-screen bg-slate-50 p-4">
        <Onboarding onComplete={handleSaveData} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Navbar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-10 px-4 py-3 sm:px-6 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView("schedule")}>
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold shadow-sm">
            УР
          </div>
          <span className="font-semibold text-slate-900 tracking-tight hidden sm:block">
            Расписание Факультета
          </span>
        </div>

        {/* Desktop Tabs */}
        <div className="hidden sm:flex bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setView("schedule")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              view === "schedule" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <CalendarDays className="w-4 h-4" />
            Расписание
          </button>
          <button
            onClick={() => setView("rooms")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              view === "rooms" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Search className="w-4 h-4" />
            Аудитории
          </button>
        </div>

        <div>
          <button
            onClick={() => setView("settings")}
            className="p-2 sm:px-4 sm:py-2 text-slate-500 hover:bg-slate-100 rounded-xl transition-colors sm:bg-slate-50 sm:border sm:border-slate-200"
            title="Настройки"
          >
            <Settings className="w-5 h-5 sm:hidden" />
            <span className="hidden sm:block text-sm font-medium text-slate-700">Настройки</span>
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        {view === "schedule" && (
          <Schedule
            course={userData.course}
            group={userData.group}
            subgroup={userData.subgroup}
          />
        )}
        {view === "rooms" && <EmptyRooms />}
        {view === "settings" && (
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 mb-6">Настройки</h2>
            <Onboarding
              onComplete={handleSaveData}
              initialData={userData}
              isSettingsMode={true}
            />
          </div>
        )}
      </main>

      {/* Mobile Bottom Navigation (Visible only on small screens) */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-4 py-2 flex justify-around pb-safe">
        <button
          onClick={() => setView("schedule")}
          className={`flex flex-col items-center p-2 rounded-xl min-w-[64px] transition-colors ${
            view === "schedule" ? "text-blue-600" : "text-slate-500"
          }`}
        >
          <CalendarDays className={`w-6 h-6 mb-1 ${view === "schedule" ? "fill-blue-50" : ""}`} />
          <span className="text-[10px] font-medium">Моё</span>
        </button>
        <button
          onClick={() => setView("rooms")}
          className={`flex flex-col items-center p-2 rounded-xl min-w-[64px] transition-colors ${
            view === "rooms" ? "text-blue-600" : "text-slate-500"
          }`}
        >
          <Search className={`w-6 h-6 mb-1 ${view === "rooms" ? "stroke-[2.5px]" : ""}`} />
          <span className="text-[10px] font-medium">Поиск</span>
        </button>
        <button
          onClick={() => setView("settings")}
          className={`flex flex-col items-center p-2 rounded-xl min-w-[64px] transition-colors gap-0.5 ${
            view === "settings" ? "text-blue-600" : "text-slate-500"
          }`}
        >
          <Settings className={`w-6 h-6 mb-1 ${view === "settings" ? "mr-rotate-90 fill-blue-50 duration-300" : ""}`} />
          <span className="text-[10px] font-medium">Опции</span>
        </button>
      </div>
    </div>
  );
}

