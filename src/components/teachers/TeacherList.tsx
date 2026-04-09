import React, { useState, useMemo } from "react";
import { Teacher } from "../../types";
import { Search, Filter, Phone, MapPin, GraduationCap, Star, Plus, ChevronDown, ChevronUp, Briefcase, BookOpen, Award, Check, Facebook, IdCard } from "lucide-react";
import { Icon } from "../ui/Icon";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../../lib/utils";

const KISHOREGANJ_AREAS = [
  "Harua (হারুয়া)", "Rathkhola (রথখোলা)", "Gaital (গাইট্যাল)", "Botrish (বত্রিশ)",
  "Akhrakhabazar (আখড়াবাজার)", "Boro Bazar (বড় বাজার)", "Nilganj (নীলগঞ্জ)",
  "Puran Thana (পুরান থানা)", "Tarapasha (তারা পাশা)", "Yashodal (যশোদল)",
  "Haybatnagar (হায়বতনগর)", "Ukilpara (উকিলপাড়া)", "Shikkok Polli (শিক্ষক পল্লী)",
  "Borpul (বড়পুল)", "Newtown (নিউটাউন)", "Others (অন্যান্য)"
];

const KISHOREGANJ_INSTITUTIONS = [
  "Gurudayal Govt. College",
  "Wali Newaz Khan College",
  "Kishoreganj Govt. Mohila College",
  "Kishoreganj Govt. Boys' High School",
  "S.V. Govt. Girls' High School",
  "Others"
];

interface TeacherListProps {
  teachers: Teacher[];
  onAddTeacher: () => void;
  onEditTeacher?: (teacher: Teacher) => void;
  onUpdateStatus?: (id: string, status: "Approved" | "Rejected") => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
}

