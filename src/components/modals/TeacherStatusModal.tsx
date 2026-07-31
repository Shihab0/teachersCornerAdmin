import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  X, Phone, Search, GraduationCap, CheckCircle2, Clock, XCircle, 
  Loader2, School, MapPin, ShieldCheck, Lock, Info, Sparkles, PhoneCall
} from "lucide-react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db, appId } from "../../lib/firebase";
import { Teacher } from "../../types";
import { toast } from "sonner";

interface TeacherStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEditTeacher: (teacher: Teacher) => void;
  onOpenNewTeacherModal: () => void;
}

export const TeacherStatusModal: React.FC<TeacherStatusModalProps> = ({
  isOpen,
  onClose,
  onOpenNewTeacherModal
}) => {
  const [phone, setPhone] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [foundTeacher, setFoundTeacher] = useState<Teacher | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanPhone = phone.trim();
    if (!cleanPhone || !/^01\d{9}$/.test(cleanPhone)) {
      toast.error("সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (যেমন: 01611536951)");
      return;
    }

    setIsSearching(true);
    setFoundTeacher(null);
    setHasSearched(true);

    try {
      const colRef = collection(db, "artifacts", appId, "public", "data", "tc_teachers");
      const q = query(colRef, where("phone", "==", cleanPhone));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const teacherDoc = querySnapshot.docs[0];
        const data = { id: teacherDoc.id, ...teacherDoc.data() } as Teacher;
        setFoundTeacher(data);
        toast.success("আবেদনের স্ট্যাটাস খুঁজে পাওয়া গেছে!");
      } else {
        setFoundTeacher(null);
      }
    } catch (error) {
      console.error("Error searching teacher status:", error);
      toast.error("স্ট্যাটাস খুঁজতে সমস্যা হয়েছে। আবার চেষ্টা করুন।");
    } finally {
      setIsSearching(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[32px] shadow-2xl overflow-hidden relative flex flex-col max-h-[90vh] border border-slate-100 dark:border-slate-800"
        >
          {/* Header */}
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-900 dark:bg-slate-950 text-white shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center border border-emerald-500/30">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black tracking-tight">আবেদন ও সিভি স্ট্যাটাস অনুসন্ধান</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">মোবাইল নম্বর দিয়ে সিভির বর্তমান অবস্থা জানুন</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white">
              <X size={20} />
            </button>
          </div>

          <div className="p-6 overflow-y-auto no-scrollbar space-y-6">
            {/* Search Input Form */}
            <form onSubmit={handleSearch} className="space-y-3">
              <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 block ml-1">
                নিবন্ধিত মোবাইল নম্বর
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="016XXXXXXXX"
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-800 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all text-sm font-bold text-slate-900 dark:text-white placeholder:text-slate-400"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSearching}
                  className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50 flex items-center justify-center gap-2 shrink-0"
                >
                  {isSearching ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
                  সার্চ করুন
                </button>
              </div>
            </form>

            {/* Results Section */}
            {hasSearched && (
              <div className="space-y-4 pt-2">
                {foundTeacher ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-4"
                  >
                    {/* Status Banner */}
                    {foundTeacher.status === "Approved" && (
                      <div className="flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 rounded-2xl text-emerald-800 dark:text-emerald-300">
                        <CheckCircle2 size={24} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <div>
                          <div className="text-xs font-black uppercase tracking-wider">সিভি অনুমোদিত (Verified & Live)</div>
                          <div className="text-[11px] font-medium opacity-90 mt-0.5">আপনার সিভিটি ভেরিফাইড হয়েছে এবং শিক্ষক তালিকায় লাইভ যুক্ত রয়েছে।</div>
                        </div>
                      </div>
                    )}

                    {foundTeacher.status === "Pending" && (
                      <div className="flex items-center gap-3 p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 rounded-2xl text-amber-800 dark:text-amber-300">
                        <Clock size={24} className="text-amber-600 dark:text-amber-400 shrink-0" />
                        <div>
                          <div className="text-xs font-black uppercase tracking-wider">আবেদন অপেক্ষমাণ (Pending Admin Review)</div>
                          <div className="text-[11px] font-medium opacity-90 mt-0.5">আপনার আবেদনটি বর্তমানে এডমিন পর্যালোচনায় রয়েছে। দ্রুতই ভেরিফাই শেষে লাইভ করা হবে।</div>
                        </div>
                      </div>
                    )}

                    {foundTeacher.status === "Rejected" && (
                      <div className="flex items-center gap-3 p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 rounded-2xl text-rose-800 dark:text-rose-300">
                        <XCircle size={24} className="text-rose-600 dark:text-rose-400 shrink-0" />
                        <div>
                          <div className="text-xs font-black uppercase tracking-wider">আবেদন প্রতাহৃত / সংশোধনী আবশ্যক</div>
                          <div className="text-[11px] font-medium opacity-90 mt-0.5">আপনার আবেদনটিতে তথ্যের ঘাটতি রয়েছে। সংশোধনের জন্য এডমিনের সাথে যোগাযোগ করুন।</div>
                        </div>
                      </div>
                    )}

                    {/* Teacher Card */}
                    <div className="flex items-center gap-4 p-3.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
                      <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-slate-800 overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700 flex items-center justify-center">
                        {foundTeacher.photoUrl ? (
                          <img src={foundTeacher.photoUrl} alt={foundTeacher.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          <span className="text-emerald-600 font-black text-xl">{foundTeacher.name.charAt(0)}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-black text-slate-900 dark:text-white text-base truncate">{foundTeacher.name}</h4>
                        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5 truncate">
                          <School size={12} className="text-emerald-500 shrink-0" />
                          {foundTeacher.collegeName}
                        </p>
                        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 flex items-center gap-1 mt-0.5">
                          <MapPin size={10} className="text-emerald-500 shrink-0" />
                          {foundTeacher.presentAddress}
                        </p>
                      </div>
                    </div>

                    {/* Security Notice regarding Edit Feature */}
                    <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-2xl space-y-2 text-amber-900 dark:text-amber-200">
                      <div className="flex items-center gap-2 font-black text-xs uppercase tracking-wider">
                        <Lock size={16} className="text-amber-600 dark:text-amber-400 shrink-0" />
                        <span>সিভি ইডিট সংক্রান্ত সিকিউরিটি নোটিশ</span>
                      </div>
                      <p className="text-xs leading-relaxed font-medium">
                        অন্য কেউ যাতে আপনার মোবাইল নম্বর দিয়ে অননুমোদিতভাবে তথ্য পরিবর্তন করতে না পারে, সেজন্য সরাসরি ইডিট সুবিধা নিরাপত্তার স্বার্থে আপাতত বন্ধ রয়েছে।
                      </p>
                      <div className="pt-2 border-t border-amber-200/60 dark:border-amber-900/60 flex items-center gap-2 text-xs font-black text-emerald-700 dark:text-emerald-400">
                        <Sparkles size={14} className="shrink-0" />
                        <span>সিকিউরিটি ভেরিফিকেশনসহ ইডিট অপশন দ্রুতই যুক্ত করা হবে।</span>
                      </div>
                    </div>

                    {/* Contact Support info */}
                    <div className="p-3 bg-slate-100 dark:bg-slate-800/60 rounded-xl flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
                      <span className="font-bold flex items-center gap-1.5">
                        <Info size={14} className="text-slate-400" /> জরুরি সংশোধনের প্রয়োজন?
                      </span>
                      <a 
                        href="tel:01611536951" 
                        className="font-black text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                      >
                        <PhoneCall size={12} /> এডমিন কল দিন
                      </a>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-6 text-center bg-slate-50 dark:bg-slate-800/40 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700 space-y-4"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-slate-200 dark:bg-slate-700 text-slate-500 mx-auto flex items-center justify-center">
                      <Search size={24} />
                    </div>
                    <div>
                      <h4 className="font-black text-slate-800 dark:text-slate-200 text-sm">কোনো আবেদন পাওয়া যায়নি</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto leading-relaxed">
                        <span className="font-bold text-slate-700 dark:text-slate-300">{phone}</span> নম্বরে কোনো শিক্ষক নিবন্ধিত নেই।
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenNewTeacherModal();
                      }}
                      className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-xs uppercase tracking-widest transition-all inline-flex items-center gap-2 cursor-pointer"
                    >
                      <GraduationCap size={16} />
                      নতুন সিভি জমা দিন
                    </button>
                  </motion.div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
