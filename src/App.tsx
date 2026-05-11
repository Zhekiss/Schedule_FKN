import { useEffect, useState } from "react";
import { Settings, CalendarDays, Search, Shield } from "lucide-react";
import Onboarding from "./components/Onboarding";
import Schedule from "./components/Schedule";
import EmptyRooms from "./components/EmptyRooms";
import LoginModal from "./components/LoginModal";

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

  // State quản lý Admin Auth
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("scheduleUser");
    if (saved) {
      try {
        setUserData(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse settings");
      }
    }
    // Tạm thời lưu trạng thái admin vào localStorage cho tiện test
    if (localStorage.getItem("isAdmin") === "true") {
      setIsAdmin(true);
    }
    setIsLoaded(true);
  }, []);

  const handleSaveData = (data: UserData) => {
    setUserData(data);
    localStorage.setItem("scheduleUser", JSON.stringify(data));
    setView("schedule");
  };

  const handleLoginSuccess = () => {
    setIsAdmin(true);
    localStorage.setItem("isAdmin", "true");
  };

  const handleLogout = () => {
    setIsAdmin(false);
    localStorage.removeItem("isAdmin");
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
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-10 px-4 py-3 sm:px-6 flex items-center justify-between shadow-sm">
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => setView("schedule")}
        >
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold shadow-sm">
            УР
          </div>
          <span className="font-semibold text-slate-900 tracking-tight hidden sm:block">
            Расписание Факультета
          </span>
        </div>

        <div className="hidden sm:flex bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setView("schedule")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              view === "schedule"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <CalendarDays className="w-4 h-4" />
            Расписание
          </button>
          <button
            onClick={() => setView("rooms")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              view === "rooms"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Search className="w-4 h-4" />
            Аудитории
          </button>
        </div>

        {/* Nút Admin và Settings */}
        <div className="flex items-center gap-2">
          {isAdmin ? (
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 sm:px-4 sm:py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-sm font-medium hover:bg-emerald-100 transition-colors flex items-center gap-2"
              title="Выйти"
            >
              <Shield className="w-4 h-4" />
              <span className="hidden sm:block">Admin Active</span>
            </button>
          ) : (
            <button
              onClick={() => setShowLoginModal(true)}
              className="p-2 sm:px-4 sm:py-2 text-slate-500 hover:bg-slate-100 rounded-xl transition-colors sm:bg-slate-50 sm:border sm:border-slate-200"
              title="Админ"
            >
              <Shield className="w-5 h-5 sm:hidden" />
              <span className="hidden sm:block text-sm font-medium text-slate-700">
                Админ
              </span>
            </button>
          )}

          <button
            onClick={() => setView("settings")}
            className="p-2 sm:px-4 sm:py-2 text-slate-500 hover:bg-slate-100 rounded-xl transition-colors sm:bg-slate-50 sm:border sm:border-slate-200"
            title="Настройки"
          >
            <Settings className="w-5 h-5 sm:hidden" />
            <span className="hidden sm:block text-sm font-medium text-slate-700">
              Настройки
            </span>
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
            // Sau này bạn có thể truyền thêm prop isAdmin={isAdmin} vào đây để hiện nút Edit
          />
        )}
        {view === "rooms" && <EmptyRooms />}
        {view === "settings" && (
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 mb-6">
              Настройки
            </h2>
            <Onboarding
              onComplete={handleSaveData}
              initialData={userData}
              isSettingsMode={true}
            />
          </div>
        )}
      </main>

      {/* Mobile Bottom Navigation - Cập nhật thêm icon nếu muốn, nhưng để giữ nguyên UI 3 nút cân đối thì hiện tại thế này là ổn */}
      {/* ... (Giữ nguyên phần Mobile Bottom Navigation của bạn) ... */}

      {/* Thêm Modal vào cuối cùng */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
}
