import React, { useState } from "react";
import { Icon } from "../ui/Icon";
import { X, User, Phone, BookOpen, MapPin, Clock, FileText, Plus, Loader2 } from "lucide-react";
import { TuitionRequest } from "../../types";

interface ManualRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (request: Omit<TuitionRequest, "id" | "createdAt">) => Promise<void>;
}

export const ManualRequestModal: React.FC<ManualRequestModalProps> = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    guardianName: "",
    guardianPhone: "",
    studentClass: "",
    subjects: "",
    area: "",
    details: "",
    daysPerWeek: "",
    status: "Approved" as const,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSave(formData);
      onClose();
      setFormData({
        guardianName: "",
        guardianPhone: "",
        studentClass: "",
        subjects: "",
        area: "",
        details: "",
        daysPerWeek: "",
        status: "Approved",
      });
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 dark:bg-black/60 z-[100] flex items-center justify-center p-2 sm:p-4 backdrop-blur-md overflow-y-auto no-scrollbar">
      <div className="bg-white dark:bg-slate-900 rounded-[32px] sm:rounded-[40px] p-5 sm:p-8 max-w-xl w-full shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] animate-in zoom-in-95 fade-in duration-300 my-2 sm:my-8 relative border border-white/20 dark:border-slate-800 max-h-[95vh] overflow-y-auto no-scrollbar">
        <div className="flex justify-between items-start mb-6 sm:mb-8">
          <div className="flex items-center gap-3 sm:gap-5">
            <div className="w-10 h-10 sm:w-14 sm:h-14 bg-emerald-600 rounded-[16px] sm:rounded-[20px] flex items-center justify-center text-white shadow-xl shadow-emerald-600/30 rotate-3 shrink-0">
              <Plus size={20} className="sm:hidden" />
              <Plus size={28} className="hidden sm:block" />
            </div>
            <div>
              <h3 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white tracking-wide uppercase leading-tight">নতুন <span className="ml-1.5 text-emerald-600 dark:text-emerald-400 italic font-serif lowercase tracking-normal">রিকোয়েস্ট</span></h3>
              <p className="text-[8px] sm:text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mt-0.5">ম্যানুয়াল এন্ট্রি ড্যাশবোর্ড</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 sm:p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all text-slate-400 hover:text-slate-900 dark:hover:text-white active:scale-90">
            <X size={18} className="sm:hidden" />
            <X size={22} className="hidden sm:block" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-1.5 sm:space-y-2">
              <label className="text-[9px] sm:text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] px-1">অভিভাবকের নাম</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-600 transition-colors">
                  <User size={16} className="sm:hidden" />
                  <User size={18} className="hidden sm:block" />
                </div>
                <input
                  required
                  type="text"
                  value={formData.guardianName}
                  onChange={(e) => setFormData({ ...formData, guardianName: e.target.value })}
                  className="w-full pl-11 sm:pl-12 pr-4 py-3 sm:py-4 bg-slate-50 dark:bg-slate-800/50 rounded-[18px] sm:rounded-[20px] border-2 border-transparent focus:border-emerald-500/20 focus:bg-white dark:focus:bg-slate-800 text-sm font-bold text-slate-800 dark:text-white outline-none transition-all shadow-sm"
                  placeholder="পুরো নাম"
                />
              </div>
            </div>

            <div className="space-y-1.5 sm:space-y-2">
              <label className="text-[9px] sm:text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] px-1">ফোন নম্বর</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-600 transition-colors">
                  <Phone size={16} className="sm:hidden" />
                  <Phone size={18} className="hidden sm:block" />
                </div>
                <input
                  required
                  type="tel"
                  value={formData.guardianPhone}
                  onChange={(e) => setFormData({ ...formData, guardianPhone: e.target.value })}
                  className="w-full pl-11 sm:pl-12 pr-4 py-3 sm:py-4 bg-slate-50 dark:bg-slate-800/50 rounded-[18px] sm:rounded-[20px] border-2 border-transparent focus:border-emerald-500/20 focus:bg-white dark:focus:bg-slate-800 text-sm font-bold text-slate-800 dark:text-white outline-none transition-all shadow-sm"
                  placeholder="ফোন নম্বর"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-1.5 sm:space-y-2">
              <label className="text-[9px] sm:text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] px-1">শ্রেণী</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-600 transition-colors">
                  <BookOpen size={16} className="sm:hidden" />
                  <BookOpen size={18} className="hidden sm:block" />
                </div>
                <input
                  required
                  type="text"
                  value={formData.studentClass}
                  onChange={(e) => setFormData({ ...formData, studentClass: e.target.value })}
                  className="w-full pl-11 sm:pl-12 pr-4 py-3 sm:py-4 bg-slate-50 dark:bg-slate-800/50 rounded-[18px] sm:rounded-[20px] border-2 border-transparent focus:border-emerald-500/20 focus:bg-white dark:focus:bg-slate-800 text-sm font-bold text-slate-800 dark:text-white outline-none transition-all shadow-sm"
                  placeholder="যেমন: ৮ম শ্রেণী"
                />
              </div>
            </div>

            <div className="space-y-1.5 sm:space-y-2">
              <label className="text-[9px] sm:text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] px-1">সপ্তাহে কয়দিন</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-600 transition-colors">
                  <Clock size={16} className="sm:hidden" />
                  <Clock size={18} className="hidden sm:block" />
                </div>
                <input
                  required
                  type="text"
                  value={formData.daysPerWeek}
                  onChange={(e) => setFormData({ ...formData, daysPerWeek: e.target.value })}
                  className="w-full pl-11 sm:pl-12 pr-4 py-3 sm:py-4 bg-slate-50 dark:bg-slate-800/50 rounded-[18px] sm:rounded-[20px] border-2 border-transparent focus:border-emerald-500/20 focus:bg-white dark:focus:bg-slate-800 text-sm font-bold text-slate-800 dark:text-white outline-none transition-all shadow-sm"
                  placeholder="যেমন: ৩ দিন"
                />
              </div>
            </div>
          </div>

          <div className="space-y-1.5 sm:space-y-2">
            <label className="text-[9px] sm:text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] px-1">এলাকা</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-600 transition-colors">
                <MapPin size={16} className="sm:hidden" />
                <MapPin size={18} className="hidden sm:block" />
              </div>
              <input
                required
                type="text"
                value={formData.area}
                onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                className="w-full pl-11 sm:pl-12 pr-4 py-3 sm:py-4 bg-slate-50 dark:bg-slate-800/50 rounded-[18px] sm:rounded-[20px] border-2 border-transparent focus:border-emerald-500/20 focus:bg-white dark:focus:bg-slate-800 text-sm font-bold text-slate-800 dark:text-white outline-none transition-all shadow-sm"
                placeholder="যেমন: ধানমন্ডি, ঢাকা"
              />
            </div>
          </div>

          <div className="space-y-1.5 sm:space-y-2">
            <label className="text-[9px] sm:text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] px-1">বিষয়সমূহ</label>
            <div className="relative group">
              <div className="absolute top-3.5 sm:top-4 left-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-600 transition-colors">
                <BookOpen size={16} className="sm:hidden" />
                <BookOpen size={18} className="hidden sm:block" />
              </div>
              <textarea
                required
                value={formData.subjects}
                onChange={(e) => setFormData({ ...formData, subjects: e.target.value })}
                className="w-full pl-11 sm:pl-12 pr-4 py-3 sm:py-4 bg-slate-50 dark:bg-slate-800/50 rounded-[20px] sm:rounded-[24px] border-2 border-transparent focus:border-emerald-500/20 focus:bg-white dark:focus:bg-slate-800 text-sm font-bold text-slate-800 dark:text-white outline-none transition-all shadow-sm min-h-[80px] sm:min-h-[100px] resize-none"
                placeholder="বিষয়গুলোর নাম লিখুন..."
              />
            </div>
          </div>

          <div className="space-y-1.5 sm:space-y-2">
            <label className="text-[9px] sm:text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] px-1">স্ট্যাটাস</label>
            <div className="flex bg-slate-100 dark:bg-slate-800/50 p-1 sm:p-1.5 rounded-[16px] sm:rounded-[20px] border border-slate-200 dark:border-slate-800">
              {(["Pending", "Approved"] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setFormData({ ...formData, status: s })}
                  className={`flex-1 py-2.5 sm:py-3 rounded-[12px] sm:rounded-[16px] text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all ${
                    formData.status === s 
                    ? "bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-[0_4px_12px_-2px_rgba(0,0,0,0.1)] scale-[1.01]" 
                    : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                  }`}
                >
                  {s === "Pending" ? "পেন্ডিং" : "অ্যাপ্রুভড"}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 sm:py-5 bg-emerald-600 text-white rounded-[20px] sm:rounded-[24px] font-black text-[9px] sm:text-[10px] uppercase tracking-[0.2em] sm:tracking-[0.3em] shadow-[0_16px_32px_-8px_rgba(5,150,105,0.4)] active:scale-[0.98] hover:bg-emerald-500 transition-all flex items-center justify-center gap-2 sm:gap-3 group"
          >
            {isSubmitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                সেভ করুন
                <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
