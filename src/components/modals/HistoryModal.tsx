import { Icon } from "../ui/Icon";
import { X, History, Clock } from "lucide-react";
import { useStore } from "../../store/useStore";

export const HistoryModal = () => {
  const { historyModalData, setHistoryModalData } = useStore();

  if (!historyModalData) return null;

  const { title, history } = historyModalData;

  return (
    <div
      className="fixed inset-0 bg-black/60 z-[100] flex items-end justify-center backdrop-blur-sm"
      onClick={() => setHistoryModalData(null)}
    >
      <div
        className="bg-white rounded-t-[40px] p-6 w-full max-w-md max-h-[80vh] overflow-y-auto no-scrollbar animate-in slide-in-from-bottom-full duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
          <h3 className="text-lg font-black text-gray-800 flex items-center">
            <Icon icon={History} size={20} className="mr-2 text-indigo-500" />{" "}
            {title}
          </h3>
          <button
            onClick={() => setHistoryModalData(null)}
            className="w-8 h-8 bg-gray-100 text-gray-500 rounded-full flex items-center justify-center active:scale-90"
          >
            <Icon icon={X} size={16} />
          </button>
        </div>
        <div className="space-y-4">
          {history.map((h, i) => (
            <div
              key={i}
              className="bg-gray-50 p-4 rounded-2xl border border-gray-100 relative pl-10"
            >
              <div className="absolute left-4 top-5 w-2 h-2 bg-indigo-400 rounded-full ring-4 ring-indigo-50"></div>
              <p className="text-xs font-bold text-gray-700 leading-relaxed">
                {h.log}
              </p>
              <p className="text-[9px] text-gray-400 mt-1.5 font-black uppercase flex items-center">
                <Icon icon={Clock} size={10} className="mr-1" />{" "}
                {new Date(h.date).toLocaleString()}
              </p>
            </div>
          ))}
          {history.length === 0 && (
            <p className="text-center text-gray-400 py-10 font-bold text-sm">
              কোনো রেকর্ড পাওয়া যায়নি।
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
