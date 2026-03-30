import { Icon } from "../ui/Icon";
import { Smartphone, LogOut, Moon, Sun, ClipboardList, Zap, Settings, User, ChevronDown } from "lucide-react";
import { User as FirebaseUser } from "firebase/auth";
import { Tab } from "../../types";

interface HeaderProps {
  user: FirebaseUser | null;
  onLogout: () => void;
  onInstall: () => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  setActiveTab: (tab: Tab) => void;
}

export const Header = ({ user, onLogout, onInstall, isDarkMode, toggleDarkMode, setActiveTab }: HeaderProps) => {
  return (
    <header className="glass sticky top-0 z-50 flex justify-between items-center p-4 pt-6 shadow-sm transition-all duration-500">
      <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab("dashboard")}>
        <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/20">
          <Icon icon={Zap} size={18} className="text-white fill-white" />
        </div>
        <h1 className="text-xl font-black text-slate-900 dark:text-white leading-none tracking-tighter uppercase">
          Teacher's <span className="text-emerald-500 font-light">CORNER</span>
        </h1>
      </div>
      <div className="flex items-center space-x-1.5">
        <button
          onClick={() => setActiveTab("requests")}
          className="w-10 h-10 rounded-xl bg-slate-100/50 dark:bg-slate-800/50 flex items-center justify-center hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all duration-300"
          title="Tuition Requests"
        >
          <Icon icon={ClipboardList} size={20} />
        </button>
        <button
          onClick={toggleDarkMode}
          className="w-10 h-10 rounded-xl bg-slate-100/50 dark:bg-slate-800/50 flex items-center justify-center hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all duration-300"
          title={isDarkMode ? "Light Mode" : "Dark Mode"}
        >
          <Icon icon={isDarkMode ? Sun : Moon} size={20} />
        </button>
        <button
          onClick={onInstall}
          className="w-10 h-10 rounded-xl bg-slate-100/50 dark:bg-slate-800/50 flex items-center justify-center hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all duration-300"
          title="Install App"
        >
          <Icon icon={Smartphone} size={20} />
        </button>
        <div className="group relative">
          <div className="bg-slate-900 dark:bg-white px-3 py-2 rounded-xl flex items-center text-[10px] font-black text-white dark:text-slate-900 cursor-pointer hover:opacity-90 transition-all shadow-lg shadow-slate-900/10 dark:shadow-white/5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-2 animate-pulse"></span>
            ADMIN
          </div>
          <div className="absolute right-0 mt-3 w-64 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 hidden group-hover:block overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="px-6 py-5 border-b border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest mb-1.5">
                লগ-ইন আছেন:
              </p>
              <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                {user?.email}
              </p>
            </div>
            <button
              onClick={onLogout}
              className="w-full text-left px-6 py-4 text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 font-black flex items-center transition-colors"
            >
              <Icon icon={LogOut} size={18} className="mr-3" /> লগ-আউট
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
