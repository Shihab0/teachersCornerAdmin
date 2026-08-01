import React from "react";
import { motion } from "motion/react";
import { GraduationCap, Award } from "lucide-react";
import { Teacher } from "../../types";
import { resolveTeacherGender } from "../../lib/utils";
import { FemaleAvatarPlaceholder, MaleAvatarPlaceholder } from "../ui/AvatarPlaceholder";

interface TeacherPreviewCardProps {
  teacher: Teacher;
  index: number;
}

const TeacherPreviewCard: React.FC<TeacherPreviewCardProps> = ({ teacher, index }) => {
  const gender = resolveTeacherGender(teacher);
  const isFemale = gender === "Female";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col items-center justify-center text-center relative overflow-hidden group"
    >
      {/* Profile Avatar */}
      <div className="w-20 h-20 rounded-full overflow-hidden mb-3 border-2 border-emerald-500/20 shadow-inner flex items-center justify-center bg-slate-50 dark:bg-slate-800">
        {isFemale ? (
          <FemaleAvatarPlaceholder className="w-full h-full object-cover" />
        ) : teacher.photoUrl ? (
          <img
            src={teacher.photoUrl}
            alt={teacher.name || "Tutor Avatar"}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <MaleAvatarPlaceholder className="w-full h-full object-cover" />
        )}
      </div>

      {/* Teacher Name */}
      <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 line-clamp-1 mb-1">
        {teacher.name || "শিক্ষক"}
      </h3>

      {/* College Name */}
      <div className="flex items-center justify-center gap-1.5 text-slate-500 dark:text-slate-400 font-bold text-xs line-clamp-1">
        <GraduationCap size={14} className="text-emerald-500 shrink-0" />
        <span>{teacher.collegeName || "কলেজ উল্লেখ নেই"}</span>
      </div>
    </motion.div>
  );
};

interface TeacherPreviewListProps {
  teachers: Teacher[];
}

export const TeacherPreviewList: React.FC<TeacherPreviewListProps> = ({ teachers }) => {
  if (!teachers || teachers.length === 0) {
    return null;
  }

  return (
    <section className="py-12 px-4 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="flex flex-col items-center text-center mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-xs font-black uppercase tracking-widest mb-3">
          <Award size={14} />
          <span>ভেরিফাইড টিউটর পুল</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          আমাদের শিক্ষকবৃন্দ
        </h2>
        <p className="text-xs md:text-sm font-bold text-slate-500 dark:text-slate-400 mt-2 max-w-xl">
          অভিজ্ঞ ও ভেরিফাইড গৃহশিক্ষক খুঁজে নিতে আমাদের সার্ভিস ব্যবহার করুন
        </p>
      </div>

      {/* Grid of Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {teachers.map((teacher, index) => (
          <TeacherPreviewCard key={teacher.id} teacher={teacher} index={index} />
        ))}
      </div>
    </section>
  );
};
