import React, { useState } from "react";
import { Teacher } from "../../types";
import { MessageSquare, FileText, Loader2, Save } from "lucide-react";
import { doc, updateDoc } from "firebase/firestore";
import { db, appId } from "../../lib/firebase";
import { toast } from "sonner";

interface AdminTeacherNotesProps {
  teacher: Teacher;
}

export const AdminTeacherNotes: React.FC<AdminTeacherNotesProps> = ({ teacher }) => {
  const [adminMessage, setAdminMessage] = useState(teacher.adminMessage || "");
  const [internalNote, setInternalNote] = useState(teacher.internalNote || "");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const docRef = doc(db, "artifacts", appId, "public", "data", "tc_teachers", teacher.id);
      
      const payload: Partial<Teacher> = {};
      
      // We only save if there are changes or if we want to clear them
      payload.adminMessage = adminMessage.trim();
      payload.internalNote = internalNote.trim();

      await updateDoc(docRef, payload);
      
      // Sync to public status
      import("../../lib/syncTeacherPublicStatus").then(m => m.syncTeacherPublicStatus(teacher.phone));

      toast.success("অ্যাডমিন নোট এবং মেসেজ সেভ হয়েছে।");
    } catch (error) {
      console.error("Error saving notes:", error);
      toast.error("সেভ করতে সমস্যা হয়েছে।");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm mt-4">
      <div className="flex items-center justify-between mb-4">
        <div className="text-[10px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-[0.2em] flex items-center gap-2">
          <div className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg">
            <MessageSquare size={14} className="text-slate-600 dark:text-slate-400" />
          </div>
          অ্যাডমিন প্যানেল নোটস
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving || (adminMessage.trim() === (teacher.adminMessage || "") && internalNote.trim() === (teacher.internalNote || ""))}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg text-[9px] font-black uppercase tracking-widest transition-all"
        >
          {isSaving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
          সেভ করুন
        </button>
      </div>

      <div className="space-y-4">
        {/* PUBLIC MESSAGE */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <label className="text-[9px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest">
              পাবলিক মেসেজ (Public Message)
            </label>
            <span className="text-[8px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-full border border-emerald-200/50 dark:border-emerald-800/50">
              অ্যাপ্লিক্যান্ট দেখতে পারবেন
            </span>
          </div>
          <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 leading-tight">
            এখানে যা লিখবেন তা অ্যাপ্লিক্যান্ট মোবাইল নম্বর দিয়ে স্ট্যাটাস সার্চ করলে দেখতে পারবেন। (যেমন: আপনার CV যাচাই করা হয়েছে)
          </p>
          <textarea
            value={adminMessage}
            onChange={(e) => setAdminMessage(e.target.value)}
            placeholder="অ্যাপ্লিক্যান্টের জন্য মেসেজ লিখুন..."
            className="w-full p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all text-xs font-medium text-slate-800 dark:text-slate-200 placeholder:text-slate-400 min-h-[80px]"
          />
        </div>

        {/* INTERNAL NOTE */}
        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <label className="text-[9px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest">
              ইন্টারনাল নোট (Internal Note)
            </label>
            <span className="text-[8px] font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20 px-2 py-0.5 rounded-full border border-rose-200/50 dark:border-rose-800/50">
              শুধুমাত্র অ্যাডমিন দেখতে পারবেন
            </span>
          </div>
          <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 leading-tight">
            এখানে যা লিখবেন তা কোনো অ্যাপ্লিক্যান্ট দেখতে পারবেন না। এটি শুধুমাত্র টিচার্স কর্নার অ্যাডমিনদের নিজেদের বোঝার সুবিধার জন্য।
          </p>
          <textarea
            value={internalNote}
            onChange={(e) => setInternalNote(e.target.value)}
            placeholder="অ্যাডমিনদের জন্য নোট লিখুন..."
            className="w-full p-3 bg-rose-50/30 dark:bg-rose-950/10 rounded-xl border border-rose-100 dark:border-rose-900/30 focus:bg-rose-50 dark:focus:bg-rose-950/20 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 transition-all text-xs font-medium text-slate-800 dark:text-slate-200 placeholder:text-slate-400 min-h-[80px]"
          />
        </div>
      </div>
    </div>
  );
};
