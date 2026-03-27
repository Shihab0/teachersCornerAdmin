import React, { useState } from "react";
import { motion, useMotionValue, useTransform, useSpring, AnimatePresence } from "motion/react";
import { Icon } from "../ui/Icon";
import { ShieldAlert, LogIn, Phone, ExternalLink, GraduationCap, Sparkles, Loader2 } from "lucide-react";
import { User as FirebaseUser } from "firebase/auth";

interface LoginProps {
  user: FirebaseUser | null;
  onLogin: () => Promise<void>;
  onLogout: () => void;
}

export const Login = ({ user, onLogin, onLogout }: LoginProps) => {
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  
  // Parallax values
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth spring physics for parallax
  const springConfig = { damping: 25, stiffness: 150 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  // Transform values for different layers
  const blob1X = useTransform(smoothX, [-500, 500], [-30, 30]);
  const blob1Y = useTransform(smoothY, [-500, 500], [-30, 30]);
  
  const blob2X = useTransform(smoothX, [-500, 500], [40, -40]);
  const blob2Y = useTransform(smoothY, [-500, 500], [40, -40]);

  const cardRotateX = useTransform(smoothY, [-500, 500], [5, -5]);
  const cardRotateY = useTransform(smoothX, [-500, 500], [-5, 5]);

  const handleMouseMove = (e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    const moveX = clientX - window.innerWidth / 2;
    const moveY = clientY - window.innerHeight / 2;
    mouseX.set(moveX);
    mouseY.set(moveY);
  };

  const handleLoginClick = async () => {
    setIsLoggingIn(true);
    try {
      await onLogin();
    } finally {
      setIsLoggingIn(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 100, damping: 15 },
    },
  };

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#020617] relative overflow-hidden selection:bg-indigo-500/30 font-sans"
      onMouseMove={handleMouseMove}
    >
      {/* Dynamic Background Elements with Parallax */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <motion.div
          style={{ x: blob1X, y: blob1Y }}
          className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-600/20 blur-[120px]"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          style={{ x: blob2X, y: blob2Y }}
          className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/20 blur-[120px]"
          animate={{
            scale: [1.1, 1, 1.1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        
        {/* Animated Grid Overlay */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:40px_40px]" />
      </div>

      <motion.div
        style={{ rotateX: cardRotateX, rotateY: cardRotateY, perspective: 1000 }}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-sm z-10"
      >
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="bg-slate-900/40 backdrop-blur-2xl p-8 rounded-[48px] shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] border border-white/10 text-center relative overflow-hidden group"
        >
          {/* Subtle Shine Effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none"
          />

          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.05, rotate: 5 }}
            className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-indigo-700 text-white rounded-[32px] flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-indigo-500/40 relative"
          >
            <Icon icon={GraduationCap} size={48} />
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute -inset-2 border border-dashed border-indigo-500/30 rounded-[40px] pointer-events-none"
            />
          </motion.div>

          <AnimatePresence mode="wait">
            {user && user.email ? (
              <motion.div
                key="denied"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.4 }}
              >
                <motion.div 
                  variants={itemVariants}
                  className="w-16 h-16 bg-red-500/10 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-red-500/20"
                >
                  <Icon icon={ShieldAlert} size={32} />
                </motion.div>
                <motion.h2 variants={itemVariants} className="text-2xl font-black text-white mb-2">প্রবেশাধিকার সংরক্ষিত</motion.h2>
                <motion.p variants={itemVariants} className="text-sm text-slate-400 mb-8 leading-relaxed">
                  আপনার ইমেইল (<span className="text-red-400 font-bold">{user.email}</span>) অ্যাডমিন হিসেবে অনুমোদিত নয়। অনুগ্রহ করে কর্তৃপক্ষের সাথে যোগাযোগ করুন।
                </motion.p>
                <motion.button
                  variants={itemVariants}
                  whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.1)" }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onLogout}
                  className="w-full bg-white/5 text-white py-4 rounded-2xl font-bold border border-white/10 transition-all"
                >
                  অন্য অ্যাকাউন্ট দিয়ে চেষ্টা করুন
                </motion.button>
              </motion.div>
            ) : (
              <motion.div
                key="login"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.4 }}
              >
                <motion.div variants={itemVariants} className="flex items-center justify-center space-x-2 mb-2">
                  <h2 className="text-3xl font-black text-white tracking-tight">
                    Teacher's <span className="text-indigo-400">CORNER</span>
                  </h2>
                  <motion.div
                    animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Icon icon={Sparkles} size={18} className="text-yellow-400" />
                  </motion.div>
                </motion.div>
                
                <motion.p variants={itemVariants} className="text-sm text-slate-400 mb-10 leading-relaxed font-medium">
                  অনলাইন টিউশন মিডিয়া প্ল্যাটফর্ম। <br />
                  অ্যাডমিন প্যানেলে স্বাগতম।
                </motion.p>

                <motion.button
                  variants={itemVariants}
                  whileHover={{ 
                    scale: 1.02, 
                    y: -2,
                    boxShadow: "0 20px 40px -12px rgba(99, 102, 241, 0.4)"
                  }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleLoginClick}
                  disabled={isLoggingIn}
                  className="w-full bg-white text-slate-950 py-4 rounded-2xl font-black flex items-center justify-center transition-all mb-10 relative group overflow-hidden disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <AnimatePresence mode="wait">
                    {isLoggingIn ? (
                      <motion.div
                        key="loading"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex items-center gap-2"
                      >
                        <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
                        <span>অপেক্ষা করুন...</span>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="idle"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex items-center gap-2"
                      >
                        <Icon icon={LogIn} size={20} className="mr-1 relative z-10" /> 
                        <span className="relative z-10">গুগল দিয়ে লগ-ইন করুন</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>

                <motion.div variants={itemVariants} className="bg-slate-800/30 rounded-3xl p-5 mb-6 border border-white/5 text-left">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 text-center">
                    জরুরী যোগাযোগ
                  </p>
                  <div className="flex flex-col space-y-2 items-center text-sm font-bold text-slate-300">
                    <motion.a 
                      whileHover={{ x: 3, color: "#818cf8" }}
                      href="tel:+8801611536951" 
                      className="flex items-center transition-colors"
                    >
                      <Icon icon={Phone} size={14} className="mr-2" /> 01611-536951
                    </motion.a>
                    <motion.a 
                      whileHover={{ x: 3, color: "#818cf8" }}
                      href="tel:+8801609775933" 
                      className="flex items-center transition-colors"
                    >
                      <Icon icon={Phone} size={14} className="mr-2" /> 01609-775933
                    </motion.a>
                  </div>
                </motion.div>

                <motion.a
                  variants={itemVariants}
                  whileHover={{ x: 5, color: "#a5b4fc" }}
                  href="https://www.facebook.com/groups/436666579040846/?ref=share&mibextid=NSMWBT"
                  target="_blank"
                  className="inline-flex items-center text-xs font-bold text-indigo-400 transition-colors"
                >
                  <Icon icon={ExternalLink} size={14} className="mr-2" /> আমাদের ফেসবুক গ্রুপ
                </motion.a>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 text-[10px] text-slate-500 font-bold uppercase tracking-[4px] z-10"
      >
        © 2026 Teacher's Corner Admin
      </motion.p>
    </div>
  );
};
