import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, User, Phone, School, MapPin, Star, Check, Image as ImageIcon, BookOpen, Briefcase, GraduationCap, Award, Facebook, IdCard, Loader2, ChevronRight, ChevronLeft } from "lucide-react";
import { Icon } from "../ui/Icon";
import { Teacher } from "../../types";
import { toast } from "sonner";
import { useStore } from "../../store/useStore";

const KISHOREGANJ_AREAS = [
  "Harua (হারুয়া)", "Rathkhola (রথখোলা)", "Gaital (গাইট্যাল)", "Botrish (বত্রিশ)",
  "Akhrakhabazar (আখড়াবাজার)", "Boro Bazar (বড় বাজার)", "Nilganj (নীলগঞ্জ)",
  "Puran Thana (পুরান থানা)", "Tarapasha (তারা পাশা)", "Yashodal (যশোদল)",
  "Haybatnagar (হায়বতনগর)", "Ukilpara (উকিলপাড়া)", "Shikkok Polli (শিক্ষক পল্লী)",
  "Borpul (বড়পুল)", "Newtown (নিউটাউন)", "Others (অন্যান্য)"
];

const KISHOREGANJ_INSTITUTIONS = [
  "Gurudayal Govt. College", "Kishoreganj Govt. Boys' High School", 
  "SV Govt. Girls' High School", "Wali Nawaz Khan College", 
  "Kishoreganj Polytechnic Institute", "President Abdul Hamid Medical College", 
  "Shaheed Syed Nazrul Islam Medical College", "Kishoreganj Govt. Mahila College", "Others"
];

const GROUPS = ["Science (বিজ্ঞান)", "Commerce (ব্যবসায় শিক্ষা)", "Arts (মানবিক)"];
const HONOURS_SUBJECTS = [
  "Physics", "Chemistry", "Mathematics", "Zoology", "Botany", 
  "English", "Bangla", "Accounting", "Management", "Economics", 
  "Political Science", "History", "Islamic History", "Sociology", 
  "Social Work", "MBBS", "BDS", "Computer Science", "Others"
];

interface TeacherModalProps {
  onAdd: (teacher: Partial<Teacher>) => void;
  title?: string;
  buttonText?: string;
  isOpen?: boolean;
  onClose?: () => void;
}