export const TeacherList: React.FC<TeacherListProps> = ({ 
  teachers, 
  onAddTeacher, 
  onEditTeacher,
  onUpdateStatus,
  onDelete
}) => {
  const [activeSubTab, setActiveSubTab] = useState<"Approved" | "Pending">("Approved");
  const [search, setSearch] = useState("");
  const [filterArea, setFilterArea] = useState("All");
  const [filterCollege, setFilterCollege] = useState("All");
  const [filterSpecialCategory, setFilterSpecialCategory] = useState("All");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const areas = ["All", ...KISHOREGANJ_AREAS];
  const colleges = ["All", ...KISHOREGANJ_INSTITUTIONS];
  const specialCategories = ["All", "Medical", "Public University", "HSC"];

  const filteredTeachers = useMemo(() => {
    return teachers
      .filter(t => t.status === activeSubTab)
      .filter(t => {
        const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase()) || 
                             t.collegeName.toLowerCase().includes(search.toLowerCase());
        const matchesArea = filterArea === "All" || t.presentAddress === filterArea;
        const matchesCollege = filterCollege === "All" || t.collegeName === filterCollege;
        
        let matchesSpecialCategory = true;
        if (filterSpecialCategory === "Medical") {
          matchesSpecialCategory = !!t.isMedical;
        } else if (filterSpecialCategory === "Public University") {
          matchesSpecialCategory = !!t.isPublicUniversity;
        } else if (filterSpecialCategory === "HSC") {
          matchesSpecialCategory = !!t.canTeachHSC;
        }

        return matchesSearch && matchesArea && matchesCollege && matchesSpecialCategory;
      });
  }, [teachers, activeSubTab, search, filterArea, filterCollege, filterSpecialCategory]);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="space-y-10 pb-12 pt-6 px-4 md:px-8 lg:px-12 max-w-6xl mx-auto fade-in transition-colors">
      <div className="flex justify-between items-center px-4 mb-8">
        <div className="flex items-center gap-6">
          <div className="p-4 bg-emerald-100 dark:bg-emerald-900/30 rounded-[24px] shadow-sm border border-emerald-50 dark:border-emerald-900/20">
            <GraduationCap className="text-emerald-600 dark:text-emerald-400 w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">শিক্ষক তালিকা</h2>
            <p className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] mt-1">Total: {filteredTeachers.length} Teachers</p>
          </div>
        </div>
        <button 
          onClick={onAddTeacher}
          className="w-14 h-14 bg-slate-950 dark:bg-white text-white dark:text-slate-950 rounded-[20px] shadow-2xl shadow-slate-950/20 dark:shadow-white/10 active:scale-95 transition-all flex items-center justify-center"
        >
          <Plus size={28} />
        </button>
      </div>

      {/* Sub-tabs for Approved/Pending */}
      <div className="flex p-3 bg-slate-100 dark:bg-slate-800/50 rounded-[40px] mb-12 border border-slate-200 dark:border-slate-700 shadow-inner">
        <button
          onClick={() => setActiveSubTab("Approved")}
          className={cn(
            "flex-1 py-5 text-[11px] font-black uppercase tracking-[0.3em] rounded-[28px] transition-all duration-500",
            activeSubTab === "Approved" ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-2xl shadow-emerald-500/10 border border-emerald-100 dark:border-emerald-900/30" : "text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          )}
        >
          Approved ({teachers.filter(t => t.status === "Approved").length})
        </button>
        <button
          onClick={() => setActiveSubTab("Pending")}
          className={cn(
            "flex-1 py-5 text-[11px] font-black uppercase tracking-[0.3em] rounded-[28px] transition-all duration-500",
            activeSubTab === "Pending" ? "bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-2xl shadow-amber-500/10 border border-amber-100 dark:border-amber-900/30" : "text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          )}
        >
          Pending ({teachers.filter(t => t.status === "Pending").length})
        </button>
      </div>

      <div className="space-y-10 mb-12">
        <div className="relative group">
          <Icon icon={Search} size={24} className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
          <input
            type="text"
            placeholder="নাম বা প্রতিষ্ঠান দিয়ে খুঁজুন..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-20 pr-10 py-8 bg-white dark:bg-slate-900 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm focus:outline-none focus:ring-8 focus:ring-emerald-500/5 dark:text-white font-black text-base transition-all placeholder:text-slate-400 tracking-tight"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="relative group">
            <select
              value={filterArea}
              onChange={(e) => setFilterArea(e.target.value)}
              className="w-full px-8 py-6 bg-white dark:bg-slate-900 rounded-[28px] border border-slate-100 dark:border-slate-800 text-[11px] font-black uppercase tracking-[0.2em] text-slate-700 dark:text-slate-400 focus:outline-none appearance-none shadow-sm focus:ring-4 focus:ring-emerald-500/10 transition-all"
            >
              {areas.map(area => (
                <option key={area} value={area}>{area === "All" ? "সব এলাকা" : area}</option>
              ))}
            </select>
            <Icon icon={ChevronDown} size={18} className="absolute right-8 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          <div className="relative group">
            <select
              value={filterCollege}
              onChange={(e) => setFilterCollege(e.target.value)}
              className="w-full px-8 py-6 bg-white dark:bg-slate-900 rounded-[28px] border border-slate-100 dark:border-slate-800 text-[11px] font-black uppercase tracking-[0.2em] text-slate-700 dark:text-slate-400 focus:outline-none appearance-none shadow-sm focus:ring-4 focus:ring-emerald-500/10 transition-all"
            >
              {colleges.map(college => (
                <option key={college} value={college}>{college === "All" ? "সব কলেজ" : college}</option>
              ))}
            </select>
            <Icon icon={ChevronDown} size={18} className="absolute right-8 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          <div className="relative group">
            <select
              value={filterSpecialCategory}
              onChange={(e) => setFilterSpecialCategory(e.target.value)}
              className="w-full px-8 py-6 bg-white dark:bg-slate-900 rounded-[28px] border border-slate-100 dark:border-slate-800 text-[11px] font-black uppercase tracking-[0.2em] text-slate-700 dark:text-slate-400 focus:outline-none appearance-none shadow-sm focus:ring-4 focus:ring-emerald-500/10 transition-all"
            >
              {specialCategories.map(category => (
                <option key={category} value={category}>{category === "All" ? "সব ক্যাটাগরি" : category}</option>
              ))}
            </select>
            <Icon icon={ChevronDown} size={18} className="absolute right-8 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {filteredTeachers.map(teacher => {
          const isExpanded = expandedId === teacher.id;
          return (
            <div key={teacher.id} className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800/50 overflow-hidden transition-all hover:border-emerald-200 dark:hover:border-emerald-800/50 hover:shadow-md">
              <div 
                onClick={() => toggleExpand(teacher.id)}
                className="py-2.5 px-4 flex items-center justify-between cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-800/30 active:bg-slate-100 dark:active:bg-slate-800 transition-all"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 overflow-hidden shrink-0 border border-emerald-50 dark:border-emerald-900/20 shadow-inner group-hover:scale-105 transition-transform">
                    {teacher.photoUrl ? (
                      <img src={teacher.photoUrl} alt={teacher.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-emerald-500 font-black text-sm">
                        {teacher.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="font-black text-slate-950 dark:text-white text-sm truncate tracking-tight uppercase">{teacher.name}</h3>
                      <div className="flex items-center gap-0.5 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 px-1.5 py-0.5 rounded-md text-[8px] font-black shrink-0 border border-amber-100 dark:border-amber-900/30 shadow-sm">
                        <Star size={8} fill="currentColor" />
                        {teacher.rating}
                      </div>
                    </div>
                    <div className="text-[9px] font-black text-slate-500 dark:text-slate-400 truncate flex items-center gap-1.5 uppercase tracking-wider">
                      <div className="w-1 h-1 rounded-full bg-emerald-500" />
                      {teacher.collegeName}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-3">
                  <a 
                    href={`tel:${teacher.phone}`} 
                    onClick={(e) => e.stopPropagation()}
                    className="w-8 h-8 bg-emerald-600 text-white rounded-lg flex items-center justify-center hover:bg-emerald-700 transition-all shadow-md shadow-emerald-500/20 active:scale-90"
                  >
                    <Phone size={14} fill="currentColor" />
                  </a>
                  <div className="text-slate-300 dark:text-slate-700">
                    {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </div>
                </div>
              </div>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                  >
                    <div className="p-6 pt-2 border-t border-slate-100 dark:border-slate-800/50 bg-slate-50/30 dark:bg-slate-900/30 space-y-6">
                      
                      {/* Special Categories Badge */}
                      {(teacher.isMedical || teacher.isPublicUniversity || teacher.canTeachHSC) && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {teacher.isMedical && (
                            <div className="flex items-center gap-1.5 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-[0.15em] border border-rose-100 dark:border-rose-900/30 shadow-sm">
                              <Award size={12} /> Medical {teacher.medicalInstitution ? `(${teacher.medicalInstitution})` : ''}
                            </div>
                          )}
                          {teacher.isPublicUniversity && (
                            <div className="flex items-center gap-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-[0.15em] border border-blue-100 dark:border-blue-900/30 shadow-sm">
                              <Award size={12} /> Public University {teacher.publicUniversityName ? `(${teacher.publicUniversityName})` : ''}
                            </div>
                          )}
                          {teacher.canTeachHSC && (
                            <div className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-[0.15em] border border-emerald-100 dark:border-emerald-900/30 shadow-sm">
                              <Award size={12} /> HSC ({teacher.hscSubject || "All"})
                            </div>
                          )}
                        </div>
                      )}

                      {/* Addresses */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm">
                          <div className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-2">বর্তমান ঠিকানা</div>
                          <div className="flex items-start gap-2 text-slate-700 dark:text-slate-300 text-[10px] font-black leading-relaxed">
                            <MapPin size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                            {teacher.presentAddress}
                          </div>
                        </div>
                        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm">
                          <div className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-2">স্থায়ী ঠিকানা</div>
                          <div className="flex items-start gap-2 text-slate-700 dark:text-slate-300 text-[10px] font-black leading-relaxed">
                            <MapPin size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                            {teacher.permanentAddress}
                          </div>
                        </div>
                      </div>

                      {/* Education */}
                      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                        <div className="text-[9px] font-black text-slate-500 dark:text-slate-500 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                          <div className="p-1.5 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                            <GraduationCap size={14} className="text-emerald-500" />
                          </div>
                          শিক্ষাগত যোগ্যতা
                        </div>
                        <div className="space-y-3">
                          <div className="grid grid-cols-4 gap-2 text-[10px]">
                            <div className="font-black text-slate-900 dark:text-white uppercase tracking-[0.1em]">SSC</div>
                            <div className="text-slate-600 dark:text-slate-400 font-black">{teacher.education?.ssc?.year}</div>
                            <div className="text-slate-600 dark:text-slate-400 font-black">{teacher.education?.ssc?.group}</div>
                            <div className="text-emerald-600 dark:text-emerald-400 font-black">GPA: {teacher.education?.ssc?.gpa}</div>
                          </div>
                          <div className="grid grid-cols-4 gap-2 text-[10px] border-t border-slate-100 dark:border-slate-800 pt-3">
                            <div className="font-black text-slate-900 dark:text-white uppercase tracking-[0.1em]">HSC</div>
                            <div className="text-slate-600 dark:text-slate-400 font-black">{teacher.education?.hsc?.year}</div>
                            <div className="text-slate-600 dark:text-slate-400 font-black">{teacher.education?.hsc?.group}</div>
                            <div className="text-emerald-600 dark:text-emerald-400 font-black">GPA: {teacher.education?.hsc?.gpa}</div>
                          </div>
                          <div className="grid grid-cols-4 gap-2 text-[10px] border-t border-slate-100 dark:border-slate-800 pt-3">
                            <div className="font-black text-slate-900 dark:text-white uppercase tracking-[0.1em]">Honours</div>
                            <div className="text-slate-600 dark:text-slate-400 font-black">{teacher.education?.honours?.year}</div>
                            <div className="text-slate-600 dark:text-slate-400 font-black truncate">{teacher.education?.honours?.subject} ({teacher.education?.honours?.studyYear})</div>
                            <div className="text-emerald-600 dark:text-emerald-400 font-black">GPA: {teacher.education?.honours?.gpa}</div>
                          </div>
                        </div>
                      </div>

                      {/* Experience & Tuition */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm">
                          <div className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                            <Briefcase size={12} className="text-emerald-500" /> অভিজ্ঞতা
                          </div>
                          <div className="text-slate-700 dark:text-slate-300 text-[10px] font-black leading-relaxed">
                            {teacher.experience || "উল্লেখ নেই"}
                          </div>
                        </div>
                        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm">
                          <div className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                            <BookOpen size={12} className="text-emerald-500" /> বর্তমানে টিউশনি
                          </div>
                          <div className="text-slate-700 dark:text-slate-300 text-[10px] font-black">
                            {teacher.hasCurrentTuition ? (
                              <span className="text-emerald-600 dark:text-emerald-400 font-black bg-emerald-50 dark:bg-emerald-950/20 px-3 py-1 rounded-md border border-emerald-100 dark:border-emerald-900/20 uppercase tracking-[0.1em]">আছে</span>
                            ) : (
                              <span className="text-rose-600 dark:text-rose-400 font-black bg-rose-50 dark:bg-rose-900/20 px-3 py-1 rounded-md border border-rose-100 dark:border-rose-900/20 uppercase tracking-[0.1em]">নেই</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Interested Subjects */}
                      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm">
                        <div className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-2">যেসব বিষয়ে এবং শ্রেণীতে পড়াতে আগ্রহী</div>
                        <div className="text-xs font-black text-slate-800 dark:text-slate-200 leading-relaxed">
                          {teacher.interestedSubjectsAndClasses || "উল্লেখ নেই"}
                        </div>
                      </div>

                      {/* Social & ID */}
                      {(teacher.facebookLink || teacher.studentIdUrl) && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {teacher.facebookLink && (
                            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm">
                              <div className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                                <Facebook size={12} className="text-emerald-500" /> ফেসবুক প্রোফাইল
                              </div>
                              <a href={teacher.facebookLink} target="_blank" rel="noopener noreferrer" className="text-emerald-600 dark:text-emerald-400 text-[10px] font-black hover:underline truncate block tracking-tight">
                                {teacher.facebookLink}
                              </a>
                            </div>
                          )}
                          {teacher.studentIdUrl && (
                            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm">
                              <div className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                                <IdCard size={12} className="text-emerald-500" /> স্টুডেন্ট আইডি
                              </div>
                              <div className="relative group/id overflow-hidden rounded-lg border border-slate-100 dark:border-slate-800 aspect-video bg-slate-50 dark:bg-slate-800/50">
                                <img 
                                  src={teacher.studentIdUrl} 
                                  alt="Student ID" 
                                  className="w-full h-full object-contain transition-transform duration-500 group-hover/id:scale-105"
                                  referrerPolicy="no-referrer"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/id:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const win = window.open();
                                      if (win) {
                                        win.document.write(`<img src="${teacher.studentIdUrl}" style="max-width:100%; height:auto;" />`);
                                      }
                                    }}
                                    className="px-3 py-1.5 bg-white text-slate-900 rounded-md text-[8px] font-black uppercase tracking-widest hover:bg-emerald-50 transition-colors"
                                  >
                                    বড় করে দেখুন
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Admin Actions for Approved Teachers */}
                      {activeSubTab === "Approved" && onEditTeacher && onDelete && (
                        <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-800/50">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onEditTeacher(teacher);
                            }}
                            className="flex-1 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-black text-[9px] uppercase tracking-[0.15em] hover:bg-slate-800 dark:hover:bg-slate-100 transition-all flex items-center justify-center gap-2"
                          >
                            Edit Profile
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDelete(teacher.id);
                            }}
                            className="flex-1 py-3 bg-rose-500 text-white rounded-xl font-black text-[9px] uppercase tracking-[0.15em] hover:bg-rose-600 transition-all flex items-center justify-center gap-2"
                          >
                            Delete
                          </button>
                        </div>
                      )}

                      {/* Admin Actions for Pending Teachers */}
                      {activeSubTab === "Pending" && onUpdateStatus && onDelete && (
                        <div className="flex gap-6 pt-6">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onUpdateStatus(teacher.id, "Approved");
                            }}
                            className="flex-1 py-6 bg-emerald-600 text-white rounded-[28px] font-black text-[13px] uppercase tracking-[0.3em] shadow-2xl shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-4"
                          >
                            <Check size={24} /> Approve
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDelete(teacher.id);
                            }}
                            className="flex-1 py-6 bg-rose-600 text-white rounded-[28px] font-black text-[13px] uppercase tracking-[0.3em] shadow-2xl shadow-rose-500/20 active:scale-95 transition-all flex items-center justify-center gap-4"
                          >
                            Reject & Delete
                          </button>
                        </div>
                      )}

                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}

        {filteredTeachers.length === 0 && (
          <div className="text-center py-24 bg-white dark:bg-slate-900 rounded-[56px] border border-slate-100 dark:border-slate-800 shadow-sm">
            <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-[32px] flex items-center justify-center mx-auto mb-8 text-slate-200 dark:text-slate-700">
              <Search size={48} />
            </div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-2">কোনো শিক্ষক পাওয়া যায়নি!</h3>
            <p className="text-slate-400 dark:text-slate-500 font-black uppercase tracking-[0.2em] text-[11px] mb-8">অন্য কোনো কি-ওয়ার্ড দিয়ে চেষ্টা করুন</p>
          </div>
        )}
      </div>
    </div>
  );
};
