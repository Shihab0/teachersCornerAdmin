import React, { useState, useMemo } from "react";
import { TuitionRequest } from "../../types";
import { Search, Filter, Phone, MapPin, BookOpen, Clock, Calendar, User, CheckCircle2, XCircle, Trash2, Loader2, CheckSquare, Square } from "lucide-react";
import { Icon } from "../ui/Icon";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { Skeleton } from "../ui/Skeleton";
import { ConfirmDialog } from "../modals/ConfirmDialog";

interface RequestsListProps {
  requests: TuitionRequest[];
  onUpdateStatus: (id: string, status: "Approved" | "Rejected") => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  isLoading?: boolean;
}

export const RequestsList: React.FC<RequestsListProps> = ({ requests, onUpdateStatus, onDelete, isLoading }) => {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"All" | "Pending" | "Approved" | "Rejected">("All");
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const filteredRequests = useMemo(() => {
    return requests.filter(r => {
      const matchesSearch = (r.guardianName?.toLowerCase() || "").includes(search.toLowerCase()) || 
                           (r.studentClass?.toLowerCase() || "").includes(search.toLowerCase()) ||
                           (r.guardianPhone || "").includes(search);
      const matchesStatus = filterStatus === "All" || r.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [requests, search, filterStatus]);

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
    <div className="space-y-6">
      <div className="flex flex-col gap-1 mb-8">
        <div className="flex items-center justify-between">
          <h2 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter uppercase leading-none">
            টিউশন <span className="text-indigo-600 dark:text-indigo-400 italic font-serif lowercase tracking-normal">রিকোয়েস্ট</span>
          </h2>
          <div className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
            Total: {requests.length}
          </div>
        </div>
        <div className="h-px bg-gray-200 dark:bg-slate-800 w-full mt-2" />
      </div>

      <div className="space-y-6">
        <div className="relative group">
          <Icon icon={Search} size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
          <input
            type="text"
            placeholder="নাম, ক্লাস বা ফোন দিয়ে খুঁজুন..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-5 bg-gray-50 dark:bg-slate-900/50 dark:text-white rounded-2xl border-2 border-transparent focus:border-indigo-500/20 focus:bg-white dark:focus:bg-slate-900 transition-all outline-none font-bold text-sm"
          />
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar flex-1">
            {["All", "Pending", "Approved", "Rejected"].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status as any)}
                className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border-2 ${
                  filterStatus === status 
                  ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-gray-900 dark:border-white shadow-xl shadow-gray-200 dark:shadow-none" 
                  : "bg-white dark:bg-slate-800 text-gray-400 dark:text-gray-500 border-gray-100 dark:border-slate-800 hover:border-gray-200 dark:hover:border-slate-700"
                }`}
              >
                {status === "All" ? "সবগুলো" : status === "Pending" ? "পেন্ডিং" : status === "Approved" ? "অনুমোদিত" : "প্রত্যাখ্যাত"}
              </button>
            ))}
          </div>
          
          <button
            onClick={toggleSelectAll}
            className={`p-3 rounded-xl border-2 transition-all ${
              selectedIds.length === filteredRequests.length && filteredRequests.length > 0
              ? "bg-indigo-50 dark:bg-indigo-900/30 border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400"
              : "bg-white dark:bg-slate-800 border-gray-100 dark:border-slate-800 text-gray-400 dark:text-slate-600 hover:border-gray-200 dark:hover:border-slate-700"
            }`}
            title="সবগুলো সিলেক্ট করুন"
          >
            <CheckSquare size={20} />
          </button>
        </div>

      <AnimatePresence>
        {selectedIds.length > 0 && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-md"
          >
            <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 shadow-2xl rounded-3xl p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl">
                  <CheckSquare size={20} />
                </div>
                <div className="text-sm font-black text-gray-800 dark:text-white">
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

      <div className="space-y-4">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-slate-800 rounded-3xl p-5 border border-gray-100 dark:border-slate-700 space-y-4">
              <div className="flex justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </div>
              <Skeleton className="h-12 w-full rounded-2xl" />
            </div>
          ))
        ) : (
          <AnimatePresence mode="popLayout">
            {filteredRequests.map((request) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                key={request.id}
                className={`bg-white dark:bg-slate-800 rounded-3xl border shadow-sm overflow-hidden transition-all ${
                  selectedIds.includes(request.id) 
                  ? "border-indigo-500 ring-2 ring-indigo-500/10" 
                  : "border-gray-100 dark:border-slate-700"
                }`}
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex gap-4">
                      <button 
                        onClick={() => toggleSelect(request.id)}
                        className={`mt-1 transition-all transform active:scale-90 ${selectedIds.includes(request.id) ? "text-indigo-500" : "text-gray-200 dark:text-slate-700 hover:text-gray-400 dark:hover:text-slate-500"}`}
                      >
                        <Icon icon={selectedIds.includes(request.id) ? CheckSquare : Square} size={24} />
                      </button>
                      <div>
                        <h3 className="font-black text-gray-900 dark:text-white text-xl tracking-tight leading-tight">{request.guardianName}</h3>
                        <div className="flex items-center gap-1.5 text-[10px] text-gray-400 dark:text-slate-500 font-black uppercase tracking-widest mt-1.5">
                          <MapPin size={12} className="text-indigo-500" />
                          {request.area}
                        </div>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-[0.2em] border ${
                      request.status === "Pending" ? "bg-amber-50 dark:bg-amber-900/10 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/20" :
                      request.status === "Approved" ? "bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/20" :
                      "bg-rose-50 dark:bg-rose-900/10 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-900/20"
                    }`}>
                      {request.status}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6 mb-6 ml-10">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-slate-300">
                        <div className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-slate-900 flex items-center justify-center text-indigo-500">
                          <BookOpen size={16} />
                        </div>
                        <div>
                          <p className="text-[9px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-0.5">শ্রেণী</p>
                          <p className="font-bold">{request.studentClass}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-slate-300">
                        <div className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-slate-900 flex items-center justify-center text-indigo-500">
                          <Clock size={16} />
                        </div>
                        <div>
                          <p className="text-[9px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-0.5">সপ্তাহে দিন</p>
                          <p className="font-bold">{request.daysPerWeek}</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-slate-300">
                        <div className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-slate-900 flex items-center justify-center text-indigo-500">
                          <Calendar size={16} />
                        </div>
                        <div>
                          <p className="text-[9px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-0.5">তারিখ</p>
                          <p className="font-bold">{new Date(request.createdAt).toLocaleDateString("bn-BD")}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-slate-900/50 rounded-2xl p-4 mb-6 ml-10 border border-gray-100 dark:border-slate-800">
                    <div className="text-[9px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-2">বিষয়সমূহ</div>
                    <div className="text-sm font-bold text-gray-800 dark:text-slate-200 leading-relaxed">{request.subjects}</div>
                  </div>

                  {request.details && (
                    <div className="bg-amber-50/30 dark:bg-amber-900/10 rounded-2xl p-4 mb-6 border border-amber-100/50 dark:border-amber-900/20 ml-10">
                      <div className="text-[9px] font-black text-amber-600/60 dark:text-amber-400/60 uppercase tracking-widest mb-2">বিস্তারিত নোট</div>
                      <div className="text-xs font-medium text-gray-700 dark:text-slate-300 italic leading-relaxed">"{request.details}"</div>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-6 border-t border-gray-100 dark:border-slate-800 ml-10">
                    <a 
                      href={`tel:${request.guardianPhone}`}
                      className="group flex items-center gap-3 text-indigo-600 dark:text-indigo-400 font-black text-sm"
                    >
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all">
                        <Phone size={18} />
                      </div>
                      <span className="tracking-tighter">{request.guardianPhone}</span>
                    </a>
                    
                    <div className="flex items-center gap-2">
                      {request.status === "Pending" && (
                        <>
                          <button
                            onClick={() => handleStatusChange(request.id, "Approved")}
                            disabled={processingId === request.id}
                            className="p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-xl hover:bg-emerald-600 hover:text-white transition-all disabled:opacity-50"
                            title="Approve"
                          >
                            {processingId === request.id ? <Loader2 size={20} className="animate-spin" /> : <CheckCircle2 size={20} />}
                          </button>
                          <button
                            onClick={() => handleStatusChange(request.id, "Rejected")}
                            disabled={processingId === request.id}
                            className="p-3 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-xl hover:bg-rose-600 hover:text-white transition-all disabled:opacity-50"
                            title="Reject"
                          >
                            {processingId === request.id ? <Loader2 size={20} className="animate-spin" /> : <XCircle size={20} />}
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => setConfirmDeleteId(request.id)}
                        disabled={processingId === request.id}
                        className="p-3 bg-gray-50 dark:bg-slate-800 text-gray-400 dark:text-slate-500 rounded-xl hover:bg-gray-900 hover:text-white dark:hover:bg-white dark:hover:text-gray-900 transition-all disabled:opacity-50"
                        title="Delete"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}

        {!isLoading && filteredRequests.length === 0 && (
          <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-3xl border border-gray-100 dark:border-slate-700 shadow-sm">
            <Icon icon={Search} size={40} className="mx-auto text-gray-200 dark:text-slate-700 mb-3" />
            <p className="text-gray-400 dark:text-gray-500 text-sm font-bold">কোনো রিকোয়েস্ট পাওয়া যায়নি!</p>
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
    </div>
  );
};
