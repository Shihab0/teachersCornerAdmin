import { useState, useMemo } from "react";
import { Icon } from "../ui/Icon";
import {
  Search,
  Filter,
  DollarSign,
  Download,
  AlertTriangle,
  Phone,
  Users,
  BarChart,
  Hash,
  ChevronDown,
  User,
  History,
  Edit,
  Trash2,
  Undo,
  Clock,
} from "lucide-react";
import { Deal, HistoryEntry } from "../../types";
import { cn } from "../../lib/utils";

interface DashboardProps {
  deals: Deal[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  filterTuitionStatus: string;
  setFilterTuitionStatus: (s: string) => void;
  filterCommissionStatus: string;
  setFilterCommissionStatus: (s: string) => void;
  exportToCSV: () => void;
  onEdit: (deal: Deal) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: string) => void;
  onHistoryClick: (data: { title: string; history: HistoryEntry[] }) => void;
  onCommissionClick: (deal: Deal) => void;
  onUndoPayment: (deal: Deal) => void;
  onResetDemo: () => void;
}

export const Dashboard = ({
  deals,
  searchQuery,
  setSearchQuery,
  filterTuitionStatus,
  setFilterTuitionStatus,
  filterCommissionStatus,
  setFilterCommissionStatus,
  exportToCSV,
  onEdit,
  onDelete,
  onStatusChange,
  onHistoryClick,
  onCommissionClick,
  onUndoPayment,
  onResetDemo,
}: DashboardProps) => {
  const [visibleCount, setVisibleCount] = useState(20);
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);

  const tutorCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    deals.forEach((d) => {
      if (d.tutorPhone) counts[d.tutorPhone] = (counts[d.tutorPhone] || 0) + 1;
    });
    return counts;
  }, [deals]);

  const filteredDeals = deals.filter((d) => {
    const s = searchQuery.toLowerCase();
    const matchSearch =
      (d.tutorName || "").toLowerCase().includes(s) ||
      (d.tuitionId || "").toLowerCase().includes(s) ||
      (d.studentClass || "").toLowerCase().includes(s);
    const matchStatus =
      filterTuitionStatus === "All" || d.tuitionStatus === filterTuitionStatus;
    const matchComm =
      filterCommissionStatus === "All" || d.commissionStatus === filterCommissionStatus;
    return matchSearch && matchStatus && matchComm;
  });

  const notifications = useMemo(() => {
    const today = new Date();
    return deals.filter((d) => {
      if (
        d.commissionStatus !== "Pending" ||
        ["Rejected", "Cancelled"].includes(d.tuitionStatus)
      )
        return false;
      const selDate = new Date(d.selectionDate);
      const diffTime = Math.abs(today.getTime() - selDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays >= 3;
    });
  }, [deals]);

  const getProgress = (deal: Deal) => {
    const start = new Date(deal.confirmDate || deal.selectionDate);
    const today = new Date();
    const diffTime = Math.max(0, today.getTime() - start.getTime());
    const days = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const percent = Math.min(100, (days / 30) * 100);
    return { days, percent };
  };

  const getTuitionStatusColor = (status: string) => {
    switch (status) {
      case "Processing":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "Running":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "Confirmed":
        return "bg-indigo-100 text-indigo-700 border-indigo-200";
      case "Rejected":
        return "bg-red-100 text-red-700 border-red-200";
      case "Cancelled":
        return "bg-gray-200 text-gray-700 border-gray-300";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getCommissionStatusColor = (status: string) => {
    switch (status) {
      case "Paid":
        return "bg-green-100 text-green-700";
      case "Pending":
        return "bg-orange-100 text-orange-700";
      case "Free":
        return "bg-blue-100 text-blue-700";
      case "Rejected":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="space-y-4 fade-in">
      <div className="relative group">
        <Icon icon={Search} size={18} className="absolute left-4 top-3.5 text-indigo-400" />
        <input
          type="text"
          placeholder="আইডি, টিউটর বা ক্লাস খুঁজুন..."
          className="w-full pl-11 pr-4 py-3.5 bg-white rounded-2xl shadow-sm border border-gray-100 focus:ring-2 focus:ring-indigo-500 text-sm font-medium outline-none"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="flex space-x-2 overflow-x-auto pb-1 no-scrollbar">
        <div className="bg-white border border-gray-100 rounded-xl flex items-center shadow-sm px-2">
          <Icon icon={Filter} size={14} className="text-indigo-400 ml-1 shrink-0" />
          <select
            className="bg-transparent border-none text-[10px] font-bold px-2 py-2.5 focus:outline-none"
            value={filterTuitionStatus}
            onChange={(e) => setFilterTuitionStatus(e.target.value)}
          >
            <option value="All">সব স্ট্যাটাস</option>
            <option value="Processing">Processing</option>
            <option value="Running">Running</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Rejected">Rejected</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl flex items-center shadow-sm px-2">
          <Icon icon={DollarSign} size={14} className="text-emerald-500 ml-1 shrink-0" />
          <select
            className="bg-transparent border-none text-[10px] font-bold px-2 py-2.5 focus:outline-none"
            value={filterCommissionStatus}
            onChange={(e) => setFilterCommissionStatus(e.target.value)}
          >
            <option value="All">সব কমিশন</option>
            <option value="Pending">Pending</option>
            <option value="Paid">Paid</option>
            <option value="Free">Free</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
        <button
          onClick={exportToCSV}
          className="bg-gray-800 text-white px-3 py-2 rounded-xl text-[10px] font-bold flex items-center shadow-sm active:scale-95 shrink-0"
        >
          <Icon icon={Download} size={14} className="mr-1" /> ব্যাকআপ
        </button>
      </div>

      {notifications.length > 0 && !searchQuery && filterTuitionStatus === "All" && filterCommissionStatus === "All" && (
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-orange-500"></div>
          <h3 className="text-orange-800 font-black flex items-center mb-3 text-sm">
            <Icon icon={AlertTriangle} size={18} className="mr-2" /> ৩ দিন ওভার! (Pending)
          </h3>
          <div className="space-y-3">
            {notifications.map((n) => (
              <div key={n.id} className="bg-white p-3 rounded-xl shadow-sm border border-orange-100">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-bold text-gray-800 text-sm flex items-center">
                      {n.tutorName}{" "}
                      <span className="ml-2 text-[10px] bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded">
                        {n.tuitionId}
                      </span>
                    </p>
                  </div>
                  <span className="text-orange-600 font-black text-sm">৳ {n.commission}</span>
                </div>
                <div className="flex space-x-2">
                  {n.tutorPhone && (
                    <a
                      href={`tel:${n.tutorPhone}`}
                      className="inline-flex items-center px-2 py-1 bg-blue-50 text-blue-700 rounded-lg text-[10px] font-bold border border-blue-100"
                    >
                      <Icon icon={Phone} size={10} className="mr-1" /> টিউটর
                    </a>
                  )}
                  <a
                    href={`tel:${n.guardianPhone}`}
                    className="inline-flex items-center px-2 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-[10px] font-bold border border-emerald-100"
                  >
                    <Icon icon={Phone} size={10} className="mr-1" /> অভিভাবক
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <div className="flex justify-between items-center mb-3 px-1">
          <h3 className="text-sm font-black text-gray-800 flex items-center">
            <Icon icon={Users} size={16} className="mr-2 text-indigo-500" /> টিউশন ম্যানেজমেন্ট
          </h3>
          <span className="text-[10px] font-bold bg-gray-200 text-gray-600 px-2 py-0.5 rounded-md">
            {filteredDeals.length} রেকর্ড
          </span>
        </div>

        <div className="space-y-3">
          {filteredDeals.slice(0, visibleCount).map((deal) => (
            <div
              key={deal.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-300"
            >
              <div
                onClick={() => setExpandedCardId(expandedCardId === deal.id ? null : deal.id)}
                className="p-4 cursor-pointer select-none flex justify-between items-start"
              >
                <div className="flex-1 pr-2">
                  <p className="font-bold text-gray-800 text-sm mb-1.5 flex items-center">
                    {deal.tutorName}
                    {deal.tutorName !== "এখনো সিলেক্ট হয়নি" && tutorCounts[deal.tutorPhone] > 1 && (
                      <span className="inline-flex items-center ml-2 bg-indigo-50 text-indigo-700 text-[9px] px-1.5 py-0.5 rounded-full font-black border border-indigo-100">
                        <Icon icon={BarChart} size={10} className="mr-0.5" /> {tutorCounts[deal.tutorPhone]}
                      </span>
                    )}
                  </p>
                  <div className="flex items-center flex-wrap gap-1.5">
                    <span className="text-[10px] bg-gray-50 text-gray-600 font-bold px-2 py-0.5 rounded flex items-center border border-gray-200 uppercase">
                      <Icon icon={Hash} size={10} className="mr-0.5" /> {deal.tuitionId || "N/A"}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 uppercase">
                      {deal.studentClass}
                    </span>
                  </div>
                </div>

                <div className="text-right flex flex-col items-end">
                  <div className="font-black text-gray-800 text-base leading-none mb-2">৳ {deal.commission}</div>
                  <div className="flex items-center space-x-1.5 mb-1.5">
                    <span
                      className={cn("w-2.5 h-2.5 rounded-full", getTuitionStatusColor(deal.tuitionStatus).split(" ")[0])}
                      title={deal.tuitionStatus}
                    ></span>
                    <span
                      className={cn(
                        "text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center",
                        getCommissionStatusColor(deal.commissionStatus)
                      )}
                    >
                      {deal.commissionStatus}
                    </span>
                  </div>
                  <Icon
                    icon={ChevronDown}
                    size={16}
                    className={cn("text-gray-400 transition-transform duration-300", expandedCardId === deal.id && "rotate-180")}
                  />
                </div>
              </div>

              {expandedCardId === deal.id && (
                <div className="px-4 pb-4 animate-in slide-in-from-top-2 fade-in duration-200">
                  <div className="pt-3 border-t border-gray-50">
                    <div className="flex flex-wrap gap-2 mb-3">
                      {deal.tutorPhone && (
                        <a
                          href={`tel:${deal.tutorPhone}`}
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center px-3 py-1.5 bg-blue-50 text-blue-700 rounded-xl text-[11px] font-bold shadow-sm active:bg-blue-100"
                        >
                          <Icon icon={Phone} size={12} className="mr-1.5" /> টিউটর
                        </a>
                      )}
                      <a
                        href={`tel:${deal.guardianPhone}`}
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-xl text-[11px] font-bold shadow-sm active:bg-emerald-100"
                      >
                        <Icon icon={Phone} size={12} className="mr-1.5" /> অভিভাবক
                      </a>
                      {deal.referrerName && (
                        <span className="inline-flex items-center px-3 py-1.5 bg-gray-50 text-gray-600 rounded-xl text-[11px] font-bold border border-gray-200">
                          <Icon icon={User} size={12} className="mr-1.5" /> রেফ: {deal.referrerName}
                        </span>
                      )}
                    </div>

                    <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100 mb-3">
                      <div className="flex justify-between items-center mb-2">
                        <select
                          value={deal.tuitionStatus}
                          onChange={(e) => onStatusChange(deal.id, e.target.value)}
                          className={cn(
                            "text-[10px] font-bold px-2 py-1 rounded border appearance-none outline-none",
                            getTuitionStatusColor(deal.tuitionStatus)
                          )}
                        >
                          <option value="Processing">Processing</option>
                          <option value="Running">Running</option>
                          <option value="Confirmed">Confirmed</option>
                          <option value="Rejected">Rejected</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                        <span className="font-bold bg-white px-2 py-0.5 rounded border border-gray-200 text-[10px] text-gray-600 shadow-sm">
                          ম্যানেজমেন্ট: {deal.adminName}
                        </span>
                      </div>

                      <div className="flex justify-between text-[9px] font-bold text-gray-500 mb-1">
                        <span>টিউশন ডিউরেশন (১ মাস)</span>
                        <span className={cn(getProgress(deal).days >= 30 ? "text-emerald-600" : "text-indigo-600")}>
                          {getProgress(deal).days >= 30 ? "১ মাস পূর্ণ" : `${getProgress(deal).days} দিন`}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden mb-2">
                        <div
                          className={cn(
                            "h-1.5 rounded-full transition-all duration-500",
                            getProgress(deal).days >= 30 ? "bg-emerald-500" : "bg-indigo-500"
                          )}
                          style={{ width: `${getProgress(deal).percent}%` }}
                        ></div>
                      </div>
                      <div className="text-[10px] text-gray-500 font-medium">
                        <span className="font-bold">বিষয়:</span> {deal.details} <span className="mx-1">•</span>{" "}
                        <span className="font-bold">সিলেক্ট:</span> {deal.selectionDate}
                      </div>
                    </div>

                    <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-50">
                      <div>
                        {deal.commissionStatus === "Paid" && deal.collectedBy && (
                          <div className="text-[9px] font-black text-emerald-600 uppercase mb-1">
                            রিসিভ: {deal.collectedBy}
                          </div>
                        )}
                        <button
                          onClick={() => onHistoryClick({ title: "টিউশন হিস্টোরি", history: deal.history || [] })}
                          className="text-[10px] text-indigo-500 font-bold flex items-center hover:underline"
                        >
                          <Icon icon={History} size={12} className="mr-1" /> লগ দেখুন
                        </button>
                      </div>
                      <div className="flex space-x-1.5">
                        <button
                          onClick={() => onEdit(deal)}
                          className="p-2.5 bg-blue-50 text-blue-500 rounded-xl hover:bg-blue-100 active:scale-95 transition-all"
                        >
                          <Icon icon={Edit} size={16} />
                        </button>
                        {deal.commissionStatus === "Paid" ? (
                          <button
                            onClick={() => onUndoPayment(deal)}
                            className="p-2.5 bg-orange-50 text-orange-500 rounded-xl active:scale-95 transition-all"
                            title="Undo"
                          >
                            <Icon icon={Undo} size={16} />
                          </button>
                        ) : (
                          <button
                            onClick={() => onDelete(deal.id)}
                            className="p-2.5 bg-red-50 text-red-500 rounded-xl active:scale-95 transition-all"
                            title="Delete"
                          >
                            <Icon icon={Trash2} size={16} />
                          </button>
                        )}
                        <button
                          onClick={() => onCommissionClick(deal)}
                          disabled={deal.commissionStatus !== "Pending"}
                          className={cn(
                            "flex items-center text-[11px] px-4 py-2 rounded-xl font-black text-white transition-all shadow-sm",
                            deal.commissionStatus === "Pending"
                              ? "bg-indigo-600 active:bg-indigo-700 active:scale-95"
                              : "bg-gray-400 opacity-90"
                          )}
                        >
                          {deal.commissionStatus === "Pending" ? "Make Paid" : deal.commissionStatus}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}

          {filteredDeals.length > visibleCount && (
            <button
              onClick={() => setVisibleCount((vc) => vc + 20)}
              className="w-full py-4 bg-indigo-50 text-indigo-700 font-black rounded-2xl active:scale-[0.98] transition-transform text-xs"
            >
              আরও লোড করুন
            </button>
          )}

          {filteredDeals.length === 0 && (
            <div className="text-center py-12 bg-white rounded-3xl border border-gray-100 shadow-sm">
              <Icon icon={Search} size={40} className="mx-auto text-gray-200 mb-3" />
              <p className="text-gray-400 text-sm font-bold mb-6">কোনো ডেটা পাওয়া যায়নি।</p>
              <button
                onClick={onResetDemo}
                className="px-6 py-3 bg-indigo-50 text-indigo-600 rounded-2xl font-black text-xs uppercase tracking-widest border-2 border-indigo-100 hover:bg-indigo-100 transition-colors"
              >
                ডেমো ডাটা লোড করুন
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
