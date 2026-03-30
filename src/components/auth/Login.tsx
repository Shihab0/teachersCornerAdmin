import React, { useState } from "react";
import { motion } from "motion/react";
import { Icon } from "../ui/Icon";
import { Toaster, toast } from "sonner";
import { 
  ShieldAlert, LogIn, Phone, ExternalLink, GraduationCap, Sparkles, 
  Loader2, MapPin, School, BookOpen, User, Briefcase, Award, 
  Facebook, IdCard, Check, Send, Heart, Users, Star, ArrowRight,
  ClipboardList, CheckCircle2, Info, Image as ImageIcon, Lightbulb,
  Rocket, Target, X, Moon, Sun
} from "lucide-react";
import { User as FirebaseUser } from "firebase/auth";
import { collection, addDoc } from "firebase/firestore";
import { db, appId } from "../../lib/firebase";
import { TeacherModal } from "../modals/TeacherModal";
import { GuardianModal } from "../modals/GuardianModal";
import { TuitionUpdatePost } from "../stats/TuitionUpdatePost";

import { Deal } from "../../types";

interface LoginProps {
  user: FirebaseUser | null;
  onLogin: () => Promise<void>;
  onLogout: () => void;
  deals?: Deal[];
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

export const Login = ({ user, onLogin, onLogout, deals = [], isDarkMode, toggleDarkMode }: LoginProps) => {
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [showGuardianModal, setShowGuardianModal] = useState(false);
  const [showTeacherModal, setShowTeacherModal] = useState(false);

  const handleTeacherSubmit = async (teacherData: any) => {
    try {
      const payload = {
        ...teacherData,
        status: "Pending",
        createdAt: Date.now(),
        rating: 5.0,
      };

      await addDoc(collection(db, "artifacts", appId, "public", "data", "tc_teachers"), payload);
      toast.success("আপনার সিভি সফলভাবে জমা হয়েছে! আমরা শীঘ্রই আপনার সাথে যোগাযোগ করব।");
    } catch (error) {
      console.error("Error submitting CV:", error);
      toast.error("CV জমা দিতে সমস্যা হয়েছে। আবার চেষ্টা করুন।");
      throw error;
    }
  };

  const handleGuardianSubmit = async (guardianData: any) => {
    try {
      const payload = {
        ...guardianData,
        status: "Pending",
        createdAt: Date.now(),
      };
      await addDoc(collection(db, "artifacts", appId, "public", "data", "tc_tuition_requests"), payload);
      toast.success("আপনার রিকোয়েস্ট সফলভাবে জমা হয়েছে! আমরা শীঘ্রই যোগাযোগ করব।");
    } catch (error) {
      console.error("Error submitting request:", error);
      toast.error("অনুরোধ জমা দিতে সমস্যা হয়েছে। আবার চেষ্টা করুন।");
      throw error;
    }
  };

  const handleLogin = async () => {
    setIsLoggingIn(true);
    try {
      await onLogin();
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fdfdfd] dark:bg-[#020617] selection:bg-emerald-500/30 font-sans overflow-x-hidden transition-colors duration-500">
      <Toaster position="top-center" richColors />
      
      {/* Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-slate-100 dark:border-slate-800/50 px-6 py-4 transition-all duration-500">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <div className="w-10 h-10 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-200 dark:shadow-none rotate-3 hover:rotate-0 transition-transform">
              <GraduationCap className="text-white w-6 h-6" />
            </div>
            <span className="text-xl font-black text-slate-900 dark:text-white tracking-tighter">
              Teacher's <span className="text-emerald-600">CORNER</span>
            </span>
          </motion.div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={toggleDarkMode}
              className="w-11 h-11 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-all active:scale-90"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button
              onClick={handleLogin}
              disabled={isLoggingIn}
              className="px-6 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-200 dark:shadow-none hover:bg-slate-800 dark:hover:bg-slate-100 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
            >
              {isLoggingIn ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
              Admin
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section - Split Layout Style */}
      <section className="relative pt-32 pb-20 px-6 min-h-[90vh] flex items-center">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-8 border border-emerald-100 dark:border-emerald-500/20">
              <Sparkles className="w-3.5 h-3.5" />
              Kishoreganj's Premier Tuition Media
            </div>
            
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-slate-900 dark:text-white leading-[0.95] mb-8 tracking-tighter text-balance">
              আপনার সন্তানের <br />
              <span className="text-emerald-600 italic">ভবিষ্যৎ</span> গড়ুন
            </h1>
            
            <p className="text-lg md:text-xl text-slate-500 dark:text-slate-400 max-w-xl mb-12 font-medium leading-relaxed">
              কিশোরগঞ্জের অভিজ্ঞ এবং মেধাবী শিক্ষকদের সাথে সরাসরি যোগাযোগ। আপনার প্রয়োজন অনুযায়ী সেরা শিক্ষক খুঁজে পেতে আমরা আছি আপনার পাশে।
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <button
                onClick={() => setShowGuardianModal(true)}
                className="w-full sm:w-auto px-10 py-5 bg-emerald-600 text-white rounded-[28px] font-black text-sm uppercase tracking-widest shadow-2xl shadow-emerald-200 dark:shadow-none hover:bg-emerald-700 hover:-translate-y-1 transition-all active:scale-95 flex items-center justify-center gap-3"
              >
                <Heart className="w-5 h-5" />
                টিউটর প্রয়োজন
              </button>
              <button
                onClick={() => setShowTeacherModal(true)}
                className="w-full sm:w-auto px-10 py-5 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-2 border-slate-100 dark:border-slate-800 rounded-[28px] font-black text-sm uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-800 hover:-translate-y-1 transition-all active:scale-95 flex items-center justify-center gap-3"
              >
                <Users className="w-5 h-5" />
                শিক্ষক হিসেবে যোগ দিন
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotate: 5 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative hidden lg:block"
          >
            <div className="relative z-10 rounded-[60px] overflow-hidden aspect-[4/5] shadow-2xl">
              <img 
                src="https://picsum.photos/seed/education/800/1000" 
                alt="Education" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/60 to-transparent"></div>
              
              <div className="absolute bottom-10 left-10 right-10 glass p-8 rounded-[40px] border-white/20">
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex -space-x-3">
                    {[1,2,3,4].map(i => (
                      <div key={i} className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-900 overflow-hidden">
                        <img src={`https://i.pravatar.cc/100?u=${i}`} alt="User" referrerPolicy="no-referrer" />
                      </div>
                    ))}
                  </div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">
                    ৫০০+ অভিভাবক আমাদের ওপর আস্থাশীল
                  </div>
                </div>
                <div className="flex items-center gap-1 text-amber-400">
                  {[1,2,3,4,5].map(i => <Star key={i} size={14} fill="currentColor" />)}
                  <span className="ml-2 text-xs font-black text-slate-900 dark:text-white">৪.৯/৫ রেটিং</span>
                </div>
              </div>
            </div>
            
            {/* Decorative Elements */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-500/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-indigo-500/10 rounded-full blur-3xl animate-pulse delay-700"></div>
          </motion.div>
        </div>
      </section>

      {/* Stats Grid - Bento Style */}
      <section className="py-24 px-6 bg-slate-50 dark:bg-slate-900/30 transition-colors">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: "সফল টিউশন", value: "৫০০+", icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-500/10" },
              { label: "অভিজ্ঞ শিক্ষক", value: "১০০০+", icon: Users, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-500/10" },
              { label: "সন্তুষ্ট অভিভাবক", value: "৪৫০+", icon: Heart, color: "text-rose-500", bg: "bg-rose-50 dark:bg-rose-500/10" },
              { label: "গড় রেটিং", value: "৪.৯/৫", icon: Star, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-500/10" },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-slate-100 dark:border-slate-800 card-shadow group hover:-translate-y-2 transition-all duration-500"
              >
                <div className={`w-14 h-14 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <stat.icon className="w-7 h-7" />
                </div>
                <div className="text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tighter">{stat.value}</div>
                <div className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features / Tips Section */}
      <section className="py-32 px-6 relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
            <div className="max-w-2xl">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-6"
              >
                <Lightbulb className="w-4 h-4" />
                Learning Strategy
              </motion.div>
              <h2 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tighter leading-[1.1]">
                পড়াশোনায় ভালো করার <br />
                <span className="text-emerald-600">গোপন টিপস</span>
              </h2>
            </div>
            <p className="text-slate-500 dark:text-slate-400 font-medium max-w-sm mb-2">
              আমাদের অভিজ্ঞ শিক্ষকদের পরামর্শ অনুযায়ী পড়াশোনার সঠিক কৌশল অবলম্বন করলে সাফল্য নিশ্চিত।
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "রুটিন মাফিক পড়া",
                desc: "প্রতিদিন একটি নির্দিষ্ট সময়ে পড়ার অভ্যাস গড়ে তুলুন। এতে মস্তিষ্কের একাগ্রতা বাড়ে এবং পড়া সহজে আয়ত্ত হয়।",
                icon: Target,
                color: "text-blue-500",
                bg: "bg-blue-50 dark:bg-blue-500/10"
              },
              {
                title: "বুঝে পড়া",
                desc: "মুখস্থ না করে বিষয়টি বোঝার চেষ্টা করুন। প্রয়োজনে শিক্ষকের সহায়তা নিন এবং বাস্তব উদাহরণ দিয়ে শিখুন।",
                icon: BookOpen,
                color: "text-emerald-500",
                bg: "bg-emerald-50 dark:bg-emerald-500/10"
              },
              {
                title: "নিয়মিত রিভিশন",
                desc: "যা পড়লেন তা সপ্তাহে অন্তত একবার রিভিশন দিন। এতে পড়া দীর্ঘস্থায়ী হয় এবং পরীক্ষার সময় চাপ কমে।",
                icon: Rocket,
                color: "text-purple-500",
                bg: "bg-purple-50 dark:bg-purple-500/10"
              }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative p-10 rounded-[48px] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 card-shadow group"
              >
                <div className={`w-16 h-16 ${item.bg} ${item.color} rounded-3xl flex items-center justify-center mb-8 group-hover:rotate-12 transition-transform`}>
                  <item.icon className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">{item.title}</h3>
                <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{item.desc}</p>
                
                <div className="absolute top-8 right-8 text-slate-100 dark:text-slate-800 font-black text-6xl -z-10 group-hover:text-emerald-500/10 transition-colors">
                  0{i + 1}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - Visual Cards */}
      <section className="py-32 px-6 bg-slate-900 dark:bg-slate-950 relative overflow-hidden transition-colors duration-500">
        <div className="absolute top-0 left-0 w-full h-full opacity-20 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:40px_40px]"></div>
        
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-6">আমাদের সাথে <span className="text-emerald-400">যুক্ত হোন</span></h2>
            <p className="text-slate-400 font-medium max-w-2xl mx-auto">অভিভাবক হিসেবে সেরা শিক্ষক খুঁজুন অথবা শিক্ষক হিসেবে আপনার ক্যারিয়ার শুরু করুন।</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div
              whileHover={{ y: -10 }}
              className="bg-white/5 backdrop-blur-xl p-12 rounded-[60px] border border-white/10 flex flex-col items-center text-center group"
            >
              <div className="w-24 h-24 bg-rose-500/20 text-rose-400 rounded-[32px] flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                <Heart className="w-12 h-12" />
              </div>
              <h3 className="text-3xl font-black text-white mb-4 tracking-tight">অভিভাবকদের জন্য</h3>
              <p className="text-slate-400 font-medium mb-10 leading-relaxed">আপনার সন্তানের জন্য সেরা শিক্ষক খুঁজে পেতে এখান থেকে রিকোয়েস্ট করুন। আমরা দ্রুত আপনার সাথে যোগাযোগ করব।</p>
              <button
                onClick={() => setShowGuardianModal(true)}
                className="px-10 py-5 bg-rose-600 text-white rounded-[24px] font-black text-xs uppercase tracking-widest hover:bg-rose-700 transition-all active:scale-95 flex items-center gap-3"
              >
                রিকোয়েস্ট করুন <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>

            <motion.div
              whileHover={{ y: -10 }}
              className="bg-white/5 backdrop-blur-xl p-12 rounded-[60px] border border-white/10 flex flex-col items-center text-center group"
            >
              <div className="w-24 h-24 bg-emerald-500/20 text-emerald-400 rounded-[32px] flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                <GraduationCap className="w-12 h-12" />
              </div>
              <h3 className="text-3xl font-black text-white mb-4 tracking-tight">শিক্ষকদের জন্য</h3>
              <p className="text-slate-400 font-medium mb-10 leading-relaxed">আমাদের সাথে শিক্ষক হিসেবে কাজ করতে চাইলে আপনার সিভি জমা দিন। কিশোরগঞ্জের সেরা টিউশনগুলো আপনার অপেক্ষায়।</p>
              <button
                onClick={() => setShowTeacherModal(true)}
                className="px-10 py-5 bg-emerald-600 text-white rounded-[24px] font-black text-xs uppercase tracking-widest hover:bg-emerald-700 transition-all active:scale-95 flex items-center gap-3"
              >
                সিভি জমা দিন <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Latest Success Stories */}
      {deals.length > 0 && (
        <section className="py-32 px-6 bg-white dark:bg-[#020617] transition-colors duration-500">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-6"
              >
                <Award className="w-4 h-4" />
                Success Stories
              </motion.div>
              <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter mb-4">সর্বশেষ ৫টি <span className="text-emerald-600">সফল টিউশন</span></h2>
            </div>
            
            <div className="flex justify-center">
              <TuitionUpdatePost deals={deals} hideDownload={true} />
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="py-20 px-6 bg-slate-900 dark:bg-slate-950 text-white border-t border-white/5 transition-colors duration-500">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 items-center mb-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-600 rounded-2xl flex items-center justify-center">
                <GraduationCap className="text-white w-6 h-6" />
              </div>
              <span className="text-2xl font-black tracking-tighter">
                Teacher's <span className="text-emerald-400">CORNER</span>
              </span>
            </div>
            
            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center gap-6">
                <a href="tel:+8801611536951" className="text-sm font-bold text-slate-400 hover:text-white transition-colors">01611-536951</a>
                <a href="tel:+8801609775933" className="text-sm font-bold text-slate-400 hover:text-white transition-colors">01609-775933</a>
              </div>
              <a href="https://facebook.com/groups/436666579040846" target="_blank" className="px-6 py-2 bg-white/5 hover:bg-white/10 rounded-full text-xs font-black uppercase tracking-widest transition-all">Facebook Group</a>
            </div>

            <div className="text-center md:text-right">
              <p className="text-xs font-black text-slate-500 uppercase tracking-[0.3em]">
                © 2026 Teacher's Corner
              </p>
              <p className="text-[10px] text-slate-600 mt-2">Kishoreganj, Bangladesh</p>
            </div>
          </div>
          
          <div className="pt-8 border-t border-white/5 text-center">
            <p className="text-[10px] text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed">
              আমরা কিশোরগঞ্জের শিক্ষার্থীদের মানসম্মত শিক্ষা নিশ্চিত করতে প্রতিশ্রুতিবদ্ধ। আমাদের সাথে যুক্ত হয়ে আপনার সন্তানের উজ্জ্বল ভবিষ্যৎ নিশ্চিত করুন।
            </p>
          </div>
        </div>
      </footer>

      <GuardianModal 
        isOpen={showGuardianModal} 
        onClose={() => setShowGuardianModal(false)} 
        onSubmit={handleGuardianSubmit} 
      />

      <TeacherModal 
        isOpen={showTeacherModal} 
        onClose={() => setShowTeacherModal(false)} 
        onAdd={handleTeacherSubmit}
        title="শিক্ষক হিসেবে যোগ দিন"
        buttonText="সিভি জমা দিন"
      />
    </div>
  );
};
