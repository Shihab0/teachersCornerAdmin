import React, { useState } from "react";
import { Icon } from "../ui/Icon";
import { Plus, X, User, Phone, Hash, Book, Calendar, DollarSign, MapPin, Info, Users } from "lucide-react";
import { cn } from "../../lib/utils";

interface ManualEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (data: any) => void;
}

export const ManualEntryModal = ({ isOpen, onClose, onAdd }: ManualEntryModalProps) => {
  const [formData, setFormData] = useState({
    tuitionId: "",
    guardianPhone: "",
    studentClass: "",
    subjects: "",
    weeklyDays: "",
    salary: "",
    location: "",
    tutorGender: "Any",
    details: "",
    adminName: "Dipu",
    commission: "",
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      ...formData,
      commission: Number(formData.commission) || 0,
      tutorName: "এখনো সিলেক্ট হয়নি",
      tutorPhone: "",
      referrerName: "Manual Entry",
      selectionDate: new Date().toISOString().split("T")[0],
      confirmDate: "",
      tuitionStatus: "Processing",
      commissionStatus: "Pending",
      collectedBy: null,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      history: [{ date: new Date().toISOString(), log: "ম্যানুয়ালি এন্ট্রি করা হয়েছে" }],
    });
    onClose();
    setFormData({
      tuitionId: "",
      guardianPhone: "",
      studentClass: "",
      subjects: "",
      weeklyDays: "",
      salary: "",
      location: "",
      tutorGender: "Any",
      details: "",
      adminName: "Dipu",
      commission: "",
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-[40px] p-8 max-w-lg w-full shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto no-scrollbar">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl mr-4">
              <Icon icon={Plus} size={24} className="text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-800 dark:text-white">ম্যানুয়াল এন্ট্রি</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">নতুন টিউশন রিকোয়েস্ট যোগ করুন</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-400">
            <Icon icon={X} size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">টিউশন আইডি</label>
              <div className="relative">
                <Icon icon={Hash} size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  required
                  name="tuitionId"
                  value={formData.tuitionId}
                  onChange={handleChange}
                  placeholder="TC_116"
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all dark:text-white"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">অভিভাবকের ফোন</label>
              <div className="relative">
                <Icon icon={Phone} size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  required
                  name="guardianPhone"
                  value={formData.guardianPhone}
                  onChange={handleChange}
                  placeholder="017..."
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all dark:text-white"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">ক্লাস</label>
              <div className="relative">
                <Icon icon={Users} size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  required
                  name="studentClass"
                  value={formData.studentClass}
                  onChange={handleChange}
                  placeholder="Class 8"
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all dark:text-white"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">বিষয়সমূহ</label>
              <div className="relative">
                <Icon icon={Book} size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  required
                  name="subjects"
                  value={formData.subjects}
                  onChange={handleChange}
                  placeholder="All Subjects"
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all dark:text-white"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">সপ্তাহে কতদিন</label>
              <div className="relative">
                <Icon icon={Calendar} size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  required
                  name="weeklyDays"
                  value={formData.weeklyDays}
                  onChange={handleChange}
                  placeholder="3 days"
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all dark:text-white"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">স্যালারি</label>
              <div className="relative">
                <Icon icon={DollarSign} size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  required
                  name="salary"
                  value={formData.salary}
                  onChange={handleChange}
                  placeholder="5000"
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all dark:text-white"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">লোকেশন</label>
              <div className="relative">
                <Icon icon={MapPin} size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  required
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="Mirpur 10"
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all dark:text-white"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">টিউটর জেন্ডার</label>
              <div className="relative">
                <Icon icon={User} size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <select
                  name="tutorGender"
                  value={formData.tutorGender}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all dark:text-white appearance-none"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Any">Any</option>
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">ম্যানেজমেন্ট</label>
              <div className="relative">
                <Icon icon={User} size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <select
                  name="adminName"
                  value={formData.adminName}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all dark:text-white appearance-none"
                >
                  <option value="Dipu">Dipu</option>
                  <option value="Shimanto">Shimanto</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">কমিশন (৳)</label>
              <div className="relative">
                <Icon icon={DollarSign} size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  required
                  type="number"
                  name="commission"
                  value={formData.commission}
                  onChange={handleChange}
                  placeholder="2000"
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all dark:text-white"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">অতিরিক্ত তথ্য</label>
            <div className="relative">
              <Icon icon={Info} size={18} className="absolute left-4 top-4 text-slate-400" />
              <textarea
                name="details"
                value={formData.details}
                onChange={handleChange}
                placeholder="অন্যান্য তথ্য..."
                rows={3}
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all dark:text-white resize-none"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-5 bg-emerald-600 text-white rounded-[24px] font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-emerald-600/20 active:scale-[0.98] transition-all mt-4"
          >
            এন্ট্রি করুন
          </button>
        </form>
      </div>
    </div>
  );
};
