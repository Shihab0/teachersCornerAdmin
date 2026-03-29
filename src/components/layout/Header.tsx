import { Icon } from "../ui/Icon";
import { Smartphone, LogOut, Moon, Sun } from "lucide-react";
import { User as FirebaseUser } from "firebase/auth";

interface HeaderProps {
  user: FirebaseUser | null;
  onLogout: () => void;
  onInstall: () => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

export const Header = ({ user, onLogout, onInstall, isDarkMode, toggleDarkMode }: HeaderProps) => {
  return (
    <header className="bg-indigo-900 dark:bg-slate-950 text-white p-4 pt-6 sticky top-0 z-50 flex justify-between items-center shadow-md transition-colors duration-300">
      <div>
        <h1 className="text-xl font-black text-yellow-400 leading-none">
          Teacher's <span className="text-white font-light">CORNER</span>
        </h1>
      </div>
      <div className="flex items-center space-x-3">
        <button
          onClick={toggleDarkMode}
          className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
          title={isDarkMode ? "Light Mode" : "Dark Mode"}
        >
          <Icon icon={isDarkMode ? Sun : Moon} size={16} />
        </button>
        <button
          onClick={onInstall}
          className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
          title="Install App"
        >
          <Icon icon={Smartphone} size={16} />
        </button>
        <div className="group relative">
          <div className="bg-indigo-800 px-3 py-1.5 rounded-full flex items-center text-[10px] font-bold border border-indigo-700 cursor-pointer">
            <span className="w-2 h-2 rounded-full bg-green-400 mr-1.5 animate-pulse"></span>{" "}
            Admin
          </div>
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 hidden group-hover:block overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-50">
              <p className="text-[10px] text-gray-500 font-bold mb-1">
                লগ-ইন আছেন:
              </p>
              <p className="text-xs font-black text-gray-800 truncate">
                {user?.email}
              </p>
            </div>
            <button
              onClick={onLogout}
              className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 font-bold flex items-center transition"
            >
              <Icon icon={LogOut} size={16} className="mr-2" /> লগ-আউট
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
