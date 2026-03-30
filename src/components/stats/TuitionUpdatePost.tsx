import React, { useRef, useState } from "react";
import html2canvas from "html2canvas";
import { Download, CheckCircle2, Loader2, Award, GraduationCap } from "lucide-react";
import { Deal } from "../../types";

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
      
      const canvas = await html2canvas(containerRef.current, {
        scale: 3,
        useCORS: true,
        backgroundColor: "#020617",
        logging: false,
        width: 360,
        height: 480,
      });
      
      const image = canvas.toDataURL("image/png", 1.0);
      const link = document.createElement("a");
      link.href = image;
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
        className="w-[360px] h-[480px] bg-[#020617] rounded-[40px] p-10 shadow-2xl relative overflow-hidden flex flex-col items-center justify-between border border-white/5"
        style={{ display: 'flex', boxSizing: 'border-box' }}
      >
        {/* Premium Background Elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px]"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px]"></div>
          <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px]"></div>
        </div>

        {/* Header Section */}
        <div className="relative z-10 text-center w-full">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-black uppercase tracking-[0.3em] px-5 py-1.5 rounded-full mb-5">
            <GraduationCap size={12} className="text-emerald-400" />
            Teacher's Corner
          </div>
          <h2 className="text-[26px] font-black text-white tracking-tighter leading-tight mb-3">
            Tuition <span className="text-emerald-400">Updates</span>
          </h2>
          <div className="w-16 h-1 bg-gradient-to-r from-emerald-500 to-emerald-300 mx-auto rounded-full shadow-[0_0_15px_rgba(16,185,129,0.4)]"></div>
        </div>

        {/* Rows Section */}
        <div className="relative z-10 w-full space-y-3">
          {deals.slice(0, 5).map((deal, index) => (
            <div
              key={deal.id}
              className="bg-white/[0.03] border border-white/5 rounded-[20px] p-3.5 flex items-center gap-4 transition-all"
            >
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0 border border-emerald-500/20 shadow-inner">
                <CheckCircle2 className="w-4.5 h-4.5 text-emerald-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.15em]">
                    ID: {deal.tuitionId}
                  </span>
                  <span className="text-[8px] font-black text-white/10 uppercase tabular-nums">
                    {index + 1}
                  </span>
                </div>
                <h3 className="text-[15px] font-bold text-white truncate leading-none tracking-tight">
                  {deal.tutorName}
                </h3>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Section */}
        <div className="relative z-10 w-full text-center">
          <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-4"></div>
          <p className="text-white/20 text-[9px] font-black uppercase tracking-[0.25em]">
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
