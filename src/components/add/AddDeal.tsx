import type { ChangeEvent, FormEvent } from "react";
import { Icon } from "../ui/Icon";
import { Plus, Edit, CheckCircle, PlusCircle, Trash2 } from "lucide-react";
import { Deal } from "../../types";

interface AddDealProps {
  isEditing: boolean;
  formData: any;
  handleInputChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  setFormData: (data: any) => void;
  idError: string;
  setIdError: (err: string) => void;
  onSubmit: (e: FormEvent) => void;
  onDelete: () => void;
  onCancel: () => void;
  isProcessing?: boolean;
}

export const AddDeal = ({
  isEditing,
  formData,
  handleInputChange,
  setFormData,
  idError,
  setIdError,
  onSubmit,
  onDelete,
  onCancel,
  isProcessing = false,
}: AddDealProps) => {
  return (
    <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 fade-in">
      <h2 className="text-xl font-black mb-6 flex items-center text-gray-800">
        <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mr-3">
          <Icon icon={isEditing ? Edit : Plus} size={20} />
        </div>
        {isEditing ? "আপডেট টিউশন" : "নতুন টিউশন"}
      </h2>
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-4">
          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase ml-2 mb-1 block">টিউশন আইডি *</label>
            <div className="flex items-center shadow-sm">
              <span className="bg-white border border-r-0 border-gray-200 rounded-l-2xl p-3.5 text-sm text-gray-500 font-black">
                TC-
              </span>
              <input
                required
                name="tuitionId"
                value={formData.tuitionId}
                onChange={(e) => {
                  handleInputChange(e);
                  setIdError("");
                }}
                className={`w-full border border-gray-200 rounded-r-2xl p-3.5 text-sm focus:ring-2 focus:ring-indigo-500 bg-white font-bold outline-none ${
                  idError ? "border-red-500" : ""
                }`}
                placeholder="105"
              />
            </div>
            {idError && <p className="text-[10px] text-red-500 mt-1 font-bold ml-2">{idError}</p>}
          </div>

          <div className="flex justify-between items-center bg-white p-3 rounded-2xl border border-gray-200 shadow-sm">
            <span className="text-xs font-bold text-gray-700">টিউটর এখনো সিলেক্ট হয়নি?</span>
            <input
              type="checkbox"
              className="w-5 h-5 rounded"
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

          <input
            required={!formData.isTutorNotSelected}
            disabled={formData.isTutorNotSelected}
            name="tutorName"
            value={formData.tutorName}
            onChange={handleInputChange}
            className="w-full p-4 bg-white border border-gray-200 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 outline-none"
            placeholder="টিউটরের নাম *"
          />
          <input
            required={!formData.isTutorNotSelected}
            disabled={formData.isTutorNotSelected}
            type="tel"
            name="tutorPhone"
            value={formData.tutorPhone}
            onChange={handleInputChange}
            className="w-full p-4 bg-white border border-gray-200 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 outline-none"
            placeholder="টিউটরের মোবাইল *"
          />
          <input
            required
            type="tel"
            name="guardianPhone"
            value={formData.guardianPhone}
            onChange={handleInputChange}
            className="w-full p-4 bg-white border border-gray-200 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
            placeholder="অভিভাবকের মোবাইল *"
          />
          <input
            name="referrerName"
            value={formData.referrerName}
            onChange={handleInputChange}
            className="w-full p-4 bg-white border border-gray-200 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
            placeholder="রেফারারের নাম (যদি থাকে)"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <select
            required
            name="studentClass"
            value={formData.studentClass}
            onChange={handleInputChange}
            className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500"
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
          <input
            required
            name="details"
            value={formData.details}
            onChange={handleInputChange}
            className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="বিষয় *"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <input
            required
            type="number"
            name="commission"
            value={formData.commission}
            onChange={handleInputChange}
            className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-black text-indigo-700 outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="কমিশন (৳) *"
          />
          <select
            required
            name="adminName"
            value={formData.adminName}
            onChange={handleInputChange}
            className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl text-xs font-black outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="" disabled>
              ম্যানেজমেন্ট *
            </option>
            <option value="Dipu">Dipu</option>
            <option value="Shimanto">Shimanto</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[9px] font-black text-gray-400 uppercase ml-2 mb-1 block">সিলেক্টের তারিখ *</label>
            <input
              required
              type="date"
              name="selectionDate"
              value={formData.selectionDate}
              onChange={handleInputChange}
              className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="text-[9px] font-black text-gray-400 uppercase ml-2 mb-1 block">কনফার্মের তারিখ</label>
            <input
              type="date"
              name="confirmDate"
              value={formData.confirmDate}
              onChange={handleInputChange}
              className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 p-3 bg-indigo-50/30 rounded-2xl border border-indigo-50">
          <div>
            <label className="text-[9px] font-black text-indigo-400 uppercase ml-2 mb-1 block">টিউশন স্ট্যাটাস</label>
            <select
              name="tuitionStatus"
              value={formData.tuitionStatus}
              onChange={handleInputChange}
              className="w-full p-3 bg-white border border-gray-200 rounded-xl text-xs font-bold outline-none"
            >
              <option value="Processing">Processing</option>
              <option value="Running">Running</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Rejected">Rejected</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
          <div>
            <label className="text-[9px] font-black text-indigo-400 uppercase ml-2 mb-1 block">কমিশন স্ট্যাটাস</label>
            <select
              name="commissionStatus"
              value={formData.commissionStatus}
              onChange={handleInputChange}
              className="w-full p-3 bg-white border border-gray-200 rounded-xl text-xs font-bold outline-none"
            >
              <option value="Pending">Pending</option>
              <option value="Paid">Paid</option>
              <option value="Free">Free</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>

        <div className="flex space-x-3 pt-2">
          {isEditing && (
            <button
              type="button"
              onClick={onDelete}
              className="w-14 bg-red-100 text-red-500 rounded-2xl flex items-center justify-center active:scale-95 transition-transform"
            >
              <Icon icon={Trash2} size={20} />
            </button>
          )}
          {isEditing && (
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-gray-100 text-gray-600 font-black rounded-2xl text-xs active:scale-95 transition-transform"
            >
              বাতিল
            </button>
          )}
          <button
            type="submit"
            disabled={isProcessing}
            className={`flex-[2] ${
              isEditing ? "bg-emerald-600 shadow-emerald-200" : "bg-indigo-600 shadow-indigo-200"
            } text-white font-black py-4 rounded-2xl shadow-xl active:scale-95 transition-transform flex items-center justify-center text-sm disabled:opacity-50`}
          >
            {isProcessing ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
            ) : (
              <Icon icon={isEditing ? CheckCircle : PlusCircle} size={18} className="mr-2" />
            )}
            {isEditing ? "আপডেট করুন" : "সেভ করুন"}
          </button>
        </div>
      </form>
    </div>
  );
};
