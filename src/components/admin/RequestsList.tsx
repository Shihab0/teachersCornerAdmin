import React, { useState, useMemo } from "react";
import { TuitionRequest } from "../../types";
import { Search, Filter, Phone, MapPin, BookOpen, Clock, Calendar, User, CheckCircle2, XCircle, Trash2, Loader2 } from "lucide-react";
import { Icon } from "../ui/Icon";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";

interface RequestsListProps {
  requests: TuitionRequest[];
  onUpdateStatus: (id: string, status: "Approved" | "Rejected") => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export const RequestsList: React.FC<RequestsListProps> = ({ requests, onUpdateStatus, onDelete }) => {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"All" | "Pending" | "Approved" | "Rejected">("All");
  const [processingId, setProcessingId] = useState<string | null>(null);

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

  const handleDelete = async (id: string) => {
    if (!window.confirm("আপনি কি নিশ্চিতভাবে এই অনুরোধটি ডিলিট করতে চান?")) return;
    setProcessingId(id);
    try {
      await onDelete(id);
      toast.success("অনুরোধ ডিলিট করা হয়েছে");
    } catch (error) {
      toast.error("ডিলিট করতে সমস্যা হয়েছে");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-black text-gray-800 tracking-tight">টিউশন রিকোয়েস্ট</h2>
        <div className="bg-indigo-100 text-indigo-600 px-3 py-1 rounded-full text-xs font-black">
          মোট: {requests.length}
        </div>
      </div>

      <div className="space-y-4">
        <div className="relative">
          <Icon icon={Search} size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="নাম, ক্লাস বা ফোন দিয়ে খুঁজুন..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white rounded-3xl border border-gray-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium text-sm"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {["All", "Pending", "Approved", "Rejected"].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status as any)}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap ${
                filterStatus === status 
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" 
                : "bg-white text-gray-500 border border-gray-100"
              }`}
            >
              {status === "All" ? "সবগুলো" : status === "Pending" ? "পেন্ডিং" : status === "Approved" ? "অনুমোদিত" : "প্রত্যাখ্যাত"}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {filteredRequests.map((request) => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              key={request.id}
              className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden"
            >
              <div className="p-5">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-black text-gray-800 text-lg">{request.guardianName}</h3>
                    <div className="flex items-center gap-1 text-xs text-gray-500 font-medium mt-1">
                      <MapPin size={12} className="text-indigo-400" />
                      {request.area}
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    request.status === "Pending" ? "bg-amber-50 text-amber-600" :
                    request.status === "Approved" ? "bg-emerald-50 text-emerald-600" :
                    "bg-rose-50 text-rose-600"
                  }`}>
                    {request.status}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <BookOpen size={14} className="text-indigo-400" />
                      <span className="font-bold">{request.studentClass}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <Clock size={14} className="text-indigo-400" />
                      <span className="font-bold">{request.daysPerWeek}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <Calendar size={14} className="text-indigo-400" />
                      <span className="font-bold">{new Date(request.createdAt).toLocaleDateString("bn-BD")}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-2xl p-3 mb-4">
                  <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">বিষয়সমূহ</div>
                  <div className="text-xs font-bold text-gray-700">{request.subjects}</div>
                </div>

                {request.details && (
                  <div className="bg-amber-50/30 rounded-2xl p-3 mb-4 border border-amber-100/50">
                    <div className="text-[10px] font-black text-amber-600/60 uppercase tracking-widest mb-1">বিস্তারিত</div>
                    <div className="text-xs font-medium text-gray-700 italic">"{request.details}"</div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                  <a 
                    href={`tel:${request.guardianPhone}`}
                    className="flex items-center gap-2 text-indigo-600 font-black text-sm"
                  >
                    <Phone size={16} />
                    {request.guardianPhone}
                  </a>
                  
                  <div className="flex items-center gap-2">
                    {request.status === "Pending" && (
                      <>
                        <button
                          onClick={() => handleStatusChange(request.id, "Approved")}
                          disabled={processingId === request.id}
                          className="p-2 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 transition-colors disabled:opacity-50"
                        >
                          {processingId === request.id ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
                        </button>
                        <button
                          onClick={() => handleStatusChange(request.id, "Rejected")}
                          disabled={processingId === request.id}
                          className="p-2 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-100 transition-colors disabled:opacity-50"
                        >
                          {processingId === request.id ? <Loader2 size={18} className="animate-spin" /> : <XCircle size={18} />}
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handleDelete(request.id)}
                      disabled={processingId === request.id}
                      className="p-2 bg-gray-50 text-gray-400 rounded-xl hover:bg-gray-100 transition-colors disabled:opacity-50"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredRequests.length === 0 && (
          <div className="text-center py-12 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <Icon icon={Search} size={40} className="mx-auto text-gray-200 mb-3" />
            <p className="text-gray-400 text-sm font-bold">কোনো রিকোয়েস্ট পাওয়া যায়নি!</p>
          </div>
        )}
      </div>
    </div>
  );
};
