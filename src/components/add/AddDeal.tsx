import { useStore } from "../../store/useStore";
import type { ChangeEvent, FormEvent } from "react";
import { Icon } from "../ui/Icon";
import { Plus, Edit, CheckCircle, PlusCircle, Trash2 } from "lucide-react";
import { Deal } from "../../types";

interface AddDealProps {
  isEditing: boolean;
  formData: any;
  onInputChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  setFormData: (data: any) => void;
  idError: string;
  setIdError: (err: string) => void;
  onSubmit: (e: FormEvent) => void;
  onDelete: () => void;
  onCancel: () => void;
}

export const AddDeal = ({
  isEditing,
  formData,
  onInputChange,
  setFormData,
  idError,
  setIdError,
  onSubmit,
  onDelete,
  onCancel,
}: AddDealProps) => {
  const { isProcessing } = useStore();
  return (
    <div className="bg-white dark:bg-slate-900 p-8 rounded-[40px] card-shadow border border-slate-100 dark:border-slate-800/50 transition-all fade-in">
      <h2 className="text-xl font-black mb-8 flex items-center text-slate-800 dark:text-white uppercase tracking-tight">
        <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mr-4 shadow-sm border border-emerald-100 dark:border-emerald-900/20">
          <Icon icon={isEditing ? Edit : Plus} size={22} />
        </div>
        {isEditing ? "আপডেট টিউশন" : "নতুন টিউশন"}
      </h2>
      <form onSubmit={onSubmit} className="space-y-6">
        <div className="bg-slate-50 dark:bg-slate-800/30 p-6 rounded-[32px] border border-slate-100 dark:border-slate-800/50 space-y-5">
          <div>
            <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase ml-3 mb-2 block tracking-widest">টিউশন আইডি *</label>
            <div className="flex items-center shadow-sm group">
              <span className="bg-white dark:bg-slate-900 border border-r-0 border-slate-200 dark:border-slate-700 rounded-l-2xl p-4 text-sm text-slate-500 font-black transition-colors group-focus-within:border-emerald-500">
                TC-
              </span>
              <input
                required
                name="tuitionId"
                value={formData.tuitionId}
                onChange={(e) => {
                  onInputChange(e);
                  setIdError("");
                }}
                className={`w-full border border-slate-200 dark:border-slate-700 rounded-r-2xl p-4 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white dark:bg-slate-900 dark:text-white font-bold outline-none transition-all ${
                  idError ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/20" : ""
                }`}
                placeholder="105"
              />
            </div>
            {idError && <p className="text-[10px] text-rose-500 mt-2 font-bold ml-3 uppercase tracking-wider">{idError}</p>}
          </div>

          <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">টিউটর এখনো সিলেক্ট হয়নি?</span>
            <input
              type="checkbox"
              className="w-5 h-5 rounded-lg border-slate-300 dark:border-slate-600 text-emerald-600 focus:ring-emerald-500 dark:bg-slate-800 transition-all cursor-pointer"
              checked={formData.isTutorNotSelected}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  isTutorNotSelected: e.target.checked,
                  tutorName: e.target.checked ? "এখনো সিলেক্ট হয়নি" : "",
                })
              }
            />
          </div>

          <div className="space-y-4">
            <input
              required={!formData.isTutorNotSelected}
              disabled={formData.isTutorNotSelected}
              name="tutorName"
              value={formData.tutorName}
              onChange={onInputChange}
              className="w-full p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 dark:text-white disabled:opacity-50 outline-none transition-all"
              placeholder="টিউটরের নাম *"
            />
            <input
              required={!formData.isTutorNotSelected}
              disabled={formData.isTutorNotSelected}
              type="tel"
              name="tutorPhone"
              value={formData.tutorPhone}
              onChange={onInputChange}
              className="w-full p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 dark:text-white disabled:opacity-50 outline-none transition-all"
              placeholder="টিউটরের মোবাইল *"
            />
            <input
              required
              type="tel"
              name="guardianPhone"
              value={formData.guardianPhone}
              onChange={onInputChange}
              className="w-full p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 dark:text-white outline-none transition-all"
              placeholder="অভিভাবকের মোবাইল *"
            />
            <input
              name="referrerName"
              value={formData.referrerName}
              onChange={onInputChange}
              className="w-full p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 dark:text-white outline-none transition-all"
              placeholder="রেফারারের নাম (যদি থাকে)"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="relative group">
            <select
              required
              name="studentClass"
              value={formData.studentClass}
              onChange={onInputChange}
              className="w-full p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl text-[11px] font-black text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 appearance-none transition-all uppercase tracking-widest"
            >
              <option value="" disabled>
                ক্লাস সিলেক্ট করুন *
              </option>
              <option value="Pre-School">Pre-School</option>
              <option value="Class 1">Class 1</option>
              <option value="Class 2">Class 2</option>
              <option value="Class 3">Class 3</option>
              <option value="Class 4">Class 4</option>
              <option value="Class 5">Class 5</option>
              <option value="Class 6">Class 6</option>
              <option value="Class 7">Class 7</option>
              <option value="Class 8">Class 8</option>
              <option value="Class 9">Class 9</option>
              <option value="Class 10">Class 10</option>
              <option value="SSC">SSC / Dakhil</option>
              <option value="Class 11">Class 11</option>
              <option value="Class 12">Class 12</option>
              <option value="HSC">HSC / Alim</option>
              <option value="O-Level">O-Level</option>
              <option value="A-Level">A-Level</option>
              <option value="Admission">Admission</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <input
            required
            name="details"
            value={formData.details}
            onChange={onInputChange}
            className="w-full p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl text-[11px] font-black text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all uppercase tracking-widest"
            placeholder="বিষয় *"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="relative group">
            <input
              required
              type="number"
              name="commission"
              value={formData.commission}
              onChange={onInputChange}
              className="w-full p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm font-black text-emerald-600 dark:text-emerald-400 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              placeholder="কমিশন (৳) *"
            />
          </div>
          <select
            required
            name="adminName"
            value={formData.adminName}
            onChange={onInputChange}
            className="w-full p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl text-[11px] font-black text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 appearance-none transition-all uppercase tracking-widest"
          >
            <option value="" disabled>
              ম্যানেজমেন্ট *
            </option>
            <option value="Dipu">Dipu</option>
            <option value="Shimanto">Shimanto</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase ml-3 mb-2 block tracking-widest">সিলেক্টের তারিখ *</label>
            <input
              required
              type="date"
              name="selectionDate"
              value={formData.selectionDate}
              onChange={onInputChange}
              className="w-full p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl text-xs font-bold text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
          </div>
          <div>
            <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase ml-3 mb-2 block tracking-widest">কনফার্মের তারিখ</label>
            <input
              type="date"
              name="confirmDate"
              value={formData.confirmDate}
              onChange={onInputChange}
              className="w-full p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl text-xs font-bold text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 p-5 bg-emerald-50/30 dark:bg-emerald-900/10 rounded-[28px] border border-emerald-100/50 dark:border-emerald-900/20">
          <div>
            <label className="text-[9px] font-black text-emerald-500 dark:text-emerald-400 uppercase ml-3 mb-2 block tracking-widest">টিউশন স্ট্যাটাস</label>
            <select
              name="tuitionStatus"
              value={formData.tuitionStatus}
              onChange={onInputChange}
              className="w-full p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-[10px] font-black text-slate-800 dark:text-slate-200 outline-none appearance-none uppercase tracking-widest"
            >
              <option value="Processing">Processing</option>
              <option value="Running">Running</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Rejected">Rejected</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
          <div>
            <label className="text-[9px] font-black text-emerald-500 dark:text-emerald-400 uppercase ml-3 mb-2 block tracking-widest">কমিশন স্ট্যাটাস</label>
            <select
              name="commissionStatus"
              value={formData.commissionStatus}
              onChange={onInputChange}
              className="w-full p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-[10px] font-black text-slate-800 dark:text-slate-200 outline-none appearance-none uppercase tracking-widest"
            >
              <option value="Pending">Pending</option>
              <option value="Paid">Paid</option>
              <option value="Free">Free</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>

        <div className="flex space-x-4 pt-4">
          {isEditing && (
            <button
              type="button"
              onClick={onDelete}
              className="w-16 bg-rose-50 dark:bg-rose-900/20 text-rose-500 dark:text-rose-400 rounded-2xl flex items-center justify-center active:scale-95 transition-all border border-rose-100 dark:border-rose-900/20 hover:bg-rose-100 dark:hover:bg-rose-900/30"
            >
              <Icon icon={Trash2} size={22} />
            </button>
          )}
          {isEditing && (
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-black rounded-2xl text-[11px] uppercase tracking-widest active:scale-95 transition-all border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700"
            >
              বাতিল
            </button>
          )}
          <button
            type="submit"
            disabled={isProcessing}
            className={`flex-[2] ${
              isEditing ? "bg-emerald-600 shadow-emerald-500/20" : "bg-slate-900 dark:bg-emerald-600 shadow-slate-900/20 dark:shadow-emerald-500/20"
            } text-white font-black py-5 rounded-2xl shadow-2xl active:scale-[0.98] transition-all flex items-center justify-center text-xs uppercase tracking-[0.2em] disabled:opacity-50`}
          >
            {isProcessing ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3" />
            ) : (
              <Icon icon={isEditing ? CheckCircle : PlusCircle} size={18} className="mr-3" />
            )}
            {isEditing ? "আপডেট করুন" : "সেভ করুন"}
          </button>
        </div>
      </form>
    </div>
  );
};
