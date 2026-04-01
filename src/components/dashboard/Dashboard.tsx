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
  Bell,
  X,
} from "lucide-react";
import { Deal, HistoryEntry } from "../../types";
import { cn } from "../../lib/utils";
import { useStore } from "../../store/useStore";
import { useTuitionDeals } from "../../hooks/useTuitionDeals";

interface DashboardProps {
  onEdit: (deal: Deal) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: string) => void;
  onHistoryClick: (data: { title: string; history: HistoryEntry[] }) => void;
  onPayment: (id: string) => void;
  onUndoPayment: (deal: Deal) => void;
  onResetDemo: () => void;
}

export const Dashboard = ({
  onEdit,
  onDelete,
  onStatusChange,
  onHistoryClick,
  onPayment,
  onUndoPayment,
  onResetDemo,
}: DashboardProps) => {
  const { exportToCSV } = useTuitionDeals();
  const {
    deals,
    searchQuery,
    setSearchQuery,
    filterTuitionStatus,
    setFilterTuitionStatus,
    filterCommissionStatus,
    setFilterCommissionStatus,
  } = useStore();

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
        return "bg-sky-50 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400 border-sky-100 dark:border-sky-900/30";
      case "Running":
        return "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30";
      case "Confirmed":
        return "bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400 border-teal-100 dark:border-teal-900/30";
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

  return (
    <div className="space-y-6 fade-in transition-colors pb-10">
      <div className="flex items-center space-x-3">
        <div className="relative flex-1 group">
          <Icon icon={Search} size={18} className="absolute left-4 top-3.5 text-emerald-500/50 group-focus-within:text-emerald-500 transition-colors" />
          <input
            type="text"
            placeholder="আইডি, টিউটর বা ক্লাস খুঁজুন..."
            className="w-full pl-11 pr-4 py-3 md:py-3.5 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 text-sm font-medium outline-none transition-all dark:text-white"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        {notifications.length > 0 && (
          <button
            onClick={() => setShowNotifications(true)}
            className="relative p-3.5 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 active:scale-95 transition-all text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10"
          >
            <Icon icon={Bell} size={20} />
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900 shadow-sm">
              {notifications.length}
            </span>
          </button>
        )}
      </div>

      {showNotifications && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-100 dark:border-slate-800">
            <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center bg-amber-50/50 dark:bg-amber-500/5">
              <h3 className="text-amber-600 dark:text-amber-400 font-black flex items-center text-base uppercase tracking-wider">
                <Icon icon={AlertTriangle} size={20} className="mr-3" /> ৩ দিন ওভার! ({notifications.length})
              </h3>
              <button
                onClick={() => setShowNotifications(false)}
                className="p-2 hover:bg-amber-100 dark:hover:bg-amber-900/30 rounded-full transition-colors text-amber-600 dark:text-amber-400"
              >
                <Icon icon={X} size={20} />
              </button>
            </div>
            <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4 bg-slate-50/30 dark:bg-slate-950/30">
              {notifications.map((n) => (
                <div key={n.id} className="bg-white dark:bg-slate-900 p-5 rounded-[32px] shadow-sm border border-amber-100 dark:border-amber-900/20 hover:border-amber-300 dark:hover:border-amber-700 transition-all group">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="font-black text-slate-800 dark:text-white text-base mb-1 group-hover:text-amber-600 transition-colors">
                        {n.tutorName}
                      </p>
                      <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2.5 py-1 rounded-lg font-black border border-slate-200 dark:border-slate-700 uppercase tracking-widest">
                        ID: {n.tuitionId}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-amber-600 dark:text-amber-400 font-black text-lg block leading-none mb-1">৳ {n.commission}</span>
                      <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest">Pending</span>
                    </div>
                  </div>
                  <div className="flex space-x-3 pt-4 border-t border-slate-50 dark:border-slate-800">
                    {n.tutorPhone && (
                      <a
                        href={`tel:${n.tutorPhone}`}
                        className="flex-1 inline-flex items-center justify-center px-4 py-2.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 rounded-2xl text-[11px] font-black border border-emerald-100 dark:border-emerald-900/20 active:scale-95 transition-all"
                      >
                        <Icon icon={Phone} size={14} className="mr-2" /> টিউটর
                      </a>
                    )}
                    <a
                      href={`tel:${n.guardianPhone}`}
                      className="flex-1 inline-flex items-center justify-center px-4 py-2.5 bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 rounded-2xl text-[11px] font-black border border-amber-100 dark:border-amber-900/20 active:scale-95 transition-all"
                    >
                      <Icon icon={Phone} size={14} className="mr-2" /> অভিভাবক
                    </a>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-6 bg-white dark:bg-slate-900 border-t border-slate-50 dark:border-slate-800">
              <button
                onClick={() => setShowNotifications(false)}
                className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[24px] font-black text-xs uppercase tracking-[0.2em] active:scale-[0.98] transition-all shadow-xl shadow-slate-900/20 dark:shadow-white/10"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex space-x-3 overflow-x-auto pb-2 no-scrollbar">
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl flex items-center shadow-sm px-3">
          <Icon icon={Filter} size={14} className="text-emerald-500 ml-1 shrink-0" />
          <select
            className="bg-transparent border-none text-[10px] font-black px-2 py-3 focus:outline-none dark:text-white uppercase tracking-wider"
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
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl flex items-center shadow-sm px-3">
          <Icon icon={DollarSign} size={14} className="text-amber-500 ml-1 shrink-0" />
          <select
            className="bg-transparent border-none text-[10px] font-black px-2 py-3 focus:outline-none dark:text-white uppercase tracking-wider"
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
          className="bg-slate-900 dark:bg-emerald-600 text-white px-5 py-3 rounded-2xl text-[10px] font-black flex items-center shadow-lg shadow-slate-900/10 dark:shadow-emerald-600/20 active:scale-95 shrink-0 uppercase tracking-widest"
        >
          <Icon icon={Download} size={14} className="mr-2" /> ব্যাকআপ
        </button>
      </div>

      <div>
        <div className="flex justify-between items-center mb-5 px-1">
          <h3 className="text-[11px] font-black text-slate-500 dark:text-slate-400 flex items-center uppercase tracking-[0.2em]">
            <div className="p-1.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg mr-3">
              <Users size={14} className="text-emerald-600 dark:text-emerald-400" />
            </div>
            TUITION REQUEST
          </h3>
          <span className="text-[10px] font-black bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700 uppercase tracking-widest">
            {filteredDeals.length} রেকর্ড
          </span>
        </div>

        <div className="space-y-4">
          {filteredDeals.slice(0, visibleCount).map((deal) => (
            <div
              key={deal.id}
              className="bg-white dark:bg-slate-900 rounded-[32px] card-shadow border border-slate-100 dark:border-slate-800/50 overflow-hidden transition-all duration-300 group hover:border-emerald-200 dark:hover:border-emerald-800"
            >
              <div
                onClick={() => setExpandedCardId(expandedCardId === deal.id ? null : deal.id)}
                className="p-4 md:p-5 cursor-pointer select-none flex justify-between items-start"
              >
                <div className="flex-1 pr-3">
                  <p className="font-black text-slate-800 dark:text-white text-sm md:text-base mb-2 flex items-center group-hover:text-emerald-600 transition-colors">
                    {deal.tutorName}
                    {deal.tutorName !== "এখনো সিলেক্ট হয়নি" && tutorCounts[deal.tutorPhone] > 1 && (
                      <span className="inline-flex items-center ml-3 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[9px] px-2 py-0.5 rounded-full font-black border border-emerald-100 dark:border-emerald-900/20">
                        <Icon icon={BarChart} size={10} className="mr-1" /> {tutorCounts[deal.tutorPhone]}
                      </span>
                    )}
                  </p>
                  <div className="flex items-center flex-wrap gap-2">
                    <span className="text-[10px] bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-black px-2.5 py-1 rounded-lg flex items-center border border-slate-200 dark:border-slate-700 uppercase tracking-widest">
                      <Icon icon={Hash} size={10} className="mr-1" /> {deal.tuitionId || "N/A"}
                    </span>
                    <span className="text-[10px] font-black px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 uppercase tracking-widest border border-emerald-100 dark:border-emerald-900/20">
                      {deal.studentClass}
                    </span>
                  </div>
                </div>

                <div className="text-right flex flex-col items-end">
                  <div className="font-black text-slate-800 dark:text-white text-lg leading-none mb-3 tracking-tight">৳ {deal.commission}</div>
                  <div className="flex items-center space-x-2 mb-2">
                    <span
                      className={cn("w-3 h-3 rounded-full shadow-sm", getTuitionStatusColor(deal.tuitionStatus).split(" ")[0])}
                      title={deal.tuitionStatus}
                    ></span>
                    <span
                      className={cn(
                        "text-[9px] font-black px-2 py-1 rounded-lg flex items-center uppercase tracking-widest",
                        getCommissionStatusColor(deal.commissionStatus)
                      )}
                    >
                      {deal.commissionStatus}
                    </span>
                  </div>
                  <div className="p-1.5 bg-slate-50 dark:bg-slate-800 rounded-full transition-colors group-hover:bg-emerald-50 dark:group-hover:bg-emerald-900/20">
                    <Icon
                      icon={ChevronDown}
                      size={16}
                      className={cn("text-slate-500 transition-transform duration-500", expandedCardId === deal.id && "rotate-180 text-emerald-500")}
                    />
                  </div>
                </div>
              </div>

              {expandedCardId === deal.id && (
                <div className="px-5 pb-6 animate-in slide-in-from-top-4 fade-in duration-300">
                  <div className="pt-5 border-t border-slate-50 dark:border-slate-800">
                    <div className="flex flex-wrap gap-3 mb-5">
                      {deal.tutorPhone && (
                        <a
                          href={`tel:${deal.tutorPhone}`}
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center px-4 py-2 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 rounded-2xl text-[11px] font-black shadow-sm active:scale-95 transition-all border border-emerald-100 dark:border-emerald-900/20"
                        >
                          <Icon icon={Phone} size={14} className="mr-2" /> টিউটর
                        </a>
                      )}
                      <a
                        href={`tel:${deal.guardianPhone}`}
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center px-4 py-2 bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 rounded-2xl text-[11px] font-black shadow-sm active:scale-95 transition-all border border-amber-100 dark:border-amber-900/20"
                      >
                        <Icon icon={Phone} size={14} className="mr-2" /> অভিভাবক
                      </a>
                      {deal.referrerName && (
                        <span className="inline-flex items-center px-4 py-2 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-400 rounded-2xl text-[11px] font-black border border-slate-200 dark:border-slate-700">
                          <Icon icon={User} size={14} className="mr-2" /> রেফ: {deal.referrerName}
                        </span>
                      )}
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-950/50 p-5 rounded-[28px] border border-slate-100 dark:border-slate-800 mb-5">
                      <div className="flex justify-between items-center mb-4">
                        <div className="relative group/select">
                          <select
                            value={deal.tuitionStatus}
                            onChange={(e) => onStatusChange(deal.id, e.target.value)}
                            className={cn(
                              "text-[10px] font-black px-4 py-2 rounded-xl border appearance-none outline-none pr-8 transition-all uppercase tracking-widest",
                              getTuitionStatusColor(deal.tuitionStatus)
                            )}
                          >
                            <option value="Processing">Processing</option>
                            <option value="Running">Running</option>
                            <option value="Confirmed">Confirmed</option>
                            <option value="Rejected">Rejected</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                          <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-50" />
                        </div>
                        <span className="font-black bg-white dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-[10px] text-slate-600 dark:text-slate-400 shadow-sm uppercase tracking-widest">
                          ম্যানেজমেন্ট: {deal.adminName}
                        </span>
                      </div>

                      <div className="flex justify-between text-[10px] font-black text-slate-600 mb-2 uppercase tracking-widest">
                        <span>টিউশন ডিউরেশন (১ মাস)</span>
                        <span className={cn(getProgress(deal).days >= 30 ? "text-emerald-600" : "text-emerald-500")}>
                          {getProgress(deal).days >= 30 ? "১ মাস পূর্ণ" : `${getProgress(deal).days} দিন`}
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2 overflow-hidden mb-3">
                        <div
                          className={cn(
                            "h-2 rounded-full transition-all duration-1000 ease-out",
                            getProgress(deal).days >= 30 ? "bg-emerald-500" : "bg-emerald-400"
                          )}
                          style={{ width: `${getProgress(deal).percent}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-slate-700 dark:text-slate-400 font-medium leading-relaxed">
                        <span className="font-black text-slate-800 dark:text-slate-200">বিষয়:</span> {deal.details} <span className="mx-2 text-slate-300">•</span>{" "}
                        <span className="font-black text-slate-800 dark:text-slate-200">সিলেক্ট:</span> {deal.selectionDate}
                      </div>
                    </div>

                    <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-50 dark:border-slate-800">
                      <div>
                        {deal.commissionStatus === "Paid" && deal.collectedBy && (
                          <div className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase mb-2 tracking-widest">
                            রিসিভ: {deal.collectedBy}
                          </div>
                        )}
                        <button
                          onClick={() => onHistoryClick({ title: "টিউশন হিস্টোরি", history: deal.history || [] })}
                          className="text-[11px] text-emerald-600 dark:text-emerald-400 font-black flex items-center hover:underline uppercase tracking-widest"
                        >
                          <Icon icon={History} size={14} className="mr-2" /> লগ দেখুন
                        </button>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => onEdit(deal)}
                          className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400 rounded-2xl hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-600 transition-all active:scale-95"
                        >
                          <Icon icon={Edit} size={18} />
                        </button>
                        {deal.commissionStatus === "Paid" ? (
                          <button
                            onClick={() => onUndoPayment(deal)}
                            className="p-3 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-2xl active:scale-95 transition-all"
                            title="Undo"
                          >
                            <Icon icon={Undo} size={18} />
                          </button>
                        ) : (
                          <button
                            onClick={() => onDelete(deal.id)}
                            className="p-3 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-2xl active:scale-95 transition-all"
                            title="Delete"
                          >
                            <Icon icon={Trash2} size={18} />
                          </button>
                        )}
                        <button
                          onClick={() => onPayment(deal.id)}
                          disabled={deal.commissionStatus !== "Pending"}
                          className={cn(
                            "flex items-center text-[11px] px-5 py-3 rounded-2xl font-black text-white transition-all shadow-lg uppercase tracking-[0.15em]",
                            deal.commissionStatus === "Pending"
                              ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20 active:scale-95"
                              : "bg-slate-300 dark:bg-slate-800 text-slate-500 dark:text-slate-600 cursor-not-allowed"
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
              className="w-full py-5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-black rounded-[28px] active:scale-[0.98] transition-all text-xs uppercase tracking-[0.2em] border-2 border-emerald-100 dark:border-emerald-900/20"
            >
              আরও লোড করুন
            </button>
          )}

          {filteredDeals.length === 0 && (
            <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm">
              <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <Icon icon={Search} size={32} className="text-slate-200 dark:text-slate-700" />
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-black uppercase tracking-widest mb-8">কোনো ডেটা পাওয়া যায়নি।</p>
              <button
                onClick={onResetDemo}
                className="px-8 py-4 bg-emerald-600 text-white rounded-[24px] font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-emerald-600/20 active:scale-95 transition-all"
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
