import React, { useState } from "react";
import { X, User, Phone, School, BookOpen, MapPin, Star, Check } from "lucide-react";
import { Icon } from "../ui/Icon";
import { Teacher } from "../../types";

interface TeacherModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (teacher: Partial<Teacher>) => void;
}

export const TeacherModal: React.FC<TeacherModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    institution: "",
    department: "",
    area: "",
    canTeachHSC: false,
    isMedical: false,
    rating: "5.0",
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      ...formData,
      rating: parseFloat(formData.rating),
      createdAt: Date.now(),
    });
    setFormData({
      name: "",
      phone: "",
      institution: "",
      department: "",
      area: "",
      canTeachHSC: false,
      isMedical: false,
      rating: "5.0",
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-[40px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-indigo-50/30">
          <h3 className="text-xl font-black text-indigo-900 tracking-tight">নতুন শিক্ষক যোগ করুন</h3>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-full transition-colors">
            <X size={20} className="text-indigo-900" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">নাম</label>
            <div className="relative">
              <Icon icon={User} size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400" />
              <input
                required
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-indigo-500/20 font-bold text-sm"
                placeholder="শিক্ষকের নাম"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">ফোন</label>
              <div className="relative">
                <Icon icon={Phone} size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400" />
                <input
                  required
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-indigo-500/20 font-bold text-sm"
                  placeholder="ফোন নম্বর"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">রেটিং</label>
              <div className="relative">
                <Icon icon={Star} size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400" />
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  value={formData.rating}
                  onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-indigo-500/20 font-bold text-sm"
                />
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">প্রতিষ্ঠান</label>
            <div className="relative">
              <Icon icon={School} size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400" />
              <input
                required
                type="text"
                value={formData.institution}
                onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-indigo-500/20 font-bold text-sm"
                placeholder="উদা: DMC, BUET, DU"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">বিভাগ</label>
              <div className="relative">
                <Icon icon={BookOpen} size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400" />
                <input
                  required
                  type="text"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-indigo-500/20 font-bold text-sm"
                  placeholder="বিভাগ"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">এলাকা</label>
              <div className="relative">
                <Icon icon={MapPin} size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400" />
                <input
                  required
                  type="text"
                  value={formData.area}
                  onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-indigo-500/20 font-bold text-sm"
                  placeholder="এলাকা"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-2">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, isMedical: !formData.isMedical })}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border-2 ${
                formData.isMedical ? "bg-red-50 border-red-500 text-red-600" : "bg-white border-gray-100 text-gray-400"
              }`}
            >
              {formData.isMedical && <Check size={14} />}
              Medical
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, canTeachHSC: !formData.canTeachHSC })}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border-2 ${
                formData.canTeachHSC ? "bg-indigo-50 border-indigo-500 text-indigo-600" : "bg-white border-gray-100 text-gray-400"
              }`}
            >
              {formData.canTeachHSC && <Check size={14} />}
              HSC Special
            </button>
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-indigo-600 text-white rounded-[24px] font-black text-sm shadow-xl shadow-indigo-100 active:scale-95 transition-transform mt-4"
          >
            শিক্ষক যোগ করুন
          </button>
        </form>
      </div>
    </div>
  );
};
