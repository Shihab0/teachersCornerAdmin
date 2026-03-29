import React, { useState } from "react";
import { motion } from "motion/react";
import { Icon } from "../ui/Icon";
import { Toaster, toast } from "sonner";
import { 
  ShieldAlert, LogIn, Phone, ExternalLink, GraduationCap, Sparkles, 
  Loader2, MapPin, School, BookOpen, User, Briefcase, Award, 
  Facebook, IdCard, Check, Send, Heart, Users, Star, ArrowRight,
  ClipboardList, CheckCircle2, Info, Image as ImageIcon, Lightbulb,
  Rocket, Target, X
} from "lucide-react";
import { User as FirebaseUser } from "firebase/auth";
import { collection, addDoc } from "firebase/firestore";
import { db, appId } from "../../lib/firebase";
import { TeacherModal } from "../modals/TeacherModal";
import { GuardianModal } from "../modals/GuardianModal";

import { Deal } from "../../types";

interface LoginProps {
  user: FirebaseUser | null;
  onLogin: () => Promise<void>;
  onLogout: () => void;
  deals?: Deal[];
}

export const Login = ({ user, onLogin, onLogout, deals = [] }: LoginProps) => {
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
    <div className="min-h-screen bg-slate-50 selection:bg-indigo-500/30 font-sans overflow-x-hidden">
      <Toaster position="top-center" richColors />
      {/* Top Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
              <GraduationCap className="text-white w-6 h-6" />
            </div>
            <span className="text-xl font-black text-slate-900 tracking-tight">
              Teacher's <span className="text-indigo-600">CORNER</span>
            </span>
          </div>
          
          <button
            onClick={handleLogin}
            disabled={isLoggingIn}
            className="w-10 h-10 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-slate-200 hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-50 group relative"
            title="Admin Login"
          >
            {isLoggingIn ? <Loader2 className="w-5 h-5 animate-spin" /> : <LogIn className="w-5 h-5" />}
            <span className="absolute -bottom-8 right-0 bg-slate-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">Admin Login</span>
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <motion.div 
          animate={{ 
            y: [0, -20, 0],
            rotate: [0, 5, 0]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="absolute top-20 right-[10%] w-32 h-32 bg-indigo-200/20 rounded-full blur-2xl -z-10"
        />
        <motion.div 
          animate={{ 
            y: [0, 20, 0],
            rotate: [0, -5, 0]
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-20 left-[10%] w-48 h-48 bg-rose-200/20 rounded-full blur-3xl -z-10"
        />
        
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-full bg-gradient-to-b from-indigo-50 to-transparent rounded-full blur-[120px] opacity-60"></div>
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-full text-xs font-black uppercase tracking-widest mb-8"
          >
            <Sparkles className="w-4 h-4" />
            কিশোরগঞ্জের সেরা টিউশন মিডিয়া
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-black text-slate-900 leading-[1.1] mb-6 tracking-tight"
          >
            আপনার সন্তানের জন্য <br />
            <span className="text-indigo-600">সেরা শিক্ষক</span> খুঁজে নিন
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-slate-500 max-w-2xl mx-auto mb-12 font-medium leading-relaxed"
          >
            আমরা কিশোরগঞ্জের অভিজ্ঞ এবং মেধাবী শিক্ষকদের সাথে অভিভাবকদের সরাসরি যোগাযোগ করিয়ে দিই। আপনার প্রয়োজন অনুযায়ী শিক্ষক পেতে আজই আবেদন করুন।
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <button
              onClick={() => setShowGuardianModal(true)}
              className="w-full sm:w-auto px-8 py-5 bg-indigo-600 text-white rounded-[24px] font-black text-sm uppercase tracking-widest shadow-2xl shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <Heart className="w-5 h-5" />
              টিউটর প্রয়োজন
            </button>
            <button
              onClick={() => setShowTeacherModal(true)}
              className="w-full sm:w-auto px-8 py-5 bg-white text-slate-900 border-2 border-slate-100 rounded-[24px] font-black text-sm uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <Users className="w-5 h-5" />
              শিক্ষক হিসেবে যোগ দিন
            </button>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 px-6 relative">
        <div className="absolute top-1/2 left-0 w-64 h-64 bg-indigo-100/30 rounded-full blur-3xl -z-10"></div>
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "সফল টিউশন", value: "৫০০+", icon: CheckCircle2, color: "text-emerald-500" },
            { label: "অভিজ্ঞ শিক্ষক", value: "১০০০+", icon: Users, color: "text-indigo-500" },
            { label: "সন্তুষ্ট অভিভাবক", value: "৪৫০+", icon: Heart, color: "text-rose-500" },
            { label: "গড় রেটিং", value: "৪.৯/৫", icon: Star, color: "text-amber-500" },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white/60 backdrop-blur-sm p-6 rounded-[32px] border border-gray-100 text-center shadow-sm hover:shadow-md transition-shadow"
            >
              <stat.icon className={`w-8 h-8 mx-auto mb-3 ${stat.color}`} />
              <div className="text-2xl font-black text-slate-900 mb-1">{stat.value}</div>
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Student Resources Section */}
      <section className="py-20 px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-50 rounded-full blur-[100px] -z-10 opacity-50"></div>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-600 rounded-full text-xs font-black uppercase tracking-widest mb-4"
            >
              <Lightbulb className="w-4 h-4" />
              শিক্ষার্থীদের জন্য টিপস
            </motion.div>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">পড়াশোনায় ভালো করার <span className="text-indigo-600">গোপন টিপস</span></h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "রুটিন মাফিক পড়া",
                desc: "প্রতিদিন একটি নির্দিষ্ট সময়ে পড়ার অভ্যাস গড়ে তুলুন। এতে মস্তিষ্কের একাগ্রতা বাড়ে।",
                icon: Target,
                color: "bg-blue-100 text-blue-600"
              },
              {
                title: "বুঝে পড়া",
                desc: "মুখস্থ না করে বিষয়টি বোঝার চেষ্টা করুন। প্রয়োজনে শিক্ষকের সহায়তা নিন।",
                icon: BookOpen,
                color: "bg-indigo-100 text-indigo-600"
              },
              {
                title: "নিয়মিত রিভিশন",
                desc: "যা পড়লেন তা সপ্তাহে অন্তত একবার রিভিশন দিন। এতে পড়া দীর্ঘস্থায়ী হয়।",
                icon: Rocket,
                color: "bg-purple-100 text-purple-600"
              }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm hover:shadow-xl transition-all group"
              >
                <div className={`w-14 h-14 ${item.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <item.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-3">{item.title}</h3>
                <p className="text-sm text-slate-500 font-medium leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Updates Section */}
      {deals.length > 0 && (
        <section className="py-20 px-6 bg-slate-900 overflow-hidden relative">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:32px_32px]"></div>
          <div className="max-w-4xl mx-auto relative z-10">
            <div className="text-center mb-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-black uppercase tracking-widest mb-4"
              >
                <Award className="w-4 h-4" />
                সফল টিউশন আপডেট
              </motion.div>
              <h2 className="text-3xl font-black text-white tracking-tight">সর্বশেষ ৫টি <span className="text-emerald-400">সফল টিউশন</span></h2>
            </div>

            <div className="grid gap-4">
              {deals.map((deal, i) => (
                <motion.div
                  key={deal.id}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white/5 backdrop-blur-md border border-white/10 p-5 rounded-3xl flex items-center justify-between group hover:bg-white/10 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-[10px] font-black text-emerald-400/60 uppercase tracking-widest mb-1">ID: {deal.tuitionId}</div>
                      <div className="text-lg font-bold text-white tracking-wide">{deal.tutorName}</div>
                    </div>
                  </div>
                  <div className="hidden sm:block">
                    <div className="px-4 py-2 bg-white/5 rounded-xl text-[10px] font-black text-white/40 uppercase tracking-widest">
                      Confirmed
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Forms Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.button
              whileHover={{ y: -5 }}
              onClick={() => setShowGuardianModal(true)}
              className="bg-slate-50 p-10 rounded-[48px] border border-slate-100 text-center group transition-all hover:shadow-2xl hover:shadow-rose-100"
            >
              <div className="w-20 h-20 bg-rose-100 text-rose-600 rounded-[32px] flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Heart className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">অভিভাবকদের জন্য</h3>
              <p className="text-sm text-slate-500 font-medium mb-8">আপনার সন্তানের জন্য সেরা শিক্ষক খুঁজে পেতে এখান থেকে রিকোয়েস্ট করুন।</p>
              <div className="inline-flex items-center gap-2 text-rose-600 font-black text-xs uppercase tracking-widest">
                রিকোয়েস্ট করুন <ArrowRight className="w-4 h-4" />
              </div>
            </motion.button>

            <motion.button
              whileHover={{ y: -5 }}
              onClick={() => setShowTeacherModal(true)}
              className="bg-slate-50 p-10 rounded-[48px] border border-slate-100 text-center group transition-all hover:shadow-2xl hover:shadow-indigo-100"
            >
              <div className="w-20 h-20 bg-indigo-100 text-indigo-600 rounded-[32px] flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <GraduationCap className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">শিক্ষকদের জন্য</h3>
              <p className="text-sm text-slate-500 font-medium mb-8">আমাদের সাথে শিক্ষক হিসেবে কাজ করতে চাইলে আপনার সিভি জমা দিন।</p>
              <div className="inline-flex items-center gap-2 text-indigo-600 font-black text-xs uppercase tracking-widest">
                সিভি জমা দিন <ArrowRight className="w-4 h-4" />
              </div>
            </motion.button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center">
              <GraduationCap className="text-white w-5 h-5" />
            </div>
            <span className="text-lg font-black tracking-tight">
              Teacher's <span className="text-indigo-400">CORNER</span>
            </span>
          </div>
          
          <div className="flex items-center gap-6">
            <a href="tel:+8801611536951" className="text-xs font-bold text-slate-400 hover:text-white transition-colors">01611-536951</a>
            <a href="tel:+8801609775933" className="text-xs font-bold text-slate-400 hover:text-white transition-colors">01609-775933</a>
            <a href="https://facebook.com/groups/436666579040846" target="_blank" className="text-xs font-bold text-slate-400 hover:text-white transition-colors">Facebook Group</a>
          </div>

          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
            © 2026 Teacher's Corner Admin
          </p>
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

