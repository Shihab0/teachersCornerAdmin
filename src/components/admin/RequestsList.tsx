import React, { useState, useMemo } from "react";
import { TuitionRequest } from "../../types";
import { Search, Filter, Phone, MapPin, BookOpen, Clock, Calendar, User, CheckCircle2, XCircle, Trash2, Loader2, CheckSquare, Square, Plus, ArrowUpDown } from "lucide-react";
import { Icon } from "../ui/Icon";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { Skeleton } from "../ui/Skeleton";
import { ConfirmDialog } from "../modals/ConfirmDialog";
import { ManualRequestModal } from "../modals/ManualRequestModal";
import { cn } from "../../lib/utils";

interface RequestsListProps {
  requests: TuitionRequest[];
  onUpdateStatus: (id: string, status: "Approved" | "Rejected") => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onAddRequest: (request: Omit<TuitionRequest, "id" | "createdAt">) => Promise<void>;
  isLoading?: boolean;
}

export const RequestsList: React.FC<RequestsListProps> = ({ requests, onUpdateStatus, onDelete, onAddRequest, isLoading }) => {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"All" | "Pending" | "Approved" | "Rejected">("All");
  const [sortBy, setSortBy] = useState<"recent" | "oldest">("recent");
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);

  const filteredRequests = useMemo(() => {
    const filtered = requests.filter(r => {
      const matchesSearch = (r.guardianName?.toLowerCase() || "").includes(search.toLowerCase()) || 
                           (r.studentClass?.toLowerCase() || "").includes(search.toLowerCase()) ||
                           (r.guardianPhone || "").includes(search) ||
                           (r.area?.toLowerCase() || "").includes(search.toLowerCase()) ||
                           (r.subjects?.toLowerCase() || "").includes(search.toLowerCase());
      const matchesStatus = filterStatus === "All" || r.status === filterStatus;
      return matchesSearch && matchesStatus;
    });

    return [...filtered].sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortBy === "recent" ? dateB - dateA : dateA - dateB;
    });
  }, [requests, search, filterStatus, sortBy]);

  const handleStatusChange = async (id: string, status: "Approved" | "Rejected") => {
    setProcessingId(id);
    try {
      await onUpdateStatus(id, status);
      toast.success(`অনুরোধ ${status === "Approved" ? "অনুমোদন" : "প্রত্যাখ্যান"} করা হয়েছে`);
    } catch (error) {
      toast.error("স্ট্যাটাস আপডেট করতে সমস্যা হয়েছে");
    } finally {
      setProcessingId(null);
    }
  };

  const handleBulkAction = async (status: "Approved" | "Rejected") => {
    if (selectedIds.length === 0) return;
    setIsBulkProcessing(true);
    try {
      await Promise.all(selectedIds.map(id => onUpdateStatus(id, status)));
      toast.success(`${selectedIds.length}টি অনুরোধ ${status === "Approved" ? "অনুমোদন" : "প্রত্যাখ্যান"} করা হয়েছে`);
      setSelectedIds([]);
    } catch (error) {
      toast.error("বাল্ক আপডেট করতে সমস্যা হয়েছে");
    } finally {
      setIsBulkProcessing(false);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredRequests.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredRequests.map(r => r.id));
    }
  };

  const handleDelete = async (id: string) => {
    setProcessingId(id);
    try {
      await onDelete(id);
      toast.success("অনুরোধ ডিলিট করা হয়েছে");
    } catch (error) {
      toast.error("ডিলিট করতে সমস্যা হয়েছে");
    } finally {
      setProcessingId(null);
      setConfirmDeleteId(null);
    }
  };

  return (
    <div className="space-y-12 pb-12 pt-6 px-4 md:px-8 lg:px-12 max-w-6xl mx-auto fade-in transition-colors">
      <div className="bg-white dark:bg-slate-900 p-12 md:p-16 rounded-[56px] border border-slate-100 dark:border-slate-800 shadow-sm mb-12 overflow-hidden relative group">
        <div className="absolute -right-24 -top-24 text-[25vw] font-black text-slate-50 dark:text-slate-800/10 select-none pointer-events-none tracking-tighter leading-none uppercase italic transform -rotate-12 group-hover:scale-110 transition-transform duration-1000">
          REQUEST
        </div>
        
        <div className="relative z-10 flex flex-col gap-10">
          <div className="flex items-center justify-between flex-wrap gap-8">
            <h2 className="text-6xl md:text-8xl font-black text-slate-950 dark:text-white tracking-tight uppercase leading-[0.8] transform -skew-x-6 [word-spacing:0.2em]">
              TUITION <br />
              <span className="ml-4 text-emerald-600 dark:text-emerald-400 italic lowercase tracking-normal text-4xl md:text-6xl">& REQUESTS</span>
            </h2>
            <div className="flex flex-col items-end gap-6">
              <button 
                onClick={() => setIsManualModalOpen(true)}
                className="group flex items-center gap-4 bg-slate-950 dark:bg-white text-white dark:text-slate-950 px-8 py-4 rounded-[28px] shadow-2xl shadow-slate-950/20 dark:shadow-white/10 active:scale-95 transition-all hover:pr-10"
              >
                <span className="text-[11px] font-black uppercase tracking-[0.2em]">ম্যানুয়াল এন্ট্রি</span>
                <div className="w-8 h-8 bg-white/10 dark:bg-slate-950/10 rounded-full flex items-center justify-center group-hover:rotate-90 transition-transform">
                  <Plus size={20} />
                </div>
              </button>
              <div className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] vertical-rl transform rotate-180 opacity-40">
                PENDING APPROVALS 2026
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-10 mb-12">
        <div className="relative group">
          <Icon icon={Search} size={24} className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
          <input
            type="text"
            placeholder="নাম, ক্লাস, ফোন বা এলাকা দিয়ে খুঁজুন..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-20 pr-10 py-8 bg-white dark:bg-slate-900 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm focus:outline-none focus:ring-8 focus:ring-emerald-500/5 dark:text-white font-black text-base transition-all placeholder:text-slate-400 tracking-tight"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar flex-1">
            {["All", "Pending", "Approved", "Rejected"].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status as any)}
                className={cn(
                  "px-8 py-4 rounded-[20px] text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-500 border-2 whitespace-nowrap",
                  filterStatus === status 
                  ? "bg-slate-950 dark:bg-white text-white dark:text-slate-950 border-slate-950 dark:border-white shadow-2xl shadow-slate-950/20 dark:shadow-white/10" 
                  : "bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-500 border-slate-100 dark:border-slate-800 hover:border-emerald-500 hover:text-emerald-500"
                )}
              >
                {status === "All" ? "সবগুলো" : status === "Pending" ? "পেন্ডিং" : status === "Approved" ? "অনুমোদিত" : "প্রত্যাখ্যাত"}
              </button>
            ))}
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSortBy(sortBy === "recent" ? "oldest" : "recent")}
              className="flex items-center gap-4 px-8 py-4 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[20px] text-[11px] font-black uppercase tracking-[0.2em] text-slate-600 dark:text-slate-400 hover:border-emerald-500 hover:text-emerald-500 transition-all shadow-sm"
            >
              <ArrowUpDown size={18} className={sortBy === "recent" ? "text-emerald-500" : "text-amber-500"} />
              {sortBy === "recent" ? "সাম্প্রতিক আগে" : "পুরাতন আগে"}
            </button>

            <button
              onClick={toggleSelectAll}
              className={cn(
                "p-4 rounded-[20px] border-2 transition-all active:scale-90",
                selectedIds.length === filteredRequests.length && filteredRequests.length > 0
                  ? "bg-emerald-500 border-emerald-500 text-white shadow-xl shadow-emerald-500/20"
                  : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-400 hover:border-emerald-500 hover:text-emerald-500"
              )}
              title="সবগুলো সিলেক্ট করুন"
            >
              <CheckSquare size={24} />
            </button>
          </div>
        </div>

      <AnimatePresence>
        {selectedIds.length > 0 && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-md"
          >
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-2xl rounded-3xl p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl">
                  <CheckSquare size={20} />
                </div>
                <div className="text-sm font-black text-slate-800 dark:text-white">
                  {selectedIds.length} নির্বাচিত
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleBulkAction("Approved")}
                  disabled={isBulkProcessing}
                  className="px-4 py-2 bg-emerald-500 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-emerald-600 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {isBulkProcessing ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                  Approve
                </button>
                <button
                  onClick={() => handleBulkAction("Rejected")}
                  disabled={isBulkProcessing}
                  className="px-4 py-2 bg-rose-500 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-rose-600 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {isBulkProcessing ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
                  Reject
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      </div>

      <div className="space-y-8">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-slate-900 rounded-[48px] p-12 border border-slate-100 dark:border-slate-800 space-y-8">
              <div className="flex justify-between">
                <div className="space-y-4">
                  <Skeleton className="h-8 w-48 rounded-xl" />
                  <Skeleton className="h-4 w-32 rounded-lg" />
                </div>
                <Skeleton className="h-10 w-24 rounded-full" />
              </div>
              <div className="grid grid-cols-3 gap-8">
                <Skeleton className="h-6 w-full rounded-lg" />
                <Skeleton className="h-6 w-full rounded-lg" />
                <Skeleton className="h-6 w-full rounded-lg" />
              </div>
              <Skeleton className="h-24 w-full rounded-[32px]" />
            </div>
          ))
        ) : (
          <AnimatePresence mode="popLayout">
            {filteredRequests.map((request) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                key={request.id}
                className={cn(
                  "bg-white dark:bg-slate-900 rounded-[48px] border overflow-hidden transition-all duration-500 group hover:shadow-2xl hover:shadow-slate-200/50 dark:hover:shadow-none",
                  selectedIds.includes(request.id) 
                  ? "border-emerald-500 ring-8 ring-emerald-500/5" 
                  : "border-slate-100 dark:border-slate-800/50"
                )}
              >
                <div className="p-10 md:p-12">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10">
                    <div className="flex items-start gap-8">
                      <div className="relative">
                        <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-[32px] flex items-center justify-center text-slate-400 group-hover:scale-110 transition-transform duration-500">
                          <User size={40} />
                        </div>
                        <button
                          onClick={() => toggleSelect(request.id)}
                          className={cn(
                            "absolute -top-3 -right-3 w-10 h-10 rounded-full border-4 border-white dark:border-slate-900 flex items-center justify-center transition-all shadow-lg",
                            selectedIds.includes(request.id)
                              ? "bg-emerald-500 text-white scale-110"
                              : "bg-slate-100 dark:bg-slate-800 text-transparent"
                          )}
                        >
                          <CheckCircle2 size={20} />
                        </button>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center gap-4 flex-wrap">
                          <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase">{request.guardianName}</h3>
                          <span className={cn(
                            "px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border-2",
                            request.status === "Pending" ? "bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800/50" :
                            request.status === "Approved" ? "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800/50" :
                            "bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-800/50"
                          )}>
                            {request.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-6 text-slate-500 dark:text-slate-400">
                          <div className="flex items-center gap-2">
                            <MapPin size={16} className="text-emerald-500" />
                            <span className="text-sm font-black tracking-wider uppercase">{request.area}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar size={16} className="text-emerald-500" />
                            <span className="text-sm font-black tracking-wider">{new Date(request.createdAt).toLocaleDateString("bn-BD")}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4">
                      <a 
                        href={`tel:${request.guardianPhone}`}
                        className="flex-1 lg:flex-none flex items-center justify-center gap-4 px-8 py-4 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-[24px] text-[11px] font-black uppercase tracking-[0.2em] hover:bg-emerald-500 hover:text-white transition-all group/phone"
                      >
                        <Phone size={18} className="text-emerald-500 group-hover/phone:text-white" />
                        {request.guardianPhone}
                      </a>
                      
                      <div className="flex items-center gap-3">
                        {request.status === "Pending" && (
                          <>
                            <button
                              onClick={() => handleStatusChange(request.id, "Approved")}
                              disabled={processingId === request.id}
                              className="p-4 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-[20px] hover:bg-emerald-600 hover:text-white transition-all disabled:opacity-50 shadow-sm"
                              title="Approve"
                            >
                              {processingId === request.id ? <Loader2 size={24} className="animate-spin" /> : <CheckCircle2 size={24} />}
                            </button>
                            <button
                              onClick={() => handleStatusChange(request.id, "Rejected")}
                              disabled={processingId === request.id}
                              className="p-4 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-[20px] hover:bg-rose-600 hover:text-white transition-all disabled:opacity-50 shadow-sm"
                              title="Reject"
                            >
                              {processingId === request.id ? <Loader2 size={24} className="animate-spin" /> : <XCircle size={24} />}
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => setConfirmDeleteId(request.id)}
                          disabled={processingId === request.id}
                          className="p-4 bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-[20px] hover:bg-rose-600 hover:text-white transition-all disabled:opacity-50 shadow-sm"
                          title="Delete"
                        >
                          <Trash2 size={24} />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 pt-10 border-t border-slate-100 dark:border-slate-800/50">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-emerald-500">
                          <BookOpen size={18} />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-0.5">শ্রেণী</p>
                          <p className="text-base font-black text-slate-700 dark:text-slate-300">{request.studentClass}</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-emerald-500">
                          <Clock size={18} />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-0.5">সপ্তাহে দিন</p>
                          <p className="text-base font-black text-slate-700 dark:text-slate-300">{request.daysPerWeek}</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-emerald-500">
                          <Filter size={18} />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-0.5">স্ট্যাটাস</p>
                          <p className="text-base font-black text-slate-700 dark:text-slate-300">{request.status}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-10 p-8 bg-slate-50 dark:bg-slate-800/50 rounded-[32px] border border-slate-100 dark:border-slate-800/50">
                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-4">বিষয়সমূহ</p>
                    <p className="text-lg font-black text-slate-800 dark:text-slate-200 leading-relaxed">{request.subjects}</p>
                  </div>

                  {request.details && (
                    <div className="mt-6 p-8 bg-amber-50/30 dark:bg-amber-900/10 rounded-[32px] border border-amber-100/50 dark:border-amber-900/20">
                      <p className="text-[10px] font-black text-amber-600/60 dark:text-amber-400/60 uppercase tracking-[0.2em] mb-4 italic">বিস্তারিত নোট</p>
                      <p className="text-base font-medium text-slate-700 dark:text-slate-300 italic leading-relaxed">"{request.details}"</p>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}

        {!isLoading && filteredRequests.length === 0 && (
          <div className="text-center py-24 bg-white dark:bg-slate-900 rounded-[56px] border border-slate-100 dark:border-slate-800 shadow-sm">
            <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-[32px] flex items-center justify-center mx-auto mb-8 text-slate-200 dark:text-slate-700">
              <Search size={48} />
            </div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-2">কোনো রিকোয়েস্ট পাওয়া যায়নি!</h3>
            <p className="text-slate-400 dark:text-slate-500 font-black uppercase tracking-[0.2em] text-[11px]">অন্য কোনো কি-ওয়ার্ড দিয়ে চেষ্টা করুন</p>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={!!confirmDeleteId}
        title="অনুরোধ ডিলিট"
        message="আপনি কি নিশ্চিতভাবে এই অনুরোধটি ডিলিট করতে চান? এই কাজটি আর ফিরিয়ে আনা যাবে না।"
        onConfirm={() => confirmDeleteId && handleDelete(confirmDeleteId)}
        onCancel={() => setConfirmDeleteId(null)}
        isDanger={true}
      />

      <ManualRequestModal 
        isOpen={isManualModalOpen} 
        onClose={() => setIsManualModalOpen(false)} 
        onSave={onAddRequest} 
      />
    </div>
  );
};
