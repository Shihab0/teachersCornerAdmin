import React, { useState, useMemo } from "react";
import { Teacher } from "../../types";
import { Search, Filter, Phone, MapPin, GraduationCap, Star, CheckCircle2, XCircle, Trash2, Loader2, ChevronDown, ChevronUp, Briefcase, BookOpen, Award, Facebook, IdCard, CheckSquare, Square } from "lucide-react";
import { Icon } from "../ui/Icon";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { Skeleton } from "../ui/Skeleton";
import { ConfirmDialog } from "../modals/ConfirmDialog";
import { AdminTeacherNotes } from "./AdminTeacherNotes";

interface PendingTeachersListProps {
  teachers: Teacher[];
  onUpdateStatus: (id: string, status: "Approved" | "Rejected") => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  isLoading?: boolean;
}

export const PendingTeachersList: React.FC<PendingTeachersListProps> = ({ 
  teachers, 
  onUpdateStatus, 
  onDelete,
  isLoading = false
}) => {
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

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
    setProcessingId(id);
    try {
      await onDelete(id);
      toast.success("শিক্ষক ডিলিট করা হয়েছে");
    } catch (error) {
      toast.error("ডিলিট করতে সমস্যা হয়েছে");
    } finally {
      setProcessingId(null);
      setConfirmDeleteId(null);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredTeachers.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredTeachers.map(t => t.id));
    }
  };

  const handleBulkAction = async (status: "Approved" | "Rejected") => {
    if (selectedIds.length === 0) return;
    setIsBulkProcessing(true);
    try {
      await Promise.all(selectedIds.map(id => onUpdateStatus(id, status)));
      toast.success(`${selectedIds.length} জন শিক্ষককে ${status === "Approved" ? "অনুমোদন" : "প্রত্যাখ্যান"} করা হয়েছে`);
      setSelectedIds([]);
    } catch (error) {
      toast.error("বাল্ক অ্যাকশন সম্পন্ন করতে সমস্যা হয়েছে");
    } finally {
      setIsBulkProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
        <Skeleton className="h-14 w-full rounded-3xl" />
        <div className="space-y-3">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-16 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1 mb-8">
        <div className="flex items-center justify-between">
          <h2 className="text-4xl font-black text-gray-900 dark:text-white tracking-wide uppercase leading-none [word-spacing:0.2em]">
            পেন্ডিং <span className="ml-2 text-amber-600 dark:text-amber-400 italic font-serif lowercase tracking-normal">শিক্ষক</span>
          </h2>
          <div className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
            Total: {filteredTeachers.length}
          </div>
        </div>
        <div className="h-px bg-gray-200 dark:bg-slate-800 w-full mt-2" />
      </div>

      <div className="space-y-6">
        <div className="relative group">
          <Icon icon={Search} size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
          <input
            type="text"
            placeholder="নাম, প্রতিষ্ঠান বা ফোন দিয়ে খুঁজুন..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-5 bg-gray-50 dark:bg-slate-900/50 dark:text-white rounded-2xl border-2 border-transparent focus:border-emerald-500/20 focus:bg-white dark:focus:bg-slate-900 transition-all outline-none font-bold text-sm"
          />
        </div>
      </div>

      {/* Bulk Actions Bar */}
      <AnimatePresence>
        {selectedIds.length > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-md"
          >
            <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 shadow-2xl rounded-3xl p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button 
                  onClick={toggleSelectAll}
                  className="p-2 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded-xl"
                >
                  <CheckSquare size={20} />
                </button>
                <div className="text-sm font-black text-gray-800 dark:text-slate-100">
                  {selectedIds.length} নির্বাচিত
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleBulkAction("Approved")}
                  disabled={isBulkProcessing}
                  className="px-4 py-2 bg-emerald-500 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-emerald-600 transition-colors disabled:opacity-50"
                >
                  {isBulkProcessing ? <Loader2 size={16} className="animate-spin" /> : "Approve"}
                </button>
                <button
                  onClick={() => handleBulkAction("Rejected")}
                  disabled={isBulkProcessing}
                  className="px-4 py-2 bg-rose-500 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-rose-600 transition-colors disabled:opacity-50"
                >
                  {isBulkProcessing ? <Loader2 size={16} className="animate-spin" /> : "Reject"}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-3">
        {filteredTeachers.map(teacher => {
          const isExpanded = expandedId === teacher.id;
          const isSelected = selectedIds.includes(teacher.id);
          return (
            <div 
              key={teacher.id} 
              className={`bg-white dark:bg-slate-900 rounded-[32px] shadow-sm border transition-all overflow-hidden ${
                isSelected ? 'border-emerald-500 ring-4 ring-emerald-500/10' : 'border-gray-100 dark:border-slate-800'
              }`}
            >
              <div className="flex items-center px-4 py-3">
                <button 
                  onClick={() => toggleSelect(teacher.id)}
                  className={`p-2 rounded-lg transition-all transform active:scale-90 ${
                    isSelected ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30' : 'text-gray-200 dark:text-slate-700 hover:text-gray-400 dark:hover:text-slate-500'
                  }`}
                >
                  {isSelected ? <CheckSquare size={18} /> : <Square size={18} />}
                </button>
                <div 
                  onClick={() => toggleExpand(teacher.id)}
                  className="flex-1 flex items-center justify-between cursor-pointer ml-3"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-slate-800 overflow-hidden shrink-0 border border-slate-100 dark:border-slate-700 shadow-sm">
                      {teacher.photoUrl ? (
                        <img src={teacher.photoUrl} alt={teacher.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-emerald-400 font-black text-sm">
                          {teacher.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h3 className="font-black text-gray-900 dark:text-white text-sm tracking-tight truncate uppercase">{teacher.name}</h3>
                        <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 px-1.5 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest shrink-0 border border-amber-100 dark:border-amber-900/30">
                          {teacher.status}
                        </div>
                      </div>
                      <div className="text-[9px] font-black text-gray-400 dark:text-slate-500 truncate flex items-center gap-1.5 uppercase tracking-wider">
                        <GraduationCap size={12} className="text-emerald-500" />
                        {teacher.collegeName}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 ml-3">
                    <a 
                      href={`tel:${teacher.phone}`} 
                      onClick={(e) => e.stopPropagation()}
                      className="w-8 h-8 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded-lg flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                    >
                      <Phone size={14} />
                    </a>
                    <div className="text-gray-300 dark:text-slate-700">
                      {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </div>
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
                    <div className="p-6 pt-2 border-t border-gray-100 dark:border-slate-800 bg-gray-50/30 dark:bg-slate-900/50 space-y-6">
                      
                      {/* Special Categories Badge */}
                      {(teacher.isMedical || teacher.isPublicUniversity || teacher.canTeachHSC) && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {teacher.isMedical && (
                            <div className="flex items-center gap-1.5 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-[0.15em] border border-rose-100 dark:border-rose-900/30">
                              <Award size={12} /> Medical {teacher.medicalInstitution ? `(${teacher.medicalInstitution})` : ''}
                            </div>
                          )}
                          {teacher.isPublicUniversity && (
                            <div className="flex items-center gap-1.5 bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-[0.15em] border border-blue-100 dark:border-blue-900/30">
                              <Award size={12} /> Public University {teacher.publicUniversityName ? `(${teacher.publicUniversityName})` : ''}
                            </div>
                          )}
                          {teacher.canTeachHSC && (
                            <div className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-[0.15em] border border-emerald-100 dark:border-emerald-900/30">
                              <Award size={12} /> HSC ({teacher.hscSubject || "All"})
                            </div>
                          )}
                        </div>
                      )}

                      {/* Addresses */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-100 dark:border-slate-800 shadow-sm">
                          <div className="text-[8px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-2">বর্তমান ঠিকানা</div>
                          <div className="flex items-start gap-2 text-gray-800 dark:text-slate-200 text-[10px] font-black leading-relaxed">
                            <MapPin size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                            {teacher.presentAddress}
                          </div>
                        </div>
                        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-100 dark:border-slate-800 shadow-sm">
                          <div className="text-[8px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-2">স্থায়ী ঠিকানা</div>
                          <div className="flex items-start gap-2 text-gray-800 dark:text-slate-200 text-[10px] font-black leading-relaxed">
                            <MapPin size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                            {teacher.permanentAddress}
                          </div>
                        </div>
                      </div>

                      {/* Education */}
                      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm">
                        <div className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                          <div className="p-1.5 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg">
                            <GraduationCap size={14} />
                          </div>
                          শিক্ষাগত যোগ্যতা
                        </div>
                        <div className="space-y-3">
                          <div className="grid grid-cols-4 gap-2 text-[10px]">
                            <div className="font-black text-gray-900 dark:text-white uppercase tracking-tighter">SSC</div>
                            <div className="text-gray-500 dark:text-slate-400 font-black">{teacher.education?.ssc?.year}</div>
                            <div className="text-gray-500 dark:text-slate-400 font-black">{teacher.education?.ssc?.group}</div>
                            <div className="text-emerald-600 dark:text-emerald-400 font-black">GPA: {teacher.education?.ssc?.gpa}</div>
                          </div>
                          <div className="grid grid-cols-4 gap-2 text-[10px] border-t border-gray-50 dark:border-slate-800 pt-3">
                            <div className="font-black text-gray-900 dark:text-white uppercase tracking-tighter">HSC</div>
                            <div className="text-gray-500 dark:text-slate-400 font-black">{teacher.education?.hsc?.year}</div>
                            <div className="text-gray-500 dark:text-slate-400 font-black">{teacher.education?.hsc?.group}</div>
                            <div className="text-emerald-600 dark:text-emerald-400 font-black">GPA: {teacher.education?.hsc?.gpa}</div>
                          </div>
                          <div className="grid grid-cols-4 gap-2 text-[10px] border-t border-gray-50 dark:border-slate-800 pt-3">
                            <div className="font-black text-gray-900 dark:text-white uppercase tracking-tighter">Honours</div>
                            <div className="text-gray-500 dark:text-slate-400 font-black">{teacher.education?.honours?.year}</div>
                            <div className="text-gray-500 dark:text-slate-400 font-black truncate">{teacher.education?.honours?.subject} ({teacher.education?.honours?.studyYear})</div>
                            <div className="text-emerald-600 dark:text-emerald-400 font-black">GPA: {teacher.education?.honours?.gpa}</div>
                          </div>
                        </div>
                      </div>

                      {/* Experience & Tuition */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-100 dark:border-slate-800 shadow-sm">
                          <div className="text-[8px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                            <Briefcase size={12} className="text-emerald-500" /> অভিজ্ঞতা
                          </div>
                          <div className="text-gray-800 dark:text-slate-200 text-[10px] font-black leading-relaxed">
                            {teacher.experience || "উল্লেখ নেই"}
                          </div>
                        </div>
                        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-100 dark:border-slate-800 shadow-sm">
                          <div className="text-[8px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                            <BookOpen size={12} className="text-emerald-500" /> বর্তমানে টিউশনি
                          </div>
                          <div className="text-gray-800 dark:text-slate-200 text-[10px] font-black">
                            {teacher.hasCurrentTuition ? (
                              <span className="text-emerald-600 dark:text-emerald-400 font-black bg-emerald-50 dark:bg-emerald-950/30 px-3 py-1 rounded-md border border-emerald-100 dark:border-emerald-900/20">আছে</span>
                            ) : (
                              <span className="text-rose-600 dark:text-rose-400 font-black bg-rose-50 dark:bg-rose-950/30 px-3 py-1 rounded-md border border-rose-100 dark:border-rose-900/20">নেই</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Interested Subjects */}
                      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-100 dark:border-slate-800 shadow-sm">
                        <div className="text-[8px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-2">আগ্রহী বিষয় ও শ্রেণী</div>
                        <div className="text-gray-800 dark:text-slate-200 text-xs font-black leading-relaxed">
                          {teacher.interestedSubjectsAndClasses || "উল্লেখ নেই"}
                        </div>
                      </div>

                      {/* Social & ID */}
                      {(teacher.facebookLink || teacher.studentIdUrl) && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {teacher.facebookLink && (
                            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-100 dark:border-slate-800 shadow-sm">
                              <div className="text-[8px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                <Facebook size={12} className="text-emerald-500" /> ফেসবুক প্রোফাইল
                              </div>
                              <a href={teacher.facebookLink} target="_blank" rel="noopener noreferrer" className="text-emerald-600 dark:text-emerald-400 text-[10px] font-black hover:underline truncate block">
                                {teacher.facebookLink}
                              </a>
                            </div>
                          )}
                          {teacher.studentIdUrl && (
                            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-100 dark:border-slate-800 shadow-sm">
                              <div className="text-[8px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
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

                      {/* Admin Teacher Notes */}
                      <AdminTeacherNotes teacher={teacher} />

                      {/* Admin Actions */}
                      <div className="flex items-center gap-3 pt-6 border-t border-gray-100 dark:border-slate-800">
                        <button
                          onClick={() => handleStatusChange(teacher.id, "Approved")}
                          disabled={processingId === teacher.id}
                          className="flex-1 flex items-center justify-center gap-2 py-3 bg-emerald-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-100 dark:shadow-none disabled:opacity-50"
                        >
                          {processingId === teacher.id ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                          Approve
                        </button>
                        <button
                          onClick={() => handleStatusChange(teacher.id, "Rejected")}
                          disabled={processingId === teacher.id}
                          className="flex-1 flex items-center justify-center gap-2 py-3 bg-rose-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-600 transition-all shadow-lg shadow-rose-100 dark:shadow-none disabled:opacity-50"
                        >
                          {processingId === teacher.id ? <Loader2 size={16} className="animate-spin" /> : <XCircle size={16} />}
                          Reject
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(teacher.id)}
                          disabled={processingId === teacher.id}
                          className="p-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl hover:bg-gray-800 dark:hover:bg-gray-100 transition-all shadow-lg shadow-gray-200 dark:shadow-none disabled:opacity-50"
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
          <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm">
            <Icon icon={Search} size={40} className="mx-auto text-gray-200 dark:text-slate-800 mb-3" />
            <p className="text-gray-400 dark:text-slate-500 text-sm font-bold">কোনো পেন্ডিং শিক্ষক পাওয়া যায়নি!</p>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={!!confirmDeleteId}
        title="শিক্ষক ডিলিট"
        message="আপনি কি নিশ্চিতভাবে এই শিক্ষককে ডিলিট করতে চান? এই কাজটি আর ফিরিয়ে আনা যাবে না।"
        onConfirm={() => confirmDeleteId && handleDelete(confirmDeleteId)}
        onCancel={() => setConfirmDeleteId(null)}
        isDanger={true}
      />
    </div>
  );
};
