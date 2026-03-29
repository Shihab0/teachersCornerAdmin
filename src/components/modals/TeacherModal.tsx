import React, { useState } from "react";
import { X, User, Phone, School, MapPin, Star, Check, Image as ImageIcon, BookOpen, Briefcase, GraduationCap, Award, Facebook, IdCard, Loader2 } from "lucide-react";
import { Icon } from "../ui/Icon";
import { Teacher } from "../../types";
import { toast } from "sonner";

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
  isOpen: boolean;
  onClose: () => void;
  onAdd: (teacher: Partial<Teacher>) => void;
  title?: string;
  buttonText?: string;
}

export const TeacherModal: React.FC<TeacherModalProps> = ({ 
  isOpen, 
  onClose, 
  onAdd,
  title = "নতুন শিক্ষক যোগ করুন",
  buttonText = "শিক্ষক যোগ করুন"
}) => {
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
        setFormData(prev => ({ ...prev, [field]: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
      
      setFormData({
        name: "", phone: "", photoUrl: "", collegeName: "", presentAddress: "", permanentAddress: "",
        sscYear: "", sscGroup: "", sscGpa: "", hscYear: "", hscGroup: "", hscGpa: "",
        honoursYear: "", honoursSubject: "", honoursStudyYear: "", honoursGpa: "",
        experience: "", hasCurrentTuition: false, interestedSubjectsAndClasses: "", 
        isMedical: false, medicalInstitution: "", isPublicUniversity: false, publicUniversityName: "", canTeachHSC: false, hscSubject: "", facebookLink: "", studentIdUrl: "", rating: "5.0",
      });
      setCustomCollege("");
      setCustomPresentAddress("");
      setCustomHonoursSubject("");
      onClose();
    } catch (error) {
      console.error("Error submitting teacher form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-indigo-50/30">
          <h3 className="text-xl font-black text-indigo-900 tracking-tight">{title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-full transition-colors">
            <X size={20} className="text-indigo-900" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar">
          
          {/* Basic Info */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-indigo-600 border-b pb-2">১. প্রাথমিক তথ্য</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">নাম *</label>
                <div className="relative">
                  <Icon icon={User} size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400" />
                  <input required type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full pl-12 pr-4 py-3 bg-gray-50/50 rounded-xl border border-gray-200 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 shadow-sm transition-all text-sm font-medium text-gray-800 placeholder:text-gray-400" placeholder="শিক্ষকের নাম" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">ফোন *</label>
                <div className="relative">
                  <Icon icon={Phone} size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400" />
                  <input required type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full pl-12 pr-4 py-3 bg-gray-50/50 rounded-xl border border-gray-200 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 shadow-sm transition-all text-sm font-medium text-gray-800 placeholder:text-gray-400" placeholder="ফোন নম্বর" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">কলেজের নাম *</label>
                <div className="relative">
                  <Icon icon={School} size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400" />
                  <select required value={formData.collegeName} onChange={(e) => setFormData({ ...formData, collegeName: e.target.value })} className="w-full pl-12 pr-4 py-3 bg-gray-50/50 rounded-xl border border-gray-200 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 shadow-sm transition-all text-sm font-medium text-gray-800 appearance-none">
                    <option value="" disabled>কলেজ নির্বাচন করুন</option>
                    {KISHOREGANJ_INSTITUTIONS.map(inst => <option key={inst} value={inst}>{inst}</option>)}
                  </select>
                </div>
                {formData.collegeName === "Others" && (
                  <div className="mt-2">
                    <input required type="text" value={customCollege} onChange={(e) => setCustomCollege(e.target.value)} className="w-full px-4 py-3 bg-gray-50/50 rounded-xl border border-gray-200 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 shadow-sm transition-all text-sm font-medium text-gray-800 placeholder:text-gray-400" placeholder="কলেজের নাম লিখুন" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-indigo-600 border-b pb-2">২. ঠিকানা</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">বর্তমান ঠিকানা *</label>
                <div className="relative">
                  <Icon icon={MapPin} size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400" />
                  <select required value={formData.presentAddress} onChange={(e) => setFormData({ ...formData, presentAddress: e.target.value })} className="w-full pl-12 pr-4 py-3 bg-gray-50/50 rounded-xl border border-gray-200 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 shadow-sm transition-all text-sm font-medium text-gray-800 appearance-none">
                    <option value="" disabled>বর্তমান ঠিকানা নির্বাচন করুন</option>
                    {KISHOREGANJ_AREAS.map(area => <option key={area} value={area}>{area}</option>)}
                  </select>
                </div>
                {formData.presentAddress === "Others (অন্যান্য)" && (
                  <div className="mt-2">
                    <input required type="text" value={customPresentAddress} onChange={(e) => setCustomPresentAddress(e.target.value)} className="w-full px-4 py-3 bg-gray-50/50 rounded-xl border border-gray-200 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 shadow-sm transition-all text-sm font-medium text-gray-800 placeholder:text-gray-400" placeholder="বর্তমান ঠিকানা লিখুন" />
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">স্থায়ী ঠিকানা *</label>
                <div className="relative">
                  <Icon icon={MapPin} size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400" />
                  <input required type="text" value={formData.permanentAddress} onChange={(e) => setFormData({ ...formData, permanentAddress: e.target.value })} className="w-full pl-12 pr-4 py-3 bg-gray-50/50 rounded-xl border border-gray-200 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 shadow-sm transition-all text-sm font-medium text-gray-800 placeholder:text-gray-400" placeholder="স্থায়ী ঠিকানা" />
                </div>
              </div>
            </div>
          </div>

          {/* Education */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-indigo-600 border-b pb-2">৩. শিক্ষাগত যোগ্যতা</h4>
            
            {/* SSC */}
            <div className="bg-gray-50 p-4 rounded-2xl space-y-3">
              <h5 className="text-xs font-bold text-gray-700 flex items-center gap-2"><GraduationCap size={14}/> SSC</h5>
              <div className="grid grid-cols-3 gap-3">
                <select value={formData.sscYear} onChange={e => setFormData({...formData, sscYear: e.target.value})} className="w-full px-4 py-2 bg-gray-50/50 rounded-lg border border-gray-200 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all text-xs font-medium text-gray-800 appearance-none">
                  <option value="">পাসের সন</option>
                  {years.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
                <select value={formData.sscGroup} onChange={e => setFormData({...formData, sscGroup: e.target.value})} className="w-full px-4 py-2 bg-gray-50/50 rounded-lg border border-gray-200 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all text-xs font-medium text-gray-800 appearance-none">
                  <option value="">গ্রুপ</option>
                  {GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
                <input placeholder="GPA" value={formData.sscGpa} onChange={e => setFormData({...formData, sscGpa: e.target.value})} className="w-full px-4 py-2 bg-gray-50/50 rounded-lg border border-gray-200 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all text-xs font-medium text-gray-800 placeholder:text-gray-400" />
              </div>
            </div>

            {/* HSC */}
            <div className="bg-gray-50 p-4 rounded-2xl space-y-3">
              <h5 className="text-xs font-bold text-gray-700 flex items-center gap-2"><GraduationCap size={14}/> HSC</h5>
              <div className="grid grid-cols-3 gap-3">
                <select value={formData.hscYear} onChange={e => setFormData({...formData, hscYear: e.target.value})} className="w-full px-4 py-2 bg-gray-50/50 rounded-lg border border-gray-200 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all text-xs font-medium text-gray-800 appearance-none">
                  <option value="">পাসের সন</option>
                  {years.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
                <select value={formData.hscGroup} onChange={e => setFormData({...formData, hscGroup: e.target.value})} className="w-full px-4 py-2 bg-gray-50/50 rounded-lg border border-gray-200 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all text-xs font-medium text-gray-800 appearance-none">
                  <option value="">গ্রুপ</option>
                  {GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
                <input placeholder="GPA" value={formData.hscGpa} onChange={e => setFormData({...formData, hscGpa: e.target.value})} className="w-full px-4 py-2 bg-gray-50/50 rounded-lg border border-gray-200 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all text-xs font-medium text-gray-800 placeholder:text-gray-400" />
              </div>
            </div>

            {/* Honours */}
            <div className="bg-gray-50 p-4 rounded-2xl space-y-3">
              <h5 className="text-xs font-bold text-gray-700 flex items-center gap-2"><GraduationCap size={14}/> Honours</h5>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <select value={formData.honoursYear} onChange={e => setFormData({...formData, honoursYear: e.target.value})} className="w-full px-4 py-2 bg-gray-50/50 rounded-lg border border-gray-200 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all text-xs font-medium text-gray-800 appearance-none">
                  <option value="">পাসের সন</option>
                  {years.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
                <div className="space-y-2">
                  <select value={formData.honoursSubject} onChange={e => setFormData({...formData, honoursSubject: e.target.value})} className="w-full px-4 py-2 bg-gray-50/50 rounded-lg border border-gray-200 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all text-xs font-medium text-gray-800 appearance-none">
                    <option value="">বিষয়</option>
                    {HONOURS_SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  {formData.honoursSubject === "Others" && (
                    <input placeholder="বিষয় লিখুন" value={customHonoursSubject} onChange={e => setCustomHonoursSubject(e.target.value)} className="w-full px-4 py-2 bg-gray-50/50 rounded-lg border border-gray-200 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all text-xs font-medium text-gray-800 placeholder:text-gray-400" />
                  )}
                </div>
                <select value={formData.honoursStudyYear} onChange={e => setFormData({...formData, honoursStudyYear: e.target.value})} className="w-full px-4 py-2 bg-gray-50/50 rounded-lg border border-gray-200 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all text-xs font-medium text-gray-800 appearance-none">
                  <option value="">বর্ষ</option>
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                  <option value="Masters">Masters</option>
                  <option value="Completed">Completed</option>
                </select>
                <input placeholder="GPA" value={formData.honoursGpa} onChange={e => setFormData({...formData, honoursGpa: e.target.value})} className="w-full px-4 py-2 bg-gray-50/50 rounded-lg border border-gray-200 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all text-xs font-medium text-gray-800 placeholder:text-gray-400" />
              </div>
            </div>
          </div>

          {/* Special Category */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-indigo-600 border-b pb-2 flex items-center gap-2">
              <Award size={16} /> স্পেশাল ক্যাটাগরি (অপশনাল)
            </h4>
            <div className="bg-gray-50 p-4 rounded-2xl space-y-4">
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <div className={`w-5 h-5 rounded flex items-center justify-center border-2 transition-colors ${formData.isMedical ? 'bg-indigo-500 border-indigo-500' : 'bg-white border-gray-300'}`}>
                    {formData.isMedical && <Check size={14} className="text-white" />}
                  </div>
                  <input type="checkbox" className="hidden" checked={formData.isMedical} onChange={(e) => setFormData({...formData, isMedical: e.target.checked})} />
                  <span className="text-sm font-bold text-gray-700">Medical</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <div className={`w-5 h-5 rounded flex items-center justify-center border-2 transition-colors ${formData.isPublicUniversity ? 'bg-indigo-500 border-indigo-500' : 'bg-white border-gray-300'}`}>
                    {formData.isPublicUniversity && <Check size={14} className="text-white" />}
                  </div>
                  <input type="checkbox" className="hidden" checked={formData.isPublicUniversity} onChange={(e) => setFormData({...formData, isPublicUniversity: e.target.checked})} />
                  <span className="text-sm font-bold text-gray-700">Public University</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <div className={`w-5 h-5 rounded flex items-center justify-center border-2 transition-colors ${formData.canTeachHSC ? 'bg-indigo-500 border-indigo-500' : 'bg-white border-gray-300'}`}>
                    {formData.canTeachHSC && <Check size={14} className="text-white" />}
                  </div>
                  <input type="checkbox" className="hidden" checked={formData.canTeachHSC} onChange={(e) => setFormData({...formData, canTeachHSC: e.target.checked})} />
                  <span className="text-sm font-bold text-gray-700">HSC পড়াতে সক্ষম</span>
                </label>
              </div>

              {formData.isMedical && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                  <input 
                    type="text" 
                    placeholder="মেডিকেল কলেজের নাম লিখুন" 
                    value={formData.medicalInstitution} 
                    onChange={e => setFormData({...formData, medicalInstitution: e.target.value})} 
                    className="w-full px-4 py-3 bg-gray-50/50 rounded-xl border border-gray-200 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all text-sm font-medium text-gray-800 placeholder:text-gray-400" 
                  />
                </div>
              )}

              {formData.isPublicUniversity && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                  <input 
                    type="text" 
                    placeholder="পাবলিক বিশ্ববিদ্যালয়ের নাম লিখুন" 
                    value={formData.publicUniversityName} 
                    onChange={e => setFormData({...formData, publicUniversityName: e.target.value})} 
                    className="w-full px-4 py-3 bg-gray-50/50 rounded-xl border border-gray-200 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all text-sm font-medium text-gray-800 placeholder:text-gray-400" 
                  />
                </div>
              )}

              {formData.canTeachHSC && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                  <input 
                    type="text" 
                    placeholder="HSC এর কোন বিষয় পড়াতে সক্ষম? (উদা: পদার্থবিজ্ঞান, উচ্চতর গণিত)" 
                    value={formData.hscSubject} 
                    onChange={e => setFormData({...formData, hscSubject: e.target.value})} 
                    className="w-full px-4 py-3 bg-gray-50/50 rounded-xl border border-gray-200 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all text-sm font-medium text-gray-800 placeholder:text-gray-400" 
                  />
                </div>
              )}
            </div>
          </div>

          {/* Experience & Others */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-indigo-600 border-b pb-2">৪. অন্যান্য তথ্য</h4>
            
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">অভিজ্ঞতা</label>
              <div className="relative">
                <Icon icon={Briefcase} size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400" />
                <input type="text" value={formData.experience} onChange={(e) => setFormData({ ...formData, experience: e.target.value })} className="w-full pl-12 pr-4 py-3 bg-gray-50/50 rounded-xl border border-gray-200 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 shadow-sm transition-all text-sm font-medium text-gray-800 placeholder:text-gray-400" placeholder="উদা: ৩ বছরের অভিজ্ঞতা" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">যেসব বিষয়ে এবং শ্রেণীতে পড়াতে আগ্রহী</label>
              <div className="relative">
                <Icon icon={BookOpen} size={18} className="absolute left-4 top-4 text-indigo-400" />
                <textarea value={formData.interestedSubjectsAndClasses} onChange={(e) => setFormData({ ...formData, interestedSubjectsAndClasses: e.target.value })} className="w-full pl-12 pr-4 py-3 bg-gray-50/50 rounded-xl border border-gray-200 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 shadow-sm transition-all text-sm font-medium text-gray-800 placeholder:text-gray-400 min-h-[80px]" placeholder="উদা: ৯ম-১২শ শ্রেণী (পদার্থ, গণিত)" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">ফেসবুক প্রোফাইল লিংক / নাম (অপশনাল)</label>
              <div className="relative">
                <Icon icon={Facebook} size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400" />
                <input type="url" value={formData.facebookLink} onChange={(e) => setFormData({ ...formData, facebookLink: e.target.value })} className="w-full pl-12 pr-4 py-3 bg-gray-50/50 rounded-xl border border-gray-200 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 shadow-sm transition-all text-sm font-medium text-gray-800 placeholder:text-gray-400" placeholder="https://facebook.com/..." />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">স্টুডেন্ট আইডি কার্ডের ছবি (অপশনাল)</label>
              <div className="relative">
                <label className="cursor-pointer flex flex-col items-center justify-center w-full h-32 bg-gray-50/50 rounded-xl border-2 border-dashed border-gray-200 hover:bg-gray-50 hover:border-indigo-400 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Icon icon={IdCard} size={32} className="text-gray-400 mb-2" />
                    <p className="text-sm font-medium text-gray-600">
                      {formData.studentIdUrl ? "ছবি আপলোড হয়েছে" : "ক্লিক করে ছবি আপলোড করুন"}
                    </p>
                  </div>
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'studentIdUrl')} />
                </label>
              </div>
              <p className="text-xs text-indigo-600 font-medium ml-4 mt-1">
                * ভেরিফাইড টিচার ব্যাজ পেতে স্টুডেন্ট আইডি কার্ডের ছবি দিন।
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-2xl space-y-3">
              <span className="text-sm font-bold text-gray-700 block">বর্তমানে টিউশনি আছে কি?</span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, hasCurrentTuition: true })}
                  className={`flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all border-2 ${
                    formData.hasCurrentTuition ? "bg-emerald-50 border-emerald-500 text-emerald-600" : "bg-white border-gray-200 text-gray-400 hover:border-gray-300"
                  }`}
                >
                  হ্যাঁ
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, hasCurrentTuition: false })}
                  className={`flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all border-2 ${
                    !formData.hasCurrentTuition ? "bg-rose-50 border-rose-500 text-rose-600" : "bg-white border-gray-200 text-gray-400 hover:border-gray-300"
                  }`}
                >
                  না
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-indigo-600 text-white rounded-[24px] font-black text-sm shadow-xl shadow-indigo-100 active:scale-95 transition-transform mt-4 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {buttonText}
          </button>
        </form>
      </div>
    </div>
  );
};
