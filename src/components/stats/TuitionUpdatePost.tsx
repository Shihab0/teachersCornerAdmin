import React, { useRef, useState } from "react";
import * as htmlToImage from "html-to-image";
import { Download, CheckCircle2, Loader2, GraduationCap } from "lucide-react";
import { motion } from "motion/react";
import { Deal } from "../../types";
import { cn } from "../../lib/utils";

interface TuitionUpdatePostProps {
  deals: Deal[];
  hideDownload?: boolean;
}

export const TuitionUpdatePost: React.FC<TuitionUpdatePostProps> = ({ deals, hideDownload = false }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    if (!containerRef.current) return;
    setIsDownloading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const dataUrl = await htmlToImage.toPng(containerRef.current, {
        quality: 1.0,
        pixelRatio: 3,
        backgroundColor: "#020617",
        width: 360,
        height: 480,
      });
      
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `Tuition-Updates-${new Date().toISOString().split('T')[0]}.png`;
      link.click();
    } catch (error) {
      console.error("Error generating image:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 items-center w-full">
      {/* Downloadable Container */}
      <div
        id="tuition-post-container"
        ref={containerRef}
        className="w-[360px] h-[480px] bg-[#020617] rounded-[40px] p-8 shadow-2xl relative overflow-hidden flex flex-col items-center justify-between border border-white/5"
        style={{ display: 'flex', boxSizing: 'border-box' }}
      >
        {/* Premium Background Elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div 
            className="absolute -top-40 -right-40 w-96 h-96 rounded-full blur-[120px]"
            style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)' }}
          ></div>
          <div 
            className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full blur-[120px]"
            style={{ backgroundColor: 'rgba(99, 102, 241, 0.15)' }}
          ></div>
          <div className="absolute top-0 left-0 w-full h-full opacity-[0.05] bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px]"></div>
        </div>

        {/* Header Section */}
        <div className="relative z-10 text-center w-full">
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 text-[8px] font-black uppercase tracking-[0.3em] px-4 py-1.5 rounded-full mb-3"
            style={{ 
              backgroundColor: 'rgba(16, 185, 129, 0.1)', 
              border: '1px solid rgba(16, 185, 129, 0.2)',
              color: '#34d399'
            }}
          >
            <GraduationCap size={10} style={{ color: '#34d399' }} />
            Teacher's Corner
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="text-[24px] font-black text-white tracking-tight leading-tight mb-2"
          >
            Tuition <span style={{ color: '#34d399' }}>Updates</span>
          </motion.h2>
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: 48 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="h-1 mx-auto rounded-full shadow-[0_0_15px_rgba(16,185,129,0.4)]"
            style={{ background: 'linear-gradient(to right, #10b981, #6ee7b7)' }}
          ></motion.div>
        </div>

        {/* Rows Section */}
        <div className="relative z-10 w-full space-y-4">
          {deals.length === 0 ? (
            <div className="text-center py-10 bg-white/5 rounded-[32px] border border-white/10">
              <p className="text-slate-500 text-xs font-black uppercase tracking-widest">No recent updates available</p>
            </div>
          ) : (
            deals.slice(0, 5).map((deal, index) => (
              <motion.div
                key={deal.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index + 0.3 }}
                className="border rounded-[22px] p-4 flex items-center gap-4 transition-all bg-white/[0.04] border-white/10 hover:bg-white/[0.08] hover:border-white/20"
                style={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.04)',
                  borderColor: 'rgba(255, 255, 255, 0.1)'
                }}
              >
                <div 
                  className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border shadow-inner bg-emerald-500/10 border-emerald-500/20"
                  style={{
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    borderColor: 'rgba(16, 185, 129, 0.2)'
                  }}
                >
                  <CheckCircle2 className="w-5 h-5" style={{ color: '#34d399' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">
                      ID: {deal.tuitionId}
                    </span>
                    <span className="text-[9px] font-black text-white/20 uppercase tabular-nums">
                      {index + 1}
                    </span>
                  </div>
                  <h3 className="text-[15px] font-black truncate leading-tight tracking-tight text-white"
                  style={{ color: '#ffffff' }}
                  >
                    {deal.tutorName}
                  </h3>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Footer Section */}
        <div className="relative z-10 w-full text-center">
          <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-3"></div>
          <p className="text-white/30 text-[8px] font-black uppercase tracking-[0.25em]">
            Quality Education Support • Kishoreganj
          </p>
        </div>
      </div>

      {/* Download Button */}
      {!hideDownload && (
        <button
          onClick={handleDownload}
          disabled={isDownloading}
          className="flex items-center justify-center gap-3 w-full max-w-[360px] py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90 rounded-[28px] font-black text-[13px] uppercase tracking-widest transition-all shadow-2xl shadow-slate-900/20 dark:shadow-white/5 disabled:opacity-50 active:scale-[0.98]"
        >
          {isDownloading ? (
            <Loader2 size={20} className="animate-spin" />
          ) : (
            <Download size={20} />
          )}
          {isDownloading ? "Generating..." : "Download Update Post"}
        </button>
      )}
    </div>
  );
};
