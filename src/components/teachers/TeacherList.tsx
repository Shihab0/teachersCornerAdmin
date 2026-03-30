import React, { useState, useMemo } from "react";
import { Teacher } from "../../types";
import { Search, Filter, Phone, MapPin, GraduationCap, Star, Plus, ChevronDown, ChevronUp, Briefcase, BookOpen, Award, Check, Facebook, IdCard } from "lucide-react";
import { Icon } from "../ui/Icon";
import { motion, AnimatePresence } from "motion/react";

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
  onResetDemo: () => void;
  onUpdateStatus?: (id: string, status: "Approved" | "Rejected") => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
}

export const TeacherList: React.FC<TeacherListProps> = ({ 
  teachers, 
  onAddTeacher, 
  onResetDemo,
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
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">শিক্ষক তালিকা</h2>
        <button 
          onClick={onAddTeacher}
          className="p-3 bg-emerald-600 text-white rounded-2xl shadow-lg shadow-emerald-100 dark:shadow-none active:scale-95 transition-transform"
        >
          <Plus size={20} />
        </button>
      </div>

      {/* Sub-tabs for Approved/Pending */}
      <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl mb-4">
        <button
          onClick={() => setActiveSubTab("Approved")}
          className={`flex-1 py-2.5 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${
            activeSubTab === "Approved" ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm" : "text-slate-400 dark:text-slate-500"
          }`}
        >
          Approved ({teachers.filter(t => t.status === "Approved").length})
        </button>
        <button
          onClick={() => setActiveSubTab("Pending")}
          className={`flex-1 py-2.5 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${
            activeSubTab === "Pending" ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm" : "text-slate-400 dark:text-slate-500"
          }`}
        >
          Pending ({teachers.filter(t => t.status === "Pending").length})
        </button>
      </div>

      <div className="space-y-4">
        <div className="relative group">
          <Icon icon={Search} size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
          <input
            type="text"
            placeholder="নাম বা প্রতিষ্ঠান দিয়ে খুঁজুন..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:text-white font-medium text-sm transition-all"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <div className="relative flex-1 min-w-[120px]">
            <select
              value={filterArea}
              onChange={(e) => setFilterArea(e.target.value)}
              className="w-full px-4 py-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-400 focus:outline-none appearance-none"
            >
              {areas.map(area => (
                <option key={area} value={area}>{area === "All" ? "সব এলাকা" : area}</option>
              ))}
            </select>
            <Icon icon={Filter} size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          <div className="relative flex-1 min-w-[120px]">
            <select
              value={filterCollege}
              onChange={(e) => setFilterCollege(e.target.value)}
              className="w-full px-4 py-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-400 focus:outline-none appearance-none"
            >
              {colleges.map(college => (
                <option key={college} value={college}>{college === "All" ? "সব কলেজ" : college}</option>
              ))}
            </select>
            <Icon icon={Filter} size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          <div className="relative flex-1 min-w-[120px]">
            <select
              value={filterSpecialCategory}
              onChange={(e) => setFilterSpecialCategory(e.target.value)}
              className="w-full px-4 py-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-400 focus:outline-none appearance-none"
            >
              {specialCategories.map(category => (
                <option key={category} value={category}>{category === "All" ? "সব ক্যাটাগরি" : category}</option>
              ))}
            </select>
            <Icon icon={Filter} size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {filteredTeachers.map(teacher => {
          const isExpanded = expandedId === teacher.id;
          return (
            <div key={teacher.id} className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden transition-all">
              <div 
                onClick={() => toggleExpand(teacher.id)}
                className="py-3 px-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 active:bg-slate-100 dark:active:bg-slate-800 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 overflow-hidden shrink-0 border border-emerald-50 dark:border-emerald-900/20">
                    {teacher.photoUrl ? (
                      <img src={teacher.photoUrl} alt={teacher.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-emerald-400 font-bold text-lg">
                        {teacher.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-800 dark:text-white text-sm truncate">{teacher.name}</h3>
                      <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 px-1.5 py-0.5 rounded-lg text-[10px] font-black shrink-0 border border-amber-100 dark:border-amber-900/30">
                        <Star size={10} fill="currentColor" />
                        {teacher.rating}
                      </div>
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                      {teacher.collegeName}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-2">
                  <a 
                    href={`tel:${teacher.phone}`} 
                    onClick={(e) => e.stopPropagation()}
                    className="p-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full hover:bg-emerald-600 hover:text-white transition-all"
                  >
                    <Phone size={14} />
                  </a>
                  <div className="text-slate-400 dark:text-slate-600">
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
                    transition={{ duration: 0.2 }}
                  >
                    <div className="p-4 pt-0 border-t border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-4">
                      
                      {/* Special Categories Badge */}
                      {(teacher.isMedical || teacher.isPublicUniversity || teacher.canTeachHSC) && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {teacher.isMedical && (
                            <div className="flex items-center gap-1 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border border-rose-100 dark:border-rose-900/30">
                              <Award size={12} /> Medical {teacher.medicalInstitution ? `(${teacher.medicalInstitution})` : ''}
                            </div>
                          )}
                          {teacher.isPublicUniversity && (
                            <div className="flex items-center gap-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border border-blue-100 dark:border-blue-900/30">
                              <Award size={12} /> Public University {teacher.publicUniversityName ? `(${teacher.publicUniversityName})` : ''}
                            </div>
                          )}
                          {teacher.canTeachHSC && (
                            <div className="flex items-center gap-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border border-emerald-100 dark:border-emerald-900/30">
                              <Award size={12} /> HSC ({teacher.hscSubject || "All"})
                            </div>
                          )}
                        </div>
                      )}

                      {/* Addresses */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                        <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                          <div className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">বর্তমান ঠিকানা</div>
                          <div className="flex items-start gap-2 text-slate-700 dark:text-slate-300 text-xs font-medium leading-relaxed">
                            <MapPin size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                            {teacher.presentAddress}
                          </div>
                        </div>
                        <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                          <div className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">স্থায়ী ঠিকানা</div>
                          <div className="flex items-start gap-2 text-slate-700 dark:text-slate-300 text-xs font-medium leading-relaxed">
                            <MapPin size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                            {teacher.permanentAddress}
                          </div>
                        </div>
                      </div>

                      {/* Education */}
                      <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                        <div className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1">
                          <GraduationCap size={12} className="text-emerald-500" /> শিক্ষাগত যোগ্যতা
                        </div>
                        <div className="space-y-2">
                          <div className="grid grid-cols-4 gap-2 text-xs">
                            <div className="font-bold text-slate-700 dark:text-slate-200">SSC</div>
                            <div className="text-slate-600 dark:text-slate-400">{teacher.education?.ssc?.year}</div>
                            <div className="text-slate-600 dark:text-slate-400">{teacher.education?.ssc?.group}</div>
                            <div className="text-emerald-600 dark:text-emerald-400 font-medium">GPA: {teacher.education?.ssc?.gpa}</div>
                          </div>
                          <div className="grid grid-cols-4 gap-2 text-xs border-t border-slate-50 dark:border-slate-800 pt-2">
                            <div className="font-bold text-slate-700 dark:text-slate-200">HSC</div>
                            <div className="text-slate-600 dark:text-slate-400">{teacher.education?.hsc?.year}</div>
                            <div className="text-slate-600 dark:text-slate-400">{teacher.education?.hsc?.group}</div>
                            <div className="text-emerald-600 dark:text-emerald-400 font-medium">GPA: {teacher.education?.hsc?.gpa}</div>
                          </div>
                          <div className="grid grid-cols-4 gap-2 text-xs border-t border-slate-50 dark:border-slate-800 pt-2">
                            <div className="font-bold text-slate-700 dark:text-slate-200">Honours</div>
                            <div className="text-slate-600 dark:text-slate-400">{teacher.education?.honours?.year}</div>
                            <div className="text-slate-600 dark:text-slate-400 truncate">{teacher.education?.honours?.subject} ({teacher.education?.honours?.studyYear})</div>
                            <div className="text-emerald-600 dark:text-emerald-400 font-medium">GPA: {teacher.education?.honours?.gpa}</div>
                          </div>
                        </div>
                      </div>

                      {/* Experience & Tuition */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                          <div className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-1">
                            <Briefcase size={12} className="text-emerald-500" /> অভিজ্ঞতা
                          </div>
                          <div className="text-slate-700 dark:text-slate-300 text-xs font-medium">
                            {teacher.experience || "উল্লেখ নেই"}
                          </div>
                        </div>
                        <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                          <div className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-1">
                            <BookOpen size={12} className="text-emerald-500" /> বর্তমানে টিউশনি
                          </div>
                          <div className="text-slate-700 dark:text-slate-300 text-xs font-medium">
                            {teacher.hasCurrentTuition ? (
                              <span className="text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-md">আছে</span>
                            ) : (
                              <span className="text-rose-600 dark:text-rose-400 font-bold bg-rose-50 dark:bg-rose-900/20 px-2 py-0.5 rounded-md">নেই</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Interested Subjects */}
                      <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                        <div className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">যেসব বিষয়ে এবং শ্রেণীতে পড়াতে আগ্রহী</div>
                        <div className="text-slate-700 dark:text-slate-300 text-xs font-medium leading-relaxed">
                          {teacher.interestedSubjectsAndClasses || "উল্লেখ নেই"}
                        </div>
                      </div>

                      {/* Social & ID */}
                      {(teacher.facebookLink || teacher.studentIdUrl) && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {teacher.facebookLink && (
                            <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                              <div className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-1">
                                <Facebook size={12} className="text-emerald-500" /> ফেসবুক প্রোফাইল
                              </div>
                              <a href={teacher.facebookLink} target="_blank" rel="noopener noreferrer" className="text-emerald-600 dark:text-emerald-400 text-xs font-medium hover:underline truncate block">
                                {teacher.facebookLink}
                              </a>
                            </div>
                          )}
                          {teacher.studentIdUrl && (
                            <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                              <div className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-1">
                                <IdCard size={12} className="text-emerald-500" /> স্টুডেন্ট আইডি
                              </div>
                              <a href={teacher.studentIdUrl} target="_blank" rel="noopener noreferrer" className="text-emerald-600 dark:text-emerald-400 text-xs font-medium hover:underline truncate block">
                                ছবি দেখুন
                              </a>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Admin Actions for Pending Teachers */}
                      {activeSubTab === "Pending" && onUpdateStatus && onDelete && (
                        <div className="flex gap-2 pt-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onUpdateStatus(teacher.id, "Approved");
                            }}
                            className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-100 dark:shadow-none active:scale-95 transition-transform flex items-center justify-center gap-2"
                          >
                            <Check size={14} /> Approve
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDelete(teacher.id);
                            }}
                            className="flex-1 py-3 bg-rose-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-rose-100 dark:shadow-none active:scale-95 transition-transform flex items-center justify-center gap-2"
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
          <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
            <Icon icon={Search} size={40} className="mx-auto text-slate-200 dark:text-slate-700 mb-3" />
            <p className="text-slate-400 dark:text-slate-500 text-sm font-bold mb-6">কোনো শিক্ষক পাওয়া যায়নি!</p>
            {teachers.length === 0 && (
              <button
                onClick={onResetDemo}
                className="px-6 py-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-2xl font-black text-xs uppercase tracking-widest border-2 border-emerald-100 dark:border-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors"
              >
                ডেমো ডাটা লোড করুন
              </button>
            )}
          </div>
        )}

        {teachers.length > 0 && (
          <div className="pt-4 pb-8">
            <button
              onClick={onResetDemo}
              className="w-full py-4 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-[24px] font-black text-xs uppercase tracking-widest border-2 border-emerald-100 dark:border-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors"
            >
              Reset Demo Data
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