export const TeacherModal: React.FC<TeacherModalProps> = ({ 
  onAdd,
  title = "নতুন শিক্ষক যোগ করুন",
  buttonText = "শিক্ষক যোগ করুন",
  isOpen: propIsOpen,
  onClose: propOnClose
}) => {
  const { isTeacherModalOpen, setIsTeacherModalOpen } = useStore();
  const isOpen = propIsOpen !== undefined ? propIsOpen : isTeacherModalOpen;
  const onClose = propOnClose || (() => setIsTeacherModalOpen(false));
  
  const [step, setStep] = useState(1);
  const totalSteps = 4;
  const years = Array.from({length: 2030 - 2010 + 1}, (_, i) => (2030 - i).toString());

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    photoUrl: "",
    collegeName: "",
    presentAddress: "",
    permanentAddress: "",
    sscYear: "", sscGroup: "", sscGpa: "",
    hscYear: "", hscGroup: "", hscGpa: "",
    honoursYear: "", honoursSubject: "", honoursStudyYear: "", honoursGpa: "",
    experience: "",
    hasCurrentTuition: false,
    interestedSubjectsAndClasses: "",
    isMedical: false,
    medicalInstitution: "",
    isPublicUniversity: false,
    publicUniversityName: "",
    canTeachHSC: false,
    hscSubject: "",
    facebookLink: "",
    studentIdUrl: "",
    rating: "5.0",
  });

  const [customCollege, setCustomCollege] = useState("");
  const [customPresentAddress, setCustomPresentAddress] = useState("");
  const [customHonoursSubject, setCustomHonoursSubject] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'photoUrl' | 'studentIdUrl') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.src = reader.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 600;
          const MAX_HEIGHT = 600;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          // Compress to JPEG with 0.7 quality
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
          setFormData(prev => ({ ...prev, [field]: compressedBase64 }));
        };
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      if (!/^01\d{9}$/.test(formData.phone)) {
        toast.error("সঠিক ফোন নম্বর দিন (১১ ডিজিট, ০১ দিয়ে শুরু)");
        setIsSubmitting(false);
        return;
      }
      const finalCollegeName = formData.collegeName === "Others" ? customCollege : formData.collegeName;
      const finalPresentAddress = formData.presentAddress === "Others (অন্যান্য)" ? customPresentAddress : formData.presentAddress;
      const finalHonoursSubject = formData.honoursSubject === "Others" ? customHonoursSubject : formData.honoursSubject;

      await onAdd({
        name: formData.name,
        phone: formData.phone,
        photoUrl: formData.photoUrl,
        collegeName: finalCollegeName,
        presentAddress: finalPresentAddress,
        permanentAddress: formData.permanentAddress,
        education: {
          ssc: { year: formData.sscYear, group: formData.sscGroup, gpa: formData.sscGpa },
          hsc: { year: formData.hscYear, group: formData.hscGroup, gpa: formData.hscGpa },
          honours: { year: formData.honoursYear, subject: finalHonoursSubject, studyYear: formData.honoursStudyYear, gpa: formData.honoursGpa },
        },
        experience: formData.experience,
        hasCurrentTuition: formData.hasCurrentTuition,
        interestedSubjectsAndClasses: formData.interestedSubjectsAndClasses,
        isMedical: formData.isMedical,
        medicalInstitution: formData.isMedical ? formData.medicalInstitution : "",
        isPublicUniversity: formData.isPublicUniversity,
        publicUniversityName: formData.isPublicUniversity ? formData.publicUniversityName : "",
        canTeachHSC: formData.canTeachHSC,
        hscSubject: formData.canTeachHSC ? formData.hscSubject : "",
        facebookLink: formData.facebookLink,
        studentIdUrl: formData.studentIdUrl,
        rating: parseFloat(formData.rating),
        createdAt: Date.now(),
      });
      
      toast.success("শিক্ষক সফলভাবে যোগ করা হয়েছে!");
      setFormData({
        name: "", phone: "", photoUrl: "", collegeName: "", presentAddress: "", permanentAddress: "",
        sscYear: "", sscGroup: "", sscGpa: "", hscYear: "", hscGroup: "", hscGpa: "",
        honoursYear: "", honoursSubject: "", honoursStudyYear: "", honoursGpa: "",
        experience: "", hasCurrentTuition: false, interestedSubjectsAndClasses: "", 
        isMedical: false, medicalInstitution: "", isPublicUniversity: false, 
        publicUniversityName: "", canTeachHSC: false, hscSubject: "", 
        facebookLink: "", studentIdUrl: "", rating: "5.0"
      });
      setStep(1);
      onClose();
    } catch (error) {
      // Error is handled by the parent component
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    if (step === 1) {
      if (!formData.name || !formData.phone || !formData.collegeName) {
        toast.error("অনুগ্রহ করে সব তারকা চিহ্নিত (*) তথ্য পূরণ করুন");
        return;
      }
    }
    if (step === 2) {
      if (!formData.presentAddress || !formData.permanentAddress) {
        toast.error("অনুগ্রহ করে ঠিকানা পূরণ করুন");
        return;
      }
    }
    setStep(s => Math.min(s + 1, totalSteps));
  };

  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden relative flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-emerald-600 dark:bg-emerald-600 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 text-white rounded-2xl flex items-center justify-center">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white tracking-tight">{title}</h3>
                  <p className="text-[10px] font-bold text-emerald-100 uppercase tracking-widest">ধাপ {step} / {totalSteps}</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <X size={20} className="text-white" />
              </button>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 shrink-0">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${(step / totalSteps) * 100}%` }}
                className="h-full bg-emerald-500"
              />
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar p-6 bg-white dark:bg-slate-900">
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  {step === 1 && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-1.5 h-4 bg-emerald-500 rounded-full" />
                        <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">১. প্রাথমিক তথ্য</h4>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">নাম *</label>
                          <div className="relative">
                            <Icon icon={User} size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-400" />
                            <input required type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full pl-12 pr-4 py-3 bg-slate-50/50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-800 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 shadow-sm transition-all text-sm font-medium text-slate-800 dark:text-slate-200" placeholder="শিক্ষকের নাম" />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">ফোন *</label>
                          <div className="relative">
                            <Icon icon={Phone} size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-400" />
                            <input required type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full pl-12 pr-4 py-3 bg-slate-50/50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-800 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 shadow-sm transition-all text-sm font-medium text-slate-800 dark:text-slate-200" placeholder="ফোন নম্বর" />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">কলেজের নাম *</label>
                        <div className="relative">
                          <Icon icon={School} size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-400" />
                          <select required value={formData.collegeName} onChange={(e) => setFormData({ ...formData, collegeName: e.target.value })} className="w-full pl-12 pr-4 py-3 bg-slate-50/50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-800 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 shadow-sm transition-all text-sm font-medium text-slate-800 dark:text-slate-200 appearance-none">
                            <option value="" disabled>কলেজ নির্বাচন করুন</option>
                            {KISHOREGANJ_INSTITUTIONS.map(inst => <option key={inst} value={inst}>{inst}</option>)}
                          </select>
                        </div>
                        {formData.collegeName === "Others" && (
                          <input required type="text" value={customCollege} onChange={(e) => setCustomCollege(e.target.value)} className="w-full mt-2 px-4 py-3 bg-slate-50/50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-800 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 shadow-sm transition-all text-sm font-medium text-slate-800 dark:text-slate-200" placeholder="কলেজের নাম লিখুন" />
                        )}
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">ছবি (অপশনাল)</label>
                        <div className="relative">
                          <label className="cursor-pointer flex flex-col items-center justify-center w-full h-32 bg-slate-50/50 dark:bg-slate-800/50 rounded-xl border-2 border-dashed border-slate-100 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-800 hover:border-emerald-400 transition-colors">
                            <div className="flex flex-col items-center justify-center">
                              <Icon icon={ImageIcon} size={32} className="text-slate-400 mb-2" />
                              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                {formData.photoUrl ? "ছবি আপলোড হয়েছে" : "ক্লিক করে ছবি আপলোড করুন"}
                              </p>
                            </div>
                            <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'photoUrl')} />
                          </label>
                        </div>
                        <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold ml-4 mt-1">
                          * প্রোফাইল ভেরিফাই করার জন্য ছবি দেওয়া প্রয়োজন।
                        </p>
                      </div>
                    </div>
                  )}

                  {step === 2 && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-1.5 h-4 bg-emerald-500 rounded-full" />
                        <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">২. ঠিকানা</h4>
                      </div>
                      <div className="space-y-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">বর্তমান ঠিকানা *</label>
                          <div className="relative">
                            <Icon icon={MapPin} size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-400" />
                            <select required value={formData.presentAddress} onChange={(e) => setFormData({ ...formData, presentAddress: e.target.value })} className="w-full pl-12 pr-4 py-3 bg-slate-50/50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-800 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 shadow-sm transition-all text-sm font-medium text-slate-800 dark:text-slate-200 appearance-none">
                              <option value="" disabled>বর্তমান ঠিকানা নির্বাচন করুন</option>
                              {KISHOREGANJ_AREAS.map(area => <option key={area} value={area}>{area}</option>)}
                            </select>
                          </div>
                          {formData.presentAddress === "Others (অন্যান্য)" && (
                            <input required type="text" value={customPresentAddress} onChange={(e) => setCustomPresentAddress(e.target.value)} className="w-full mt-2 px-4 py-3 bg-slate-50/50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-800 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 shadow-sm transition-all text-sm font-medium text-slate-800 dark:text-slate-200" placeholder="বর্তমান ঠিকানা লিখুন" />
                          )}
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">স্থায়ী ঠিকানা *</label>
                          <div className="relative">
                            <Icon icon={MapPin} size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-400" />
                            <input required type="text" value={formData.permanentAddress} onChange={(e) => setFormData({ ...formData, permanentAddress: e.target.value })} className="w-full pl-12 pr-4 py-3 bg-slate-50/50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-800 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 shadow-sm transition-all text-sm font-medium text-slate-800 dark:text-slate-200" placeholder="স্থায়ী ঠিকানা" />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {step === 3 && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-1.5 h-4 bg-emerald-500 rounded-full" />
                        <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">৩. শিক্ষাগত যোগ্যতা</h4>
                      </div>
                      
                      <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl space-y-3">
                        <h5 className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2"><GraduationCap size={14}/> SSC</h5>
                        <div className="grid grid-cols-3 gap-3">
                          <select value={formData.sscYear} onChange={e => setFormData({...formData, sscYear: e.target.value})} className="w-full px-4 py-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-200 appearance-none">
                            <option value="">পাসের সন</option>
                            {years.map(y => <option key={y} value={y}>{y}</option>)}
                          </select>
                          <select value={formData.sscGroup} onChange={e => setFormData({...formData, sscGroup: e.target.value})} className="w-full px-4 py-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-200 appearance-none">
                            <option value="">গ্রুপ</option>
                            {GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
                          </select>
                          <input placeholder="GPA" value={formData.sscGpa} onChange={e => setFormData({...formData, sscGpa: e.target.value})} className="w-full px-4 py-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-200" />
                        </div>
                      </div>

                      <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl space-y-3">
                        <h5 className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2"><GraduationCap size={14}/> HSC</h5>
                        <div className="grid grid-cols-3 gap-3">
                          <select value={formData.hscYear} onChange={e => setFormData({...formData, hscYear: e.target.value})} className="w-full px-4 py-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-200 appearance-none">
                            <option value="">পাসের সন</option>
                            {years.map(y => <option key={y} value={y}>{y}</option>)}
                          </select>
                          <select value={formData.hscGroup} onChange={e => setFormData({...formData, hscGroup: e.target.value})} className="w-full px-4 py-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-200 appearance-none">
                            <option value="">গ্রুপ</option>
                            {GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
                          </select>
                          <input placeholder="GPA" value={formData.hscGpa} onChange={e => setFormData({...formData, hscGpa: e.target.value})} className="w-full px-4 py-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-200" />
                        </div>
                      </div>

                      <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl space-y-3">
                        <h5 className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2"><GraduationCap size={14}/> Honours</h5>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <select value={formData.honoursYear} onChange={e => setFormData({...formData, honoursYear: e.target.value})} className="w-full px-4 py-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-200 appearance-none">
                            <option value="">পাসের সন</option>
                            {years.map(y => <option key={y} value={y}>{y}</option>)}
                          </select>
                          <div className="space-y-2">
                            <select value={formData.honoursSubject} onChange={e => setFormData({...formData, honoursSubject: e.target.value})} className="w-full px-4 py-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-200 appearance-none">
                              <option value="">বিষয়</option>
                              {HONOURS_SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                            {formData.honoursSubject === "Others" && (
                              <input placeholder="বিষয় লিখুন" value={customHonoursSubject} onChange={e => setCustomHonoursSubject(e.target.value)} className="w-full px-4 py-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-200" />
                            )}
                          </div>
                          <select value={formData.honoursStudyYear} onChange={e => setFormData({...formData, honoursStudyYear: e.target.value})} className="w-full px-4 py-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-200 appearance-none">
                            <option value="">বর্ষ</option>
                            <option value="1st Year">1st Year</option>
                            <option value="2nd Year">2nd Year</option>
                            <option value="3rd Year">3rd Year</option>
                            <option value="4th Year">4th Year</option>
                            <option value="Masters">Masters</option>
                            <option value="Completed">Completed</option>
                          </select>
                          <input placeholder="GPA" value={formData.honoursGpa} onChange={e => setFormData({...formData, honoursGpa: e.target.value})} className="w-full px-4 py-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-200" />
                        </div>
                      </div>
                    </div>
                  )}

                  {step === 4 && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-1.5 h-4 bg-emerald-500 rounded-full" />
                        <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">৪. অন্যান্য তথ্য</h4>
                      </div>
                      
                      <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">অভিজ্ঞতা</label>
                          <div className="relative">
                            <Icon icon={Briefcase} size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-400" />
                            <input type="text" value={formData.experience} onChange={(e) => setFormData({ ...formData, experience: e.target.value })} className="w-full pl-12 pr-4 py-3 bg-slate-50/50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 text-sm font-medium text-slate-800 dark:text-slate-200" placeholder="উদা: ৩ বছরের অভিজ্ঞতা" />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">যেসব বিষয়ে এবং শ্রেণীতে পড়াতে আগ্রহী</label>
                          <div className="relative">
                            <Icon icon={BookOpen} size={18} className="absolute left-4 top-4 text-emerald-400" />
                            <textarea value={formData.interestedSubjectsAndClasses} onChange={(e) => setFormData({ ...formData, interestedSubjectsAndClasses: e.target.value })} className="w-full pl-12 pr-4 py-3 bg-slate-50/50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 text-sm font-medium text-slate-800 dark:text-slate-200 min-h-[80px]" placeholder="উদা: ৯ম-১২শ শ্রেণী (পদার্থ, গণিত)" />
                          </div>
                        </div>

                        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl space-y-3">
                          <span className="text-sm font-bold text-slate-700 dark:text-slate-300 block">স্পেশাল ক্যাটাগরি</span>
                          <div className="flex flex-wrap gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input type="checkbox" checked={formData.isMedical} onChange={(e) => setFormData({...formData, isMedical: e.target.checked})} className="w-4 h-4 text-emerald-600 rounded" />
                              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Medical</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input type="checkbox" checked={formData.isPublicUniversity} onChange={(e) => setFormData({...formData, isPublicUniversity: e.target.checked})} className="w-4 h-4 text-emerald-600 rounded" />
                              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Public University</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input type="checkbox" checked={formData.canTeachHSC} onChange={(e) => setFormData({...formData, canTeachHSC: e.target.checked})} className="w-4 h-4 text-emerald-600 rounded" />
                              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">HSC পড়াতে সক্ষম</span>
                            </label>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">ফেসবুক প্রোফাইল লিংক (অপশনাল)</label>
                          <div className="relative">
                            <Icon icon={Facebook} size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-400" />
                            <input type="url" value={formData.facebookLink} onChange={(e) => setFormData({ ...formData, facebookLink: e.target.value })} className="w-full pl-12 pr-4 py-3 bg-slate-50/50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 text-sm font-medium text-slate-800 dark:text-slate-200" placeholder="https://facebook.com/..." />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">স্টুডেন্ট আইডি কার্ডের ছবি (অপশনাল)</label>
                          <label className="cursor-pointer flex flex-col items-center justify-center w-full h-24 bg-slate-50/50 dark:bg-slate-800/50 rounded-xl border-2 border-dashed border-slate-100 dark:border-slate-800 hover:border-emerald-400 transition-colors">
                            <Icon icon={IdCard} size={24} className="text-slate-400 mb-1" />
                            <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
                              {formData.studentIdUrl ? "ছবি আপলোড হয়েছে" : "আইডি কার্ড আপলোড করুন"}
                            </p>
                            <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'studentIdUrl')} />
                          </label>
                          <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold ml-4 mt-1">
                            * ভেরিফাইড টিচার ব্যাজ পেতে স্টুডেন্ট আইডি কার্ডের ছবি দিন।
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Footer Navigation */}
            <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex gap-3 shrink-0">
              {step > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="flex-1 py-4 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-300 dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-2"
                >
                  <ChevronLeft size={16} />
                  পূর্ববর্তী
                </button>
              )}
              {step < totalSteps ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="flex-[2] py-4 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-emerald-500/20 hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
                >
                  পরবর্তী ধাপ
                  <ChevronRight size={16} />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex-[2] py-4 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-emerald-500/20 hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {buttonText}
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
