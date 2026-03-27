import { Icon } from "../ui/Icon";
import { Home, Plus, Wallet, Edit, BarChart2, Users } from "lucide-react";
import { Tab } from "../../types";

interface FooterProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  isEditing: boolean;
  onEntryClick: () => void;
}

export const Footer = ({ activeTab, setActiveTab, isEditing, onEntryClick }: FooterProps) => {
  return (
    <nav className="fixed bottom-0 w-full max-w-md bg-white/90 backdrop-blur-xl border-t border-gray-100 flex justify-around p-3 pb-safe z-40">
      <button
        onClick={() => setActiveTab("dashboard")}
        className={`flex flex-col items-center p-2 transition-all ${
          activeTab === "dashboard" ? "text-indigo-600 scale-110" : "text-gray-400"
        }`}
      >
        <Icon
          icon={Home}
          size={20}
          className={activeTab === "dashboard" ? "fill-indigo-100" : ""}
        />
        <span className="text-[8px] font-black uppercase mt-1">Home</span>
      </button>
      
      <button
        onClick={() => setActiveTab("stats")}
        className={`flex flex-col items-center p-2 transition-all ${
          activeTab === "stats" ? "text-indigo-600 scale-110" : "text-gray-400"
        }`}
      >
        <Icon
          icon={BarChart2}
          size={20}
          className={activeTab === "stats" ? "fill-indigo-100" : ""}
        />
        <span className="text-[8px] font-black uppercase mt-1">Stats</span>
      </button>

      <button
        onClick={onEntryClick}
        className={`flex flex-col items-center p-2 transition-all ${
          activeTab === "add" ? "text-indigo-600" : "text-gray-400"
        }`}
      >
        <div
          className={`${
            activeTab === "add" ? "bg-indigo-100 text-indigo-600" : "bg-gray-50 text-gray-400"
          } p-2.5 rounded-full -mt-8 shadow-sm border border-gray-100 transition-colors`}
        >
          <Icon
            icon={isEditing ? Edit : Plus}
            size={24}
            className={activeTab === "add" ? "fill-indigo-100" : ""}
          />
        </div>
        <span className="text-[8px] font-black uppercase mt-1.5">
          {isEditing ? "Update" : "Entry"}
        </span>
      </button>

      <button
        onClick={() => setActiveTab("teachers")}
        className={`flex flex-col items-center p-2 transition-all ${
          activeTab === "teachers" ? "text-indigo-600 scale-110" : "text-gray-400"
        }`}
      >
        <Icon
          icon={Users}
          size={20}
          className={activeTab === "teachers" ? "fill-indigo-100" : ""}
        />
        <span className="text-[8px] font-black uppercase mt-1">Teachers</span>
      </button>

      <button
        onClick={() => setActiveTab("revenue")}
        className={`flex flex-col items-center p-2 transition-all ${
          activeTab === "revenue" ? "text-emerald-600 scale-110" : "text-gray-400"
        }`}
      >
        <Icon
          icon={Wallet}
          size={20}
          className={activeTab === "revenue" ? "fill-emerald-100" : ""}
        />
        <span className="text-[8px] font-black uppercase mt-1">Accounts</span>
      </button>
    </nav>
  );
};
