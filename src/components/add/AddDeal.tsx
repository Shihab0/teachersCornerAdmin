import { useStore } from "../../store/useStore";
import type { ChangeEvent, FormEvent } from "react";
import { Icon } from "../ui/Icon";
import { Plus, Edit, CheckCircle, PlusCircle, Trash2, ChevronDown } from "lucide-react";
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
    <div className="max-w-4xl mx-auto px-4 md:px-8 lg:px-12 py-12 fade-in">
      <div className="bg-white dark:bg-slate-900 p-10 md:p-16 rounded-[56px] card-shadow border border-slate-100 dark:border-slate-800/50 transition-all relative overflow-hidden">
        {/* Decorative Background */}
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none"></div>
        
        <div className="relative z-10">
          <h2 className="text-3xl font-black mb-12 flex items-center text-slate-950 dark:text-white uppercase tracking-tight">
            <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-[28px] flex items-center justify-center mr-6 shadow-sm border border-emerald-100 dark:border-emerald-900/20 group-hover:scale-110 transition-transform">
              <Icon icon={isEditing ? Edit : Plus} size={28} />
            </div>
            <div>
              <span className="block leading-none">{isEditing ? "আপডেট টিউশন" : "নতুন টিউশন"}</span>
              <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.4em] mt-2 block">Tuition Entry System</span>
            </div>
          </h2>

          <form onSubmit={onSubmit} className="space-y-10">
            <div className="bg-slate-50/50 dark:bg-slate-800/20 p-10 rounded-[48px] border border-slate-100 dark:border-slate-800/50 space-y-8">
              <div>
                <label className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase ml-5 mb-4 block tracking-[0.25em]">টিউশন আইডি *</label>
                <div className="flex items-center shadow-sm group">
                  <span className="bg-white dark:bg-slate-900 border border-r-0 border-slate-200 dark:border-slate-700 rounded-l-[24px] p-5 text-sm text-slate-500 font-black transition-colors group-focus-within:border-emerald-500">
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
                    className={`w-full border border-slate-200 dark:border-slate-700 rounded-r-[24px] p-5 text-sm focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 bg-white dark:bg-slate-900 dark:text-white font-bold outline-none transition-all ${
                      idError ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/20" : ""
                    }`}
                    placeholder="105"
                  />
                </div>
                {idError && <p className="text-[10px] text-rose-500 mt-3 font-bold ml-5 uppercase tracking-wider">{idError}</p>}
              </div>

              <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-6 rounded-[28px] border border-slate-200 dark:border-slate-700 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
                    <Icon icon={CheckCircle} size={18} className={formData.isTutorNotSelected ? "text-emerald-500" : "text-slate-300"} />
                  </div>
                  <span className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest">টিউটর এখনো সিলেক্ট হয়নি?</span>
                </div>
                <input
                  type="checkbox"
                  className="w-6 h-6 rounded-xl border-slate-300 dark:border-slate-600 text-emerald-600 focus:ring-emerald-500 dark:bg-slate-800 transition-all cursor-pointer"
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase ml-4 tracking-widest">টিউটরের নাম *</label>
                  <input
                    required={!formData.isTutorNotSelected}
                    disabled={formData.isTutorNotSelected}
                    name="tutorName"
                    value={formData.tutorName}
                    onChange={onInputChange}
                    className="w-full p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[24px] text-sm font-bold focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 dark:text-white disabled:opacity-50 outline-none transition-all shadow-sm"
                    placeholder="নাম লিখুন"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase ml-4 tracking-widest">টিউটরের মোবাইল *</label>
                  <input
                    required={!formData.isTutorNotSelected}
                    disabled={formData.isTutorNotSelected}
                    type="tel"
                    name="tutorPhone"
                    value={formData.tutorPhone}
                    onChange={onInputChange}
                    className="w-full p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[24px] text-sm font-bold focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 dark:text-white disabled:opacity-50 outline-none transition-all shadow-sm"
                    placeholder="01XXXXXXXXX"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase ml-4 tracking-widest">অভিভাবকের মোবাইল *</label>
                  <input
                    required
                    type="tel"
                    name="guardianPhone"
                    value={formData.guardianPhone}
                    onChange={onInputChange}
                    className="w-full p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[24px] text-sm font-bold focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 dark:text-white outline-none transition-all shadow-sm"
                    placeholder="01XXXXXXXXX"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase ml-4 tracking-widest">রেফারারের নাম</label>
                  <input
                    name="referrerName"
                    value={formData.referrerName}
                    onChange={onInputChange}
                    className="w-full p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[24px] text-sm font-bold focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 dark:text-white outline-none transition-all shadow-sm"
                    placeholder="যদি থাকে"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase ml-5 tracking-[0.2em]">ক্লাস ও বিষয়</label>
                <div className="grid grid-cols-1 gap-4">
                  <div className="relative group">
                    <select
                      required
                      name="studentClass"
                      value={formData.studentClass}
                      onChange={onInputChange}
                      className="w-full p-5 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-[24px] text-[11px] font-black text-slate-800 dark:text-slate-200 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 appearance-none transition-all uppercase tracking-widest shadow-sm"
                    >
                      <option value="" disabled>ক্লাস সিলেক্ট করুন *</option>
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
                    <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none">
                      <ChevronDown size={18} className="text-slate-400" />
                    </div>
                  </div>
                  <input
                    required
                    name="subjects"
                    value={formData.subjects}
                    onChange={onInputChange}
                    className="w-full p-5 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-[24px] text-[11px] font-black text-slate-800 dark:text-slate-200 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all uppercase tracking-widest shadow-sm"
                    placeholder="বিষয় লিখুন *"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase ml-5 tracking-[0.2em]">স্যালারি ও লোকেশন</label>
                <div className="grid grid-cols-1 gap-4">
                  <input
                    name="salary"
                    value={formData.salary}
                    onChange={onInputChange}
                    className="w-full p-5 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-[24px] text-[11px] font-black text-slate-800 dark:text-slate-200 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all uppercase tracking-widest shadow-sm"
                    placeholder="স্যালারি (উদা: ৫০০০)"
                  />
                  <input
                    name="location"
                    value={formData.location}
                    onChange={onInputChange}
                    className="w-full p-5 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-[24px] text-[11px] font-black text-slate-800 dark:text-slate-200 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all uppercase tracking-widest shadow-sm"
                    placeholder="লোকেশন (উদা: হারুয়া)"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase ml-5 tracking-[0.2em]">টিউটর ডিটেইলস</label>
                <div className="grid grid-cols-1 gap-4">
                  <div className="relative group">
                    <select
                      name="tutorGender"
                      value={formData.tutorGender}
                      onChange={onInputChange}
                      className="w-full p-5 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-[24px] text-[11px] font-black text-slate-800 dark:text-slate-200 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 appearance-none transition-all uppercase tracking-widest shadow-sm"
                    >
                      <option value="Any">উভয় (Any)</option>
                      <option value="Male">পুরুষ (Male)</option>
                      <option value="Female">মহিলা (Female)</option>
                    </select>
                    <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none">
                      <ChevronDown size={18} className="text-slate-400" />
                    </div>
                  </div>
                  <input
                    name="weeklyDays"
                    value={formData.weeklyDays}
                    onChange={onInputChange}
                    className="w-full p-5 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-[24px] text-[11px] font-black text-slate-800 dark:text-slate-200 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all uppercase tracking-widest shadow-sm"
                    placeholder="সপ্তাহে কত দিন (উদা: ৩)"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase ml-5 tracking-[0.2em]">কমিশন ও আদায়</label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[8px] font-black text-slate-400 uppercase ml-3 mb-1 block tracking-widest">কমিশন (৳) *</label>
                    <input
                      required
                      type="number"
                      name="commission"
                      value={formData.commission}
                      onChange={onInputChange}
                      className="w-full p-5 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-[24px] text-sm font-black text-emerald-600 dark:text-emerald-400 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all shadow-sm"
                      placeholder="কমিশন"
                    />
                  </div>
                  <div>
                    <label className="text-[8px] font-black text-slate-400 uppercase ml-3 mb-1 block tracking-widest">আদায়কৃত (৳)</label>
                    <input
                      type="number"
                      name="paidAmount"
                      value={formData.paidAmount}
                      onChange={onInputChange}
                      className="w-full p-5 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-[24px] text-sm font-black text-blue-600 dark:text-blue-400 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm"
                      placeholder="আদায়"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase ml-5 tracking-[0.2em]">ম্যানেজমেন্ট</label>
                <div className="relative group">
                  <select
                    required
                    name="adminName"
                    value={formData.adminName}
                    onChange={onInputChange}
                    className="w-full p-5 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-[24px] text-[11px] font-black text-slate-800 dark:text-slate-200 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 appearance-none transition-all uppercase tracking-widest shadow-sm"
                  >
                    <option value="" disabled>ম্যানেজমেন্ট *</option>
                    <option value="Dipu">Dipu</option>
                    <option value="Shimanto">Shimanto</option>
                  </select>
                  <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none">
                    <ChevronDown size={18} className="text-slate-400" />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-500 uppercase ml-5 tracking-[0.2em]">অতিরিক্ত নোট</label>
              <textarea
                name="details"
                value={formData.details}
                onChange={onInputChange}
                className="w-full p-5 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-[24px] text-[11px] font-black text-slate-800 dark:text-slate-200 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all uppercase tracking-widest shadow-sm min-h-[100px]"
                placeholder="অন্যান্য তথ্য লিখুন..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-500 uppercase ml-5 tracking-[0.2em]">তারিখ সমূহ</label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase ml-4 mb-2 block tracking-widest">সিলেক্টের তারিখ *</label>
                    <input
                      required
                      type="date"
                      name="selectionDate"
                      value={formData.selectionDate}
                      onChange={onInputChange}
                      className="w-full p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-[20px] text-xs font-bold text-slate-800 dark:text-slate-200 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase ml-4 mb-2 block tracking-widest">কনফার্মের তারিখ</label>
                    <input
                      type="date"
                      name="confirmDate"
                      value={formData.confirmDate}
                      onChange={onInputChange}
                      className="w-full p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-[20px] text-xs font-bold text-slate-800 dark:text-slate-200 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all shadow-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-500 uppercase ml-5 tracking-[0.2em]">স্ট্যাটাস আপডেট</label>
                <div className="grid grid-cols-2 gap-4 p-4 bg-emerald-50/30 dark:bg-emerald-900/10 rounded-[32px] border border-emerald-100/50 dark:border-emerald-900/20">
                  <div>
                    <label className="text-[8px] font-black text-emerald-500 dark:text-emerald-400 uppercase ml-3 mb-2 block tracking-widest">টিউশন</label>
                    <select
                      name="tuitionStatus"
                      value={formData.tuitionStatus}
                      onChange={onInputChange}
                      className="w-full p-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-[9px] font-black text-slate-800 dark:text-slate-200 outline-none appearance-none uppercase tracking-widest shadow-sm"
                    >
                      <option value="Processing">Processing</option>
                      <option value="Running">Running</option>
                      <option value="Confirmed">Confirmed</option>
                      <option value="Rejected">Rejected</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[8px] font-black text-emerald-500 dark:text-emerald-400 uppercase ml-3 mb-2 block tracking-widest">কমিশন</label>
                    <select
                      name="commissionStatus"
                      value={formData.commissionStatus}
                      onChange={onInputChange}
                      className="w-full p-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-[9px] font-black text-slate-800 dark:text-slate-200 outline-none appearance-none uppercase tracking-widest shadow-sm"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Paid">Paid</option>
                      <option value="Free">Free</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex space-x-5 pt-8">
              {isEditing && (
                <button
                  type="button"
                  onClick={onDelete}
                  className="w-20 h-20 bg-rose-50 dark:bg-rose-900/20 text-rose-500 dark:text-rose-400 rounded-[32px] flex items-center justify-center active:scale-95 transition-all border border-rose-100 dark:border-rose-900/20 hover:bg-rose-100 dark:hover:bg-rose-900/30 shadow-sm"
                >
                  <Icon icon={Trash2} size={28} />
                </button>
              )}
              {isEditing && (
                <button
                  type="button"
                  onClick={onCancel}
                  className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-black rounded-[32px] text-[11px] uppercase tracking-[0.2em] active:scale-95 transition-all border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 shadow-sm"
                >
                  বাতিল
                </button>
              )}
              <button
                type="submit"
                disabled={isProcessing}
                className={`flex-[3] h-20 ${
                  isEditing ? "bg-emerald-600 shadow-emerald-500/20" : "bg-slate-950 dark:bg-white text-white dark:text-slate-950 shadow-slate-950/20 dark:shadow-white/10"
                } font-black rounded-[32px] shadow-2xl active:scale-[0.98] transition-all flex items-center justify-center text-xs uppercase tracking-[0.3em] disabled:opacity-50`}
              >
                {isProcessing ? (
                  <div className="w-6 h-6 border-2 border-current border-t-transparent rounded-full animate-spin mr-4" />
                ) : (
                  <Icon icon={isEditing ? CheckCircle : PlusCircle} size={22} className="mr-4" />
                )}
                {isEditing ? "আপডেট করুন" : "সেভ করুন"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
