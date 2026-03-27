import { Icon } from "../ui/Icon";
import { AlertTriangle } from "lucide-react";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDanger?: boolean;
}

export const ConfirmDialog = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  isDanger = true,
}: ConfirmDialogProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-[110] flex items-center justify-center p-6 backdrop-blur-sm">
      <div className="bg-white rounded-[32px] p-8 max-w-xs w-full shadow-2xl animate-in zoom-in-95 duration-200 text-center">
        <div
          className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5 ${
            isDanger ? "bg-red-50 text-red-500" : "bg-orange-50 text-orange-500"
          }`}
        >
          <Icon icon={AlertTriangle} size={32} />
        </div>
        <h3 className="text-lg font-black text-gray-800 mb-2">{title}</h3>
        <p className="text-gray-500 text-xs font-bold leading-relaxed mb-6">
          {message}
        </p>
        <div className="flex space-x-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3.5 bg-gray-100 text-gray-500 font-black rounded-xl text-[10px] uppercase active:scale-95 transition-transform"
          >
            বাতিল
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-3.5 text-white font-black rounded-xl text-[10px] uppercase shadow-lg active:scale-95 transition-transform ${
              isDanger ? "bg-red-500 shadow-red-200" : "bg-orange-500 shadow-orange-200"
            }`}
          >
            নিশ্চিত
          </button>
        </div>
      </div>
    </div>
  );
};
