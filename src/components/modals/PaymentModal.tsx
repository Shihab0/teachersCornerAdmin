import { Icon } from "../ui/Icon";
import { DollarSign, User } from "lucide-react";

interface PaymentModalProps {
  onProcess: (collector: string) => void;
  onClose: () => void;
}

export const PaymentModal = ({ onProcess, onClose }: PaymentModalProps) => {
  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-6 backdrop-blur-sm">
      <div className="bg-white rounded-[40px] p-8 max-w-xs w-full shadow-2xl animate-in zoom-in-95 duration-200 text-center">
        <div className="bg-emerald-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon icon={DollarSign} size={32} className="text-emerald-600" />
        </div>
        <h3 className="text-lg font-black mb-1 text-gray-800">কমিশন রিসিভ</h3>
        <p className="text-[10px] font-bold text-gray-400 uppercase mb-6">
          যিনি টাকা রিসিভ করেছেন সিলেক্ট করুন
        </p>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => onProcess("Dipu")}
            className="py-6 bg-cyan-50 text-cyan-700 font-black rounded-[24px] border border-cyan-100 flex flex-col items-center active:scale-95 transition-transform"
          >
            <Icon icon={User} size={24} className="mb-2" /> Dipu
          </button>
          <button
            onClick={() => onProcess("Shimanto")}
            className="py-6 bg-amber-50 text-amber-700 font-black rounded-[24px] border border-amber-100 flex flex-col items-center active:scale-95 transition-transform"
          >
            <Icon icon={User} size={24} className="mb-2" /> Shimanto
          </button>
        </div>
        <button
          onClick={onClose}
          className="w-full mt-5 py-4 text-gray-400 font-black text-[10px] uppercase tracking-widest bg-gray-50 rounded-[20px] active:scale-95 transition-transform"
        >
          বাতিল
        </button>
      </div>
    </div>
  );
};
