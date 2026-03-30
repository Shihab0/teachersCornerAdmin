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
  Bell,
  X,
  Zap,
  ClipboardList,
} from "lucide-react";
import { Deal, HistoryEntry } from "../../types";
import { cn } from "../../lib/utils";
import { TuitionUpdatePost } from "../stats/TuitionUpdatePost";

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
  const [showNotifications, setShowNotifications] = useState(false);

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
        return "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900/30";
      case "Running":
        return "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30";
      case "Confirmed":
        return "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/30";
      case "Rejected":
        return "bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-900/30";
      case "Cancelled":
        return "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700";
      default:
        return "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400";
    }
  };

  const getCommissionStatusColor = (status: string) => {
    switch (status) {
      case "Paid":
        return "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400";
      case "Pending":
        return "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400";
      case "Free":
        return "bg-sky-50 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400";
      case "Rejected":
        return "bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400";
      default:
        return "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400";
    }
  };

  const recentTuitions = useMemo(() => {
    return deals
      .filter((d) => d.tuitionStatus === "Confirmed" || d.tuitionStatus === "Running")
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 5);
  }, [deals]);

  return (
    <div className="space-y-6 fade-in transition-colors pb-10">
      {/* Recent Updates Section */}
      {recentTuitions.length > 0 && (
        <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="flex items-center gap-2 mb-4 px-1">
            <div className="p-1.5 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
              <Zap size={16} className="text-amber-600 dark:text-amber-400" />
            </div>
            <h2 className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              Last 5 Tuition Updates
            </h2>
          </div>
          <TuitionUpdatePost deals={recentTuitions} />
        </div>
      )}

      <div className="flex items-center space-x-3">
        <div className="relative flex-1 group">
          <Icon icon={Search} size={18} className="absolute left-4 top-3.5 text-indigo-400" />
          <input
            type="text"
            placeholder="আইডি, টিউটর বা ক্লাস খুঁজুন..."
            className="w-full pl-11 pr-4 py-3.5 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 focus:ring-2 focus:ring-indigo-500 text-sm font-medium outline-none transition-all dark:text-white"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        {notifications.length > 0 && (
          <button
            onClick={() => setShowNotifications(true)}
            className="relative p-3.5 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 active:scale-95 transition-all text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/10"
          >
            <Icon icon={Bell} size={20} />
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900 shadow-sm">
              {notifications.length}
            </span>
          </button>
        )}
      </div>

      {showNotifications && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border dark:border-slate-800">
            <div className="p-6 border-b border-gray-50 dark:border-slate-800 flex justify-between items-center bg-orange-50/50 dark:bg-orange-500/10">
              <h3 className="text-orange-800 dark:text-orange-400 font-black flex items-center text-base">
                <Icon icon={AlertTriangle} size={20} className="mr-2" /> ৩ দিন ওভার! ({notifications.length})
              </h3>
              <button
                onClick={() => setShowNotifications(false)}
                className="p-2 hover:bg-orange-100 dark:hover:bg-orange-900/30 rounded-full transition-colors text-orange-800 dark:text-orange-400"
              >
                <Icon icon={X} size={20} />
              </button>
            </div>
            <div className="p-4 max-h-[70vh] overflow-y-auto space-y-3 bg-gray-50/50 dark:bg-slate-950/50">
              {notifications.map((n) => (
                <div key={n.id} className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-orange-100 dark:border-orange-900/30 hover:border-orange-200 dark:hover:border-orange-800 transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-bold text-gray-800 dark:text-white text-sm flex items-center mb-1">
                        {n.tutorName}
                      </p>
                      <span className="text-[10px] bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 px-2 py-0.5 rounded-md font-black border border-indigo-100 dark:border-indigo-900/30 uppercase tracking-wider">
                        ID: {n.tuitionId}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-orange-600 dark:text-orange-400 font-black text-base block leading-none mb-1">৳ {n.commission}</span>
                      <span className="text-[9px] text-gray-400 font-bold uppercase">Pending</span>
                    </div>
                  </div>
                  <div className="flex space-x-2 pt-3 border-t border-gray-50 dark:border-slate-800">
                    {n.tutorPhone && (
                      <a
                        href={`tel:${n.tutorPhone}`}
                        className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 rounded-xl text-[11px] font-bold border border-blue-100 dark:border-blue-900/30 active:scale-95 transition-transform"
                      >
                        <Icon icon={Phone} size={12} className="mr-1.5" /> টিউটর
                      </a>
                    )}
                    <a
                      href={`tel:${n.guardianPhone}`}
                      className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 rounded-xl text-[11px] font-bold border border-emerald-100 dark:border-emerald-900/30 active:scale-95 transition-transform"
                    >
                      <Icon icon={Phone} size={12} className="mr-1.5" /> অভিভাবক
                    </a>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 bg-white dark:bg-slate-900 border-t border-gray-50 dark:border-slate-800 text-center">
              <button
                onClick={() => setShowNotifications(false)}
                className="w-full py-3 bg-gray-800 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest active:scale-[0.98] transition-transform"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex space-x-2 overflow-x-auto pb-1 no-scrollbar">
        <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-xl flex items-center shadow-sm px-2">
          <Icon icon={Filter} size={14} className="text-indigo-400 ml-1 shrink-0" />
          <select
            className="bg-transparent border-none text-[10px] font-bold px-2 py-2.5 focus:outline-none dark:text-white"
            value={filterTuitionStatus}
            onChange={(e) => setFilterTuitionStatus(e.target.value)}
          >
            <option value="All" className="dark:bg-slate-900">সব স্ট্যাটাস</option>
            <option value="Processing" className="dark:bg-slate-900">Processing</option>
            <option value="Running" className="dark:bg-slate-900">Running</option>
            <option value="Confirmed" className="dark:bg-slate-900">Confirmed</option>
            <option value="Rejected" className="dark:bg-slate-900">Rejected</option>
            <option value="Cancelled" className="dark:bg-slate-900">Cancelled</option>
          </select>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-xl flex items-center shadow-sm px-2">
          <Icon icon={DollarSign} size={14} className="text-emerald-500 ml-1 shrink-0" />
          <select
            className="bg-transparent border-none text-[10px] font-bold px-2 py-2.5 focus:outline-none dark:text-white"
            value={filterCommissionStatus}
            onChange={(e) => setFilterCommissionStatus(e.target.value)}
          >
            <option value="All" className="dark:bg-slate-900">সব কমিশন</option>
            <option value="Pending" className="dark:bg-slate-900">Pending</option>
            <option value="Paid" className="dark:bg-slate-900">Paid</option>
            <option value="Free" className="dark:bg-slate-900">Free</option>
            <option value="Rejected" className="dark:bg-slate-900">Rejected</option>
          </select>
        </div>
        <button
          onClick={exportToCSV}
          className="bg-gray-800 dark:bg-indigo-600 text-white px-3 py-2 rounded-xl text-[10px] font-bold flex items-center shadow-sm active:scale-95 shrink-0"
        >
          <Icon icon={Download} size={14} className="mr-1" /> ব্যাকআপ
        </button>
      </div>

      <div>
        <div className="flex justify-between items-center mb-3 px-1">
          <h3 className="text-sm font-black text-gray-800 dark:text-white flex items-center">
            <Icon icon={Users} size={16} className="mr-2 text-indigo-500" /> টিউশন ম্যানেজমেন্ট
          </h3>
          <span className="text-[10px] font-bold bg-gray-200 dark:bg-slate-800 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-md">
            {filteredDeals.length} রেকর্ড
          </span>
        </div>

        <div className="space-y-4">
          {filteredDeals.slice(0, visibleCount).map((deal) => (
            <div
              key={deal.id}
              className="bg-white dark:bg-slate-900 rounded-[24px] card-shadow border border-slate-100 dark:border-slate-800/50 overflow-hidden transition-all duration-300"
            >
              <div
                onClick={() => setExpandedCardId(expandedCardId === deal.id ? null : deal.id)}
                className="p-4 cursor-pointer select-none flex justify-between items-start"
              >
                <div className="flex-1 pr-2">
                  <p className="font-bold text-gray-800 dark:text-white text-sm mb-1.5 flex items-center">
                    {deal.tutorName}
                    {deal.tutorName !== "এখনো সিলেক্ট হয়নি" && tutorCounts[deal.tutorPhone] > 1 && (
                      <span className="inline-flex items-center ml-2 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 text-[9px] px-1.5 py-0.5 rounded-full font-black border border-indigo-100 dark:border-indigo-900/30">
                        <Icon icon={BarChart} size={10} className="mr-0.5" /> {tutorCounts[deal.tutorPhone]}
                      </span>
                    )}
                  </p>
                  <div className="flex items-center flex-wrap gap-1.5">
                    <span className="text-[10px] bg-gray-50 dark:bg-slate-800 text-gray-600 dark:text-gray-400 font-bold px-2 py-0.5 rounded flex items-center border border-gray-200 dark:border-slate-700 uppercase">
                      <Icon icon={Hash} size={10} className="mr-0.5" /> {deal.tuitionId || "N/A"}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 uppercase">
                      {deal.studentClass}
                    </span>
                  </div>
                </div>

                <div className="text-right flex flex-col items-end">
                  <div className="font-black text-gray-800 dark:text-white text-base leading-none mb-2">৳ {deal.commission}</div>
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
                  <div className="pt-3 border-t border-gray-50 dark:border-slate-800">
                    <div className="flex flex-wrap gap-2 mb-3">
                      {deal.tutorPhone && (
                        <a
                          href={`tel:${deal.tutorPhone}`}
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center px-3 py-1.5 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 rounded-xl text-[11px] font-bold shadow-sm active:bg-blue-100 dark:active:bg-blue-900/30"
                        >
                          <Icon icon={Phone} size={12} className="mr-1.5" /> টিউটর
                        </a>
                      )}
                      <a
                        href={`tel:${deal.guardianPhone}`}
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center px-3 py-1.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 rounded-xl text-[11px] font-bold shadow-sm active:bg-emerald-100 dark:active:bg-emerald-900/30"
                      >
                        <Icon icon={Phone} size={12} className="mr-1.5" /> অভিভাবক
                      </a>
                      {deal.referrerName && (
                        <span className="inline-flex items-center px-3 py-1.5 bg-gray-50 dark:bg-slate-800 text-gray-600 dark:text-gray-400 rounded-xl text-[11px] font-bold border border-gray-200 dark:border-slate-700">
                          <Icon icon={User} size={12} className="mr-1.5" /> রেফ: {deal.referrerName}
                        </span>
                      )}
                    </div>

                    <div className="bg-gray-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-gray-100 dark:border-slate-800 mb-3">
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
                        <span className="font-bold bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-gray-200 dark:border-slate-700 text-[10px] text-gray-600 dark:text-gray-400 shadow-sm">
                          ম্যানেজমেন্ট: {deal.adminName}
                        </span>
                      </div>

                      <div className="flex justify-between text-[9px] font-bold text-gray-500 mb-1">
                        <span>টিউশন ডিউরেশন (১ মাস)</span>
                        <span className={cn(getProgress(deal).days >= 30 ? "text-emerald-600" : "text-indigo-600")}>
                          {getProgress(deal).days >= 30 ? "১ মাস পূর্ণ" : `${getProgress(deal).days} দিন`}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden mb-2">
                        <div
                          className={cn(
                            "h-1.5 rounded-full transition-all duration-500",
                            getProgress(deal).days >= 30 ? "bg-emerald-500" : "bg-indigo-500"
                          )}
                          style={{ width: `${getProgress(deal).percent}%` }}
                        ></div>
                      </div>
                      <div className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">
                        <span className="font-bold">বিষয়:</span> {deal.details} <span className="mx-1">•</span>{" "}
                        <span className="font-bold">সিলেক্ট:</span> {deal.selectionDate}
                      </div>
                    </div>

                    <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-50 dark:border-slate-800">
                      <div>
                        {deal.commissionStatus === "Paid" && deal.collectedBy && (
                          <div className="text-[9px] font-black text-emerald-600 uppercase mb-1">
                            রিসিভ: {deal.collectedBy}
                          </div>
                        )}
                        <button
                          onClick={() => onHistoryClick({ title: "টিউশন হিস্টোরি", history: deal.history || [] })}
                          className="text-[10px] text-indigo-500 dark:text-indigo-400 font-bold flex items-center hover:underline"
                        >
                          <Icon icon={History} size={12} className="mr-1" /> লগ দেখুন
                        </button>
                      </div>
                      <div className="flex space-x-1.5">
                        <button
                          onClick={() => onEdit(deal)}
                          className="p-2.5 bg-blue-50 dark:bg-blue-500/10 text-blue-500 dark:text-blue-400 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/30 active:scale-95 transition-all"
                        >
                          <Icon icon={Edit} size={16} />
                        </button>
                        {deal.commissionStatus === "Paid" ? (
                          <button
                            onClick={() => onUndoPayment(deal)}
                            className="p-2.5 bg-orange-50 dark:bg-orange-500/10 text-orange-500 dark:text-orange-400 rounded-xl active:scale-95 transition-all"
                            title="Undo"
                          >
                            <Icon icon={Undo} size={16} />
                          </button>
                        ) : (
                          <button
                            onClick={() => onDelete(deal.id)}
                            className="p-2.5 bg-red-50 dark:bg-red-500/10 text-red-500 dark:text-red-400 rounded-xl active:scale-95 transition-all"
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
              className="w-full py-4 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 font-black rounded-2xl active:scale-[0.98] transition-transform text-xs"
            >
              আরও লোড করুন
            </button>
          )}

          {filteredDeals.length === 0 && (
            <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm">
              <Icon icon={Search} size={40} className="mx-auto text-gray-200 dark:text-slate-800 mb-3" />
              <p className="text-gray-400 dark:text-gray-600 text-sm font-bold mb-6">কোনো ডেটা পাওয়া যায়নি।</p>
              <button
                onClick={onResetDemo}
                className="px-6 py-3 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-2xl font-black text-xs uppercase tracking-widest border-2 border-indigo-100 dark:border-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
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
