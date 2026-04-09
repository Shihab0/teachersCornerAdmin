import { useState, useRef, useEffect } from "react";
import { Icon } from "../ui/Icon";
import { Smartphone, LogOut, Moon, Sun, ClipboardList, GraduationCap, ChevronDown, RotateCcw } from "lucide-react";
import { useStore } from "../../store/useStore";
import { cn } from "../../lib/utils";

interface HeaderProps {
  onLogout: () => void;
  onInstall: () => void;
}

export const Header = ({ onLogout, onInstall }: HeaderProps) => {
  const { user, isDarkMode, toggleDarkMode, setActiveTab } = useStore();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="glass sticky top-0 z-50 flex justify-between items-center p-4 pt-6 shadow-sm transition-all duration-500">
      <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab("dashboard")}>
        <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20 rotate-3 hover:rotate-0 transition-transform duration-300">
          <Icon icon={GraduationCap} size={22} className="text-white" />
        </div>
        <div className="flex flex-col">
          <h1 className="text-lg font-black text-slate-900 dark:text-white leading-none tracking-wide uppercase [word-spacing:0.1em]">
            Teacher's
          </h1>
          <span className="text-emerald-500 font-black text-[10px] tracking-[0.2em] uppercase leading-none mt-0.5">CORNER</span>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <button
          onClick={() => setActiveTab("admin_requests")}
          className="w-10 h-10 rounded-xl bg-slate-100/50 dark:bg-slate-800/50 flex items-center justify-center hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all duration-300"
          title="Tuition Requests"
        >
          <Icon icon={ClipboardList} size={20} />
        </button>
        <button
          onClick={toggleDarkMode}
          className="w-10 h-10 rounded-xl bg-slate-100/50 dark:bg-slate-800/50 flex items-center justify-center hover:bg-amber-50 dark:hover:bg-amber-900/20 text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 transition-all duration-300"
          title={isDarkMode ? "Light Mode" : "Dark Mode"}
        >
          <Icon icon={isDarkMode ? Sun : Moon} size={20} />
        </button>
        <div className="relative" ref={dropdownRef}>
          <div 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="bg-slate-900 dark:bg-white px-3 py-2 rounded-xl flex items-center text-[10px] font-black text-white dark:text-slate-900 cursor-pointer hover:opacity-90 transition-all shadow-lg shadow-slate-900/10 dark:shadow-white/5"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-2 animate-pulse"></span>
            ADMIN
            <ChevronDown size={12} className={cn("ml-1.5 transition-transform duration-300", isDropdownOpen && "rotate-180")} />
          </div>
          {isDropdownOpen && (
            <div className="absolute right-0 mt-3 w-64 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300 z-[60]">
              <div className="px-6 py-5 border-b border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest mb-1.5">
                  লগ-ইন আছেন:
                </p>
                <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                  {user?.email}
                </p>
              </div>
              <button
                onClick={() => { onInstall(); setIsDropdownOpen(false); }}
                className="w-full text-left px-6 py-4 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 font-bold flex items-center transition-colors"
              >
                <Icon icon={Smartphone} size={18} className="mr-3" /> অ্যাপ ইনস্টল করুন
              </button>
              <button
                onClick={() => { onLogout(); setIsDropdownOpen(false); }}
                className="w-full text-left px-6 py-4 text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 font-black flex items-center transition-colors"
              >
                <Icon icon={LogOut} size={18} className="mr-3" /> লগ-আউট
              </button>
            </div>
          )}
        </div>
      </div>
    </header>

  );
};
