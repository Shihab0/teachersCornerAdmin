import React, { useState } from "react";
import { X, User, Phone, MapPin, BookOpen, Heart, Send, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";

const KISHOREGANJ_AREAS = [
  "Harua (হারুয়া)", "Rathkhola (রথখোলা)", "Gaital (গাইট্যাল)", "Botrish (বত্রিশ)",
  "Akhrakhabazar (আখড়াবাজার)", "Boro Bazar (বড় বাজার)", "Nilganj (নীলগঞ্জ)",
  "Puran Thana (পুরান থানা)", "Tarapasha (তারা পাশা)", "Yashodal (যশোদল)",
  "Haybatnagar (হায়বতনগর)", "Ukilpara (উকিলপাড়া)", "Shikkok Polli (শিক্ষক পল্লী)",
  "Borpul (বড়পুল)", "Newtown (নিউটাউন)", "Others (অন্যান্য)"
];

interface GuardianModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
}

export const GuardianModal: React.FC<GuardianModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [formData, setFormData] = useState({
    guardianName: "",
    guardianPhone: "",
    studentClass: "",
    subjects: "",
    area: "",
    details: "",
    daysPerWeek: "",
  });

  const [customArea, setCustomArea] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (!/^01\d{9}$/.test(formData.guardianPhone)) {
        toast.error("সঠিক ফোন নম্বর দিন (১১ ডিজিট, ০১ দিয়ে শুরু)");
        setIsSubmitting(false);
        return;
      }
      const finalArea = formData.area === "Others (অন্যান্য)" ? customArea : formData.area;
      await onSubmit({
        ...formData,
        area: finalArea,
      });
      setSubmitSuccess(true);
      setTimeout(() => {
        setSubmitSuccess(false);
        onClose();
        setFormData({
          guardianName: "",
          guardianPhone: "",
          studentClass: "",
          subjects: "",
          area: "",
          details: "",
          daysPerWeek: "",
        });
        setCustomArea("");
      }, 2000);
    } catch (error) {
      console.error("Error submitting request:", error);
      alert("অনুরোধ জমা দিতে সমস্যা হয়েছে। আবার চেষ্টা করুন।");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-white w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden relative"
      >
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-emerald-600">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 text-white rounded-2xl flex items-center justify-center">
              <Heart className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-black text-white tracking-tight">টিউটর রিকোয়েস্ট</h3>
              <p className="text-[10px] font-bold text-emerald-50 uppercase tracking-widest">অভিভাবকদের জন্য</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X size={20} className="text-white" />
          </button>
        </div>

        {submitSuccess ? (
          <div className="p-12 text-center animate-in fade-in zoom-in duration-500">
            <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-[32px] flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">সফলভাবে জমা হয়েছে!</h3>
            <p className="text-slate-500 dark:text-slate-400 font-medium">আমরা শীঘ্রই আপনার সাথে যোগাযোগ করব।</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto no-scrollbar bg-white dark:bg-slate-900">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">অভিভাবকের নাম *</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-400 w-5 h-5" />
                <input 
                  required 
                  type="text" 
                  value={formData.guardianName} 
                  onChange={(e) => setFormData({ ...formData, guardianName: e.target.value })} 
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50/50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-800 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 shadow-sm transition-all text-sm font-medium text-slate-800 dark:text-slate-200 placeholder:text-slate-400" 
                  placeholder="আপনার নাম লিখুন" 
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">ফোন নম্বর *</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-400 w-5 h-5" />
                <input 
                  required 
                  type="tel" 
                  value={formData.guardianPhone} 
                  onChange={(e) => setFormData({ ...formData, guardianPhone: e.target.value })} 
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50/50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-800 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 shadow-sm transition-all text-sm font-medium text-slate-800 dark:text-slate-200 placeholder:text-slate-400" 
                  placeholder="আপনার ফোন নম্বর" 
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">ছাত্র/ছাত্রীর ক্লাস *</label>
                <input 
                  required 
                  type="text" 
                  value={formData.studentClass} 
                  onChange={(e) => setFormData({ ...formData, studentClass: e.target.value })} 
                  className="w-full px-4 py-3.5 bg-slate-50/50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-800 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 shadow-sm transition-all text-sm font-medium text-slate-800 dark:text-slate-200 placeholder:text-slate-400" 
                  placeholder="উদা: ৯ম শ্রেণী" 
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">সপ্তাহে কতদিন *</label>
                <select 
                  required 
                  value={formData.daysPerWeek} 
                  onChange={(e) => setFormData({ ...formData, daysPerWeek: e.target.value })} 
                  className="w-full px-4 py-3.5 bg-slate-50/50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-800 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 shadow-sm transition-all text-sm font-medium text-slate-800 dark:text-slate-200 appearance-none"
                >
                  <option value="">দিন নির্বাচন করুন</option>
                  <option value="২ দিন">২ দিন</option>
                  <option value="৩ দিন">৩ দিন</option>
                  <option value="৪ দিন">৪ দিন</option>
                  <option value="৫ দিন">৫ দিন</option>
                  <option value="৬ দিন">৬ দিন</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">বিষয়সমূহ *</label>
              <div className="relative">
                <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-400 w-5 h-5" />
                <input 
                  required 
                  type="text" 
                  value={formData.subjects} 
                  onChange={(e) => setFormData({ ...formData, subjects: e.target.value })} 
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50/50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-800 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 shadow-sm transition-all text-sm font-medium text-slate-800 dark:text-slate-200 placeholder:text-slate-400" 
                  placeholder="উদা: গণিত, ইংরেজি" 
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">এলাকা *</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-400 w-5 h-5" />
                <select 
                  required 
                  value={formData.area} 
                  onChange={(e) => setFormData({ ...formData, area: e.target.value })} 
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50/50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-800 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 shadow-sm transition-all text-sm font-medium text-slate-800 dark:text-slate-200 appearance-none"
                >
                  <option value="">এলাকা নির্বাচন করুন</option>
                  {KISHOREGANJ_AREAS.map(area => <option key={area} value={area}>{area}</option>)}
                </select>
              </div>
              {formData.area === "Others (অন্যান্য)" && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2"
                >
                  <input 
                    required 
                    type="text" 
                    value={customArea} 
                    onChange={(e) => setCustomArea(e.target.value)} 
                    className="w-full px-4 py-3.5 bg-slate-50/50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-800 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 shadow-sm transition-all text-sm font-medium text-slate-800 dark:text-slate-200 placeholder:text-slate-400" 
                    placeholder="আপনার এলাকার নাম লিখুন" 
                  />
                </motion.div>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">বিস্তারিত (অপশনাল)</label>
              <textarea 
                value={formData.details} 
                onChange={(e) => setFormData({ ...formData, details: e.target.value })} 
                className="w-full px-4 py-3.5 bg-slate-50/50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-800 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 shadow-sm transition-all text-sm font-medium text-slate-800 dark:text-slate-200 placeholder:text-slate-400 min-h-[100px]" 
                placeholder="অন্যান্য কোনো তথ্য থাকলে লিখুন..." 
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-emerald-600 text-white rounded-[24px] font-black text-sm uppercase tracking-widest shadow-xl shadow-emerald-100 dark:shadow-none active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  রিকোয়েস্ট জমা দিন
                </>
              )}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
};
