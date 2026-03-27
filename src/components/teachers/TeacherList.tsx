import React, { useState, useMemo } from "react";
import { Teacher } from "../../types";
import { Search, Filter, Phone, MapPin, GraduationCap, Star, Plus } from "lucide-react";
import { Icon } from "../ui/Icon";

interface TeacherListProps {
  teachers: Teacher[];
  onAddTeacher: () => void;
  onResetDemo: () => void;
}

export const TeacherList: React.FC<TeacherListProps> = ({ teachers, onAddTeacher, onResetDemo }) => {
  const [search, setSearch] = useState("");
  const [filterMedical, setFilterMedical] = useState(false);
  const [filterHSC, setFilterHSC] = useState(false);
  const [filterArea, setFilterArea] = useState("All");

  const areas = useMemo(() => {
    const uniqueAreas = Array.from(new Set(teachers.map(t => t.area))).filter(Boolean);
    return ["All", ...uniqueAreas];
  }, [teachers]);

  const filteredTeachers = useMemo(() => {
    return teachers.filter(t => {
      const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase()) || 
                           t.institution.toLowerCase().includes(search.toLowerCase());
      const matchesMedical = !filterMedical || t.isMedical;
      const matchesHSC = !filterHSC || t.canTeachHSC;
      const matchesArea = filterArea === "All" || t.area === filterArea;
      return matchesSearch && matchesMedical && matchesHSC && matchesArea;
    });
  }, [teachers, search, filterMedical, filterHSC, filterArea]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-black text-gray-800 tracking-tight">শিক্ষক তালিকা</h2>
        <button 
          onClick={onAddTeacher}
          className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-100 active:scale-95 transition-transform"
        >
          <Plus size={20} />
        </button>
      </div>

      <div className="space-y-4">
        <div className="relative">
          <Icon icon={Search} size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="নাম বা প্রতিষ্ঠান দিয়ে খুঁজুন..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white rounded-3xl border border-gray-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium text-sm"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilterMedical(!filterMedical)}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all border ${
              filterMedical ? "bg-red-500 text-white border-red-500 shadow-lg shadow-red-100" : "bg-white text-gray-500 border-gray-100"
            }`}
          >
            মেডিকেল
          </button>
          <button
            onClick={() => setFilterHSC(!filterHSC)}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all border ${
              filterHSC ? "bg-indigo-500 text-white border-indigo-500 shadow-lg shadow-indigo-100" : "bg-white text-gray-500 border-gray-100"
            }`}
          >
            HSC স্পেশাল
          </button>
          <div className="relative flex-1 min-w-[120px]">
            <select
              value={filterArea}
              onChange={(e) => setFilterArea(e.target.value)}
              className="w-full px-4 py-2 bg-white rounded-2xl border border-gray-100 text-xs font-bold text-gray-600 focus:outline-none appearance-none"
            >
              {areas.map(area => (
                <option key={area} value={area}>{area === "All" ? "সব এলাকা" : area}</option>
              ))}
            </select>
            <Icon icon={Filter} size={12} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {filteredTeachers.map(teacher => (
          <div key={teacher.id} className="bg-white p-5 rounded-[32px] shadow-sm border border-gray-50 group active:scale-[0.98] transition-all">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-black text-gray-800 text-lg mb-1">{teacher.name}</h3>
                <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs">
                  <GraduationCap size={14} />
                  {teacher.institution} ({teacher.department})
                </div>
              </div>
              <div className="flex items-center gap-1 bg-yellow-50 text-yellow-600 px-2 py-1 rounded-xl text-[10px] font-black">
                <Star size={10} fill="currentColor" />
                {teacher.rating}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="flex items-center gap-2 text-gray-500 text-xs font-medium">
                <MapPin size={14} className="text-gray-400" />
                {teacher.area}
              </div>
              <a href={`tel:${teacher.phone}`} className="flex items-center gap-2 text-emerald-600 text-xs font-bold">
                <Phone size={14} />
                {teacher.phone}
              </a>
            </div>

            <div className="flex gap-2">
              {teacher.isMedical && (
                <span className="px-3 py-1 bg-red-50 text-red-600 rounded-full text-[10px] font-black uppercase tracking-wider">
                  Medical
                </span>
              )}
              {teacher.canTeachHSC && (
                <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-wider">
                  HSC Special
                </span>
              )}
            </div>
          </div>
        ))}

        {filteredTeachers.length === 0 && (
          <div className="text-center py-12 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <Icon icon={Search} size={40} className="mx-auto text-gray-200 mb-3" />
            <p className="text-gray-400 text-sm font-bold mb-6">কোনো শিক্ষক পাওয়া যায়নি!</p>
            <button
              onClick={onResetDemo}
              className="px-6 py-3 bg-indigo-50 text-indigo-600 rounded-2xl font-black text-xs uppercase tracking-widest border-2 border-indigo-100 hover:bg-indigo-100 transition-colors"
            >
              ডেমো ডাটা লোড করুন
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
