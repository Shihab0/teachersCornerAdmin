import React, { useState, useMemo } from "react";
import { Teacher } from "../../types";
import { Search, Filter, Phone, MapPin, GraduationCap, Star, CheckCircle2, XCircle, Trash2, Loader2, ChevronDown, ChevronUp, Briefcase, BookOpen, Award, Facebook, IdCard } from "lucide-react";
import { Icon } from "../ui/Icon";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";

interface PendingTeachersListProps {
  teachers: Teacher[];
  onUpdateStatus: (id: string, status: "Approved" | "Rejected") => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export const PendingTeachersList: React.FC<PendingTeachersListProps> = ({ teachers, onUpdateStatus, onDelete }) => {
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const filteredTeachers = useMemo(() => {
    return teachers.filter(t => {
      const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase()) || 
                           t.collegeName.toLowerCase().includes(search.toLowerCase()) ||
                           t.phone.includes(search);
      return matchesSearch && t.status === "Pending";
    });
  }, [teachers, search]);

  const handleStatusChange = async (id: string, status: "Approved" | "Rejected") => {
    setProcessingId(id);
    try {
      await onUpdateStatus(id, status);
      toast.success(`শিক্ষক ${status === "Approved" ? "অনুমোদন" : "প্রত্যাখ্যান"} করা হয়েছে`);
    } catch (error) {
      toast.error("স্ট্যাটাস আপডেট করতে সমস্যা হয়েছে");
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("আপনি কি নিশ্চিতভাবে এই শিক্ষককে ডিলিট করতে চান?")) return;
    setProcessingId(id);
    try {
      await onDelete(id);
      toast.success("শিক্ষক ডিলিট করা হয়েছে");
    } catch (error) {
      toast.error("ডিলিট করতে সমস্যা হয়েছে");
    } finally {
      setProcessingId(null);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-black text-gray-800 tracking-tight">পেন্ডিং শিক্ষক</h2>
        <div className="bg-amber-100 text-amber-600 px-3 py-1 rounded-full text-xs font-black">
          মোট: {filteredTeachers.length}
        </div>
      </div>

      <div className="space-y-4">
        <div className="relative">
          <Icon icon={Search} size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="নাম, প্রতিষ্ঠান বা ফোন দিয়ে খুঁজুন..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white rounded-3xl border border-gray-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium text-sm"
          />
        </div>
      </div>

      <div className="space-y-3">
        {filteredTeachers.map(teacher => {
          const isExpanded = expandedId === teacher.id;
          return (
            <div key={teacher.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all">
              <div 
                onClick={() => toggleExpand(teacher.id)}
                className="py-3 px-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 active:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 overflow-hidden shrink-0 border border-indigo-50">
                    {teacher.photoUrl ? (
                      <img src={teacher.photoUrl} alt={teacher.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-indigo-400 font-bold text-lg">
                        {teacher.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-gray-800 text-sm truncate">{teacher.name}</h3>
                      <div className="flex items-center gap-1 bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded-lg text-[10px] font-black shrink-0">
                        {teacher.status}
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5 truncate">
                      {teacher.collegeName}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-2">
                  <a 
                    href={`tel:${teacher.phone}`} 
                    onClick={(e) => e.stopPropagation()}
                    className="p-2 bg-emerald-50 text-emerald-600 rounded-full hover:bg-emerald-100 transition-colors"
                  >
                    <Phone size={14} />
                  </a>
                  <div className="text-gray-400">
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
                    <div className="p-4 pt-0 border-t border-gray-50 bg-gray-50/50 space-y-4">
                      
                      {/* Special Categories Badge */}
                      {(teacher.isMedical || teacher.isPublicUniversity || teacher.canTeachHSC) && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {teacher.isMedical && (
                            <div className="flex items-center gap-1 bg-rose-50 text-rose-600 px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">
                              <Award size={12} /> Medical {teacher.medicalInstitution ? `(${teacher.medicalInstitution})` : ''}
                            </div>
                          )}
                          {teacher.isPublicUniversity && (
                            <div className="flex items-center gap-1 bg-blue-50 text-blue-600 px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">
                              <Award size={12} /> Public University {teacher.publicUniversityName ? `(${teacher.publicUniversityName})` : ''}
                            </div>
                          )}
                          {teacher.canTeachHSC && (
                            <div className="flex items-center gap-1 bg-indigo-50 text-indigo-600 px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">
                              <Award size={12} /> HSC ({teacher.hscSubject || "All"})
                            </div>
                          )}
                        </div>
                      )}

                      {/* Addresses */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                        <div className="bg-white p-3 rounded-xl border border-gray-100">
                          <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">বর্তমান ঠিকানা</div>
                          <div className="flex items-start gap-2 text-gray-700 text-xs font-medium">
                            <MapPin size={14} className="text-indigo-400 shrink-0 mt-0.5" />
                            {teacher.presentAddress}
                          </div>
                        </div>
                        <div className="bg-white p-3 rounded-xl border border-gray-100">
                          <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">স্থায়ী ঠিকানা</div>
                          <div className="flex items-start gap-2 text-gray-700 text-xs font-medium">
                            <MapPin size={14} className="text-indigo-400 shrink-0 mt-0.5" />
                            {teacher.permanentAddress}
                          </div>
                        </div>
                      </div>

                      {/* Education */}
                      <div className="bg-white p-3 rounded-xl border border-gray-100">
                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                          <GraduationCap size={12} /> শিক্ষাগত যোগ্যতা
                        </div>
                        <div className="space-y-2">
                          <div className="grid grid-cols-4 gap-2 text-xs">
                            <div className="font-bold text-gray-700">SSC</div>
                            <div className="text-gray-600">{teacher.education?.ssc?.year}</div>
                            <div className="text-gray-600">{teacher.education?.ssc?.group}</div>
                            <div className="text-gray-600 font-medium">GPA: {teacher.education?.ssc?.gpa}</div>
                          </div>
                          <div className="grid grid-cols-4 gap-2 text-xs border-t border-gray-50 pt-2">
                            <div className="font-bold text-gray-700">HSC</div>
                            <div className="text-gray-600">{teacher.education?.hsc?.year}</div>
                            <div className="text-gray-600">{teacher.education?.hsc?.group}</div>
                            <div className="text-gray-600 font-medium">GPA: {teacher.education?.hsc?.gpa}</div>
                          </div>
                          <div className="grid grid-cols-4 gap-2 text-xs border-t border-gray-50 pt-2">
                            <div className="font-bold text-gray-700">Honours</div>
                            <div className="text-gray-600">{teacher.education?.honours?.year}</div>
                            <div className="text-gray-600">{teacher.education?.honours?.subject} ({teacher.education?.honours?.studyYear})</div>
                            <div className="text-gray-600 font-medium">GPA: {teacher.education?.honours?.gpa}</div>
                          </div>
                        </div>
                      </div>

                      {/* Experience & Tuition */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="bg-white p-3 rounded-xl border border-gray-100">
                          <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                            <Briefcase size={12} /> অভিজ্ঞতা
                          </div>
                          <div className="text-gray-700 text-xs font-medium">
                            {teacher.experience || "উল্লেখ নেই"}
                          </div>
                        </div>
                        <div className="bg-white p-3 rounded-xl border border-gray-100">
                          <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                            <BookOpen size={12} /> বর্তমানে টিউশনি
                          </div>
                          <div className="text-gray-700 text-xs font-medium">
                            {teacher.hasCurrentTuition ? (
                              <span className="text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">আছে</span>
                            ) : (
                              <span className="text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded-md">নেই</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Interested Subjects */}
                      <div className="bg-white p-3 rounded-xl border border-gray-100">
                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">যেসব বিষয়ে এবং শ্রেণীতে পড়াতে আগ্রহী</div>
                        <div className="text-gray-700 text-xs font-medium leading-relaxed">
                          {teacher.interestedSubjectsAndClasses || "উল্লেখ নেই"}
                        </div>
                      </div>

                      {/* Social & ID */}
                      {(teacher.facebookLink || teacher.studentIdUrl) && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {teacher.facebookLink && (
                            <div className="bg-white p-3 rounded-xl border border-gray-100">
                              <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                                <Facebook size={12} /> ফেসবুক প্রোফাইল
                              </div>
                              <a href={teacher.facebookLink} target="_blank" rel="noopener noreferrer" className="text-indigo-600 text-xs font-medium hover:underline truncate block">
                                {teacher.facebookLink}
                              </a>
                            </div>
                          )}
                          {teacher.studentIdUrl && (
                            <div className="bg-white p-3 rounded-xl border border-gray-100">
                              <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                                <IdCard size={12} /> স্টুডেন্ট আইডি
                              </div>
                              <a href={teacher.studentIdUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 text-xs font-medium hover:underline truncate block">
                                ছবি দেখুন
                              </a>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Admin Actions */}
                      <div className="flex items-center gap-3 pt-4 border-t border-gray-50">
                        <button
                          onClick={() => handleStatusChange(teacher.id, "Approved")}
                          disabled={processingId === teacher.id}
                          className="flex-1 flex items-center justify-center gap-2 py-3 bg-emerald-50 text-emerald-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-100 transition-all disabled:opacity-50"
                        >
                          {processingId === teacher.id ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                          Approve
                        </button>
                        <button
                          onClick={() => handleStatusChange(teacher.id, "Rejected")}
                          disabled={processingId === teacher.id}
                          className="flex-1 flex items-center justify-center gap-2 py-3 bg-rose-50 text-rose-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-rose-100 transition-all disabled:opacity-50"
                        >
                          {processingId === teacher.id ? <Loader2 size={16} className="animate-spin" /> : <XCircle size={16} />}
                          Reject
                        </button>
                        <button
                          onClick={() => handleDelete(teacher.id)}
                          disabled={processingId === teacher.id}
                          className="p-3 bg-gray-50 text-gray-400 rounded-2xl hover:bg-gray-100 transition-all disabled:opacity-50"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>

                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}

        {filteredTeachers.length === 0 && (
          <div className="text-center py-12 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <Icon icon={Search} size={40} className="mx-auto text-gray-200 mb-3" />
            <p className="text-gray-400 text-sm font-bold">কোনো পেন্ডিং শিক্ষক পাওয়া যায়নি!</p>
          </div>
        )}
      </div>
    </div>
  );
};
