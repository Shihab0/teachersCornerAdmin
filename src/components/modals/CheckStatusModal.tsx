import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Search, Phone, User, CheckCircle2, Clock, XCircle, Loader2, BookOpen, MapPin } from "lucide-react";
import { collection, query, where, getDocs, limit } from "firebase/firestore";
import { db, appId, handleFirestoreError, OperationType } from "../../lib/firebase";
import { TuitionRequest, Teacher } from "../../types";
import { cn } from "../../lib/utils";
import { toast } from "sonner";
import { COLLECTIONS } from "../../constants";

interface CheckStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CheckStatusModal: React.FC<CheckStatusModalProps> = ({ isOpen, onClose }) => {
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<{
    requests: TuitionRequest[];
    teachers: Teacher[];
  } | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.length < 11) {
      toast.error("সঠিক ফোন নম্বর দিন (কমপক্ষে ১১ ডিজিট)");
      return;
    }

    setIsLoading(true);
    setResults(null);

    try {
      // Search in tuition requests
      const requestsRef = collection(db, COLLECTIONS.REQUESTS);
      const qRequests = query(requestsRef, where("guardianPhone", "==", phone), limit(5));
      const requestsSnap = await getDocs(qRequests);
      const requestsData = requestsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as TuitionRequest));

      // Search in teachers
      const teachersRef = collection(db, COLLECTIONS.TEACHERS);
      const qTeachers = query(teachersRef, where("phone", "==", phone), limit(5));
      const teachersSnap = await getDocs(qTeachers);
      const teachersData = teachersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Teacher));

      setResults({
        requests: requestsData,
        teachers: teachersData
      });

      if (requestsData.length === 0 && teachersData.length === 0) {
        toast.info("এই নম্বর দিয়ে কোনো তথ্য পাওয়া যায়নি।");
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, "check_status_search");
      toast.error("তথ্য খুঁজতে সমস্যা হয়েছে। আবার চেষ্টা করুন।");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800"
          >
            <div className="p-8 md:p-10">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase">স্ট্যাটাস চেক করুন</h2>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">আপনার ফোন নম্বর দিয়ে সার্চ করুন</p>
                </div>
                <button
                  onClick={onClose}
                  className="w-12 h-12 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-2xl flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-all active:scale-90"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSearch} className="relative mb-10">
                <div className="relative group">
                  <Phone className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={20} />
                  <input
                    type="tel"
                    placeholder="আপনার ফোন নম্বর দিন..."
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-16 pr-32 py-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-800 text-base font-black text-slate-800 dark:text-white focus:ring-8 focus:ring-emerald-500/5 outline-none transition-all placeholder:text-slate-400"
                  />
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="absolute right-3 top-1/2 -translate-y-1/2 px-6 py-3 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-700 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
                  >
                    {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
                    সার্চ
                  </button>
                </div>
              </form>

              <div className="max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                {results && (
                  <div className="space-y-8">
                    {/* Tuition Requests Results */}
                    {results.requests.length > 0 && (
                      <div className="space-y-4">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] px-2">টিউশন রিকোয়েস্ট ({results.requests.length})</h3>
                        {results.requests.map((req) => (
                          <div key={req.id} className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-[32px] border border-slate-100 dark:border-slate-800">
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <h4 className="text-lg font-black text-slate-800 dark:text-white">{req.guardianName}</h4>
                                <div className="flex items-center gap-2 text-slate-400 mt-1">
                                  <MapPin size={14} />
                                  <span className="text-[10px] font-bold uppercase tracking-wider">{req.area}</span>
                                </div>
                              </div>
                              <div className={cn(
                                "px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border",
                                req.status === "Pending" ? "bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800" :
                                req.status === "Approved" ? "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800" :
                                "bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-800"
                              )}>
                                {req.status === "Pending" ? "পেন্ডিং" : req.status === "Approved" ? "অনুমোদিত" : "প্রত্যাখ্যাত"}
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center text-emerald-500 shadow-sm">
                                  <BookOpen size={14} />
                                </div>
                                <div>
                                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">ক্লাস</p>
                                  <p className="text-xs font-black text-slate-700 dark:text-slate-300">{req.studentClass}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center text-emerald-500 shadow-sm">
                                  <Clock size={14} />
                                </div>
                                <div>
                                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">তারিখ</p>
                                  <p className="text-xs font-black text-slate-700 dark:text-slate-300">{new Date(req.createdAt).toLocaleDateString("bn-BD")}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Teacher CV Results */}
                    {results.teachers.length > 0 && (
                      <div className="space-y-4">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] px-2">শিক্ষক প্রোফাইল ({results.teachers.length})</h3>
                        {results.teachers.map((teacher) => (
                          <div key={teacher.id} className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-[32px] border border-slate-100 dark:border-slate-800">
                            <div className="flex justify-between items-start mb-4">
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-2xl overflow-hidden">
                                  {teacher.photoUrl ? (
                                    <img src={teacher.photoUrl} alt={teacher.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                                      <User size={24} />
                                    </div>
                                  )}
                                </div>
                                <div>
                                  <h4 className="text-lg font-black text-slate-800 dark:text-white">{teacher.name}</h4>
                                  <div className="flex items-center gap-2 text-slate-400 mt-1">
                                    <BookOpen size={14} />
                                    <span className="text-[10px] font-bold uppercase tracking-wider">{teacher.education.honours.subject}</span>
                                  </div>
                                </div>
                              </div>
                              <div className={cn(
                                "px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border",
                                teacher.status === "Pending" ? "bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800" :
                                teacher.status === "Approved" ? "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800" :
                                "bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-800"
                              )}>
                                {teacher.status === "Pending" ? "পেন্ডিং" : teacher.status === "Approved" ? "অনুমোদিত" : "প্রত্যাখ্যাত"}
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center text-emerald-500 shadow-sm">
                                  <MapPin size={14} />
                                </div>
                                <div>
                                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">এলাকা</p>
                                  <p className="text-xs font-black text-slate-700 dark:text-slate-300 truncate max-w-[120px]">{teacher.presentAddress}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center text-emerald-500 shadow-sm">
                                  <Clock size={14} />
                                </div>
                                <div>
                                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">তারিখ</p>
                                  <p className="text-xs font-black text-slate-700 dark:text-slate-300">{new Date(teacher.createdAt).toLocaleDateString("bn-BD")}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {!results && !isLoading && (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800/50 rounded-[32px] flex items-center justify-center mx-auto mb-6 text-slate-200 dark:text-slate-700">
                      <Search size={40} />
                    </div>
                    <p className="text-slate-400 dark:text-slate-500 font-black uppercase tracking-[0.2em] text-[10px]">আপনার ফোন নম্বর দিয়ে সার্চ করুন</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
