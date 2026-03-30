import { Icon } from "../ui/Icon";
import { Home, Plus, Wallet, Edit, BarChart2, Users, ClipboardList, UserCheck } from "lucide-react";
import { Tab } from "../../types";

interface FooterProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  isEditing: boolean;
  onEntryClick: () => void;
}

export const Footer = ({ activeTab, setActiveTab, isEditing, onEntryClick }: FooterProps) => {
  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: "dashboard", label: "Home", icon: Home },
    { id: "stats", label: "Stats", icon: BarChart2 },
    { id: "add", label: isEditing ? "Update" : "Entry", icon: isEditing ? Edit : Plus },
    { id: "teachers", label: "Teachers", icon: Users },
    { id: "revenue", label: "Accounts", icon: Wallet },
  ];

  return (
    <nav className="glass fixed bottom-0 left-0 right-0 z-50 px-4 pb-safe pt-2 shadow-[0_-8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_-8px_30px_rgb(0,0,0,0.2)] transition-all duration-500">
      <div className="max-w-md mx-auto flex justify-between items-center">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const isSpecial = tab.id === "add";
          
          return (
            <button
              key={tab.id}
              onClick={isSpecial ? onEntryClick : () => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center py-2 px-3 rounded-2xl transition-all duration-300 group relative ${
                isActive 
                  ? "text-emerald-600 dark:text-emerald-400" 
                  : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
              }`}
            >
              {isSpecial ? (
                <div className={`p-3 rounded-full -mt-10 shadow-xl transition-all duration-300 border-4 border-background ${
                  isActive 
                    ? "bg-emerald-500 text-white scale-110 rotate-90" 
                    : "bg-slate-900 dark:bg-white text-white dark:text-slate-900 group-hover:scale-105"
                }`}>
                  <Icon icon={tab.icon} size={24} />
                </div>
              ) : (
                <div className={`p-1 rounded-xl transition-all duration-300 ${
                  isActive ? "scale-110" : "group-hover:scale-110"
                }`}>
                  <Icon icon={tab.icon} size={20} />
                </div>
              )}
              <span className={`text-[9px] font-black uppercase tracking-widest mt-1 transition-all duration-300 ${
                isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0"
              }`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
