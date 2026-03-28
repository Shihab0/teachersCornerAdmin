import React, { useRef, useState } from "react";
import html2canvas from "html2canvas";
import { Download, CheckCircle2, Loader2, Award } from "lucide-react";
import { Deal } from "../../types";

interface TuitionUpdatePostProps {
  deals: Deal[];
}

export const TuitionUpdatePost: React.FC<TuitionUpdatePostProps> = ({ deals }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    if (!containerRef.current) return;
    setIsDownloading(true);
    try {
      // Small delay to ensure any layout shifts are settled
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const canvas = await html2canvas(containerRef.current, {
        scale: 3, // 360 * 3 = 1080, 480 * 3 = 1440 (Exact 3:4 for FB)
        useCORS: true,
        backgroundColor: "#0f172a",
        logging: false,
        width: 360,
        height: 480,
        onclone: (clonedDoc) => {
          const el = clonedDoc.getElementById('tuition-post-container');
          if (el) {
            el.style.display = 'flex';
            el.style.boxShadow = 'none';
            el.style.border = 'none';
          }
        }
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
      {/* Downloadable Container - Fixed 3:4 Aspect Ratio (360x480) */}
      <div
        id="tuition-post-container"
        ref={containerRef}
        className="w-[360px] h-[480px] bg-[#0f172a] rounded-[32px] p-8 shadow-2xl relative overflow-hidden border border-white/10 flex flex-col items-center justify-between"
        style={{ display: 'flex', boxSizing: 'border-box' }}
      >
        {/* Premium Background Elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 -right-32 w-80 h-80 bg-indigo-500/20 rounded-full blur-[100px]"></div>
          <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-purple-500/20 rounded-full blur-[100px]"></div>
          <div className="absolute top-0 left-0 w-full h-full opacity-[0.05] bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px]"></div>
        </div>

        {/* Header Section */}
        <div className="relative z-10 text-center w-full pt-0.5">
          <div className="inline-block bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[8px] font-black uppercase tracking-[0.3em] px-4 py-1 rounded-full mb-3">
            Teacher's Corner
          </div>
          <h2 className="text-[22px] font-black text-white tracking-tight leading-tight mb-2.5">
            Last 5 Tuition Update
          </h2>
          <div className="w-12 h-1 bg-emerald-400 mx-auto rounded-full shadow-[0_0_10px_rgba(52,211,153,0.3)]"></div>
        </div>

        {/* Rows Section - Even Slimmer Rows */}
        <div className="relative z-10 w-full space-y-2 px-0.5">
          {deals.slice(0, 5).map((deal, index) => (
            <div
              key={deal.id}
              className="bg-white/[0.04] border border-white/5 rounded-[16px] p-2.5 flex items-center gap-3"
            >
              <div className="w-7 h-7 rounded-lg bg-emerald-400/10 flex items-center justify-center shrink-0 border border-emerald-400/20">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-0.5">
                  <span className="text-[8px] font-black text-indigo-300/80 uppercase tracking-[0.1em]">
                    ID: {deal.tuitionId}
                  </span>
                  <span className="text-[7px] font-bold text-white/10 uppercase tabular-nums">
                    #{index + 1}
                  </span>
                </div>
                <h3 className="text-[13px] font-bold text-white truncate leading-none tracking-wide">
                  {deal.tutorName}
                </h3>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Section */}
        <div className="relative z-10 w-full text-center pb-0.5">
          <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-3"></div>
          <p className="text-white/30 text-[8px] font-black uppercase tracking-[0.2em]">
            Quality Education Support • Kishoreganj
          </p>
        </div>
      </div>

      {/* Download Button */}
      <button
        onClick={handleDownload}
        disabled={isDownloading}
        className="flex items-center justify-center gap-3 w-full max-w-[360px] py-4.5 bg-indigo-600 text-white hover:bg-indigo-700 rounded-[24px] font-black text-[12px] uppercase tracking-widest transition-all shadow-2xl shadow-indigo-500/20 disabled:opacity-50 active:scale-[0.98]"
      >
        {isDownloading ? (
          <Loader2 size={18} className="animate-spin" />
        ) : (
          <Download size={18} />
        )}
        {isDownloading ? "Generating Post..." : "Download Update Post"}
      </button>
    </div>
  );
};
