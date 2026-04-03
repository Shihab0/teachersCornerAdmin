import React, { useState, useEffect } from "react";
import { Icon } from "../ui/Icon";
import { CreditCard, DollarSign, User } from "lucide-react";
import { useStore } from "../../store/useStore";
import { cn } from "../../lib/utils";
import { toast } from "sonner";

interface PaymentModalProps {
  onConfirm: (collector: string, amount: number) => void;
}

export const PaymentModal = ({ onConfirm }: PaymentModalProps) => {
  const { paymentModalDealId, setPaymentModalDealId, deals } = useStore();
  const [paymentType, setPaymentType] = useState<"Full" | "Partial">("Full");
  const [amount, setAmount] = useState<string>("");
  const [collector, setCollector] = useState<string | null>(null);

  const deal = deals.find((d) => d.id === paymentModalDealId);
  const remaining = deal ? (deal.commission - (deal.paidAmount || 0)) : 0;

  useEffect(() => {
    if (deal) {
      setAmount(remaining.toString());
      setPaymentType("Full");
      setCollector(null);
    }
  }, [paymentModalDealId, deal, remaining]);

  if (!paymentModalDealId || !deal) return null;

  const handleConfirm = (selectedCollector: string) => {
    const payAmount = Number(amount);
    if (isNaN(payAmount) || payAmount <= 0) {
      toast.error("সঠিক টাকার পরিমাণ দিন");
      return;
    }
    if (payAmount > remaining) {
      toast.error("বকেয়া টাকার চেয়ে বেশি পেমেন্ট সম্ভব নয়");
      return;
    }
    onConfirm(selectedCollector, payAmount);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-6 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-[40px] p-8 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="bg-emerald-100 dark:bg-emerald-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon icon={DollarSign} size={32} className="text-emerald-600 dark:text-emerald-400" />
        </div>
        <h3 className="text-xl font-black mb-1 text-slate-800 dark:text-white text-center">কমিশন রিসিভ</h3>
        <p className="text-[10px] font-bold text-slate-400 uppercase mb-6 text-center">
          পেমেন্টের ধরণ এবং রিসিভার সিলেক্ট করুন
        </p>

        <div className="space-y-6">
          {/* Payment Type Toggle */}
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl">
            <button
              onClick={() => {
                setPaymentType("Full");
                setAmount(remaining.toString());
              }}
              className={cn(
                "flex-1 py-2 rounded-xl text-xs font-black transition-all",
                paymentType === "Full" 
                  ? "bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm" 
                  : "text-slate-500"
              )}
            >
              Full Payment
            </button>
            <button
              onClick={() => setPaymentType("Partial")}
              className={cn(
                "flex-1 py-2 rounded-xl text-xs font-black transition-all",
                paymentType === "Partial" 
                  ? "bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm" 
                  : "text-slate-500"
              )}
            >
              Partial
            </button>
          </div>

          {/* Amount Input */}
          <div className="space-y-2">
            <div className="flex justify-between items-center px-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">টাকার পরিমাণ</label>
              <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">বাকি: ৳{remaining}</span>
            </div>
            <div className="relative">
              <Icon icon={CreditCard} size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={paymentType === "Full"}
                className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 text-sm font-black text-slate-800 dark:text-white focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                placeholder="টাকার পরিমাণ"
              />
            </div>
            {paymentType === "Partial" && Number(amount) < remaining && (
              <p className="text-[10px] font-bold text-amber-600 dark:text-amber-400 px-2">
                পেমেন্টের পর বাকি থাকবে: ৳{remaining - Number(amount)}
              </p>
            )}
          </div>

          {/* Collector Selection */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">টাকা কে রিসিভ করেছেন?</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleConfirm("Dipu")}
                className="py-4 bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-400 font-black rounded-2xl border border-cyan-100 dark:border-cyan-900/30 flex flex-col items-center active:scale-95 transition-transform"
              >
                <Icon icon={User} size={20} className="mb-1" /> Dipu
              </button>
              <button
                onClick={() => handleConfirm("Shimanto")}
                className="py-4 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 font-black rounded-2xl border border-amber-100 dark:border-amber-900/30 flex flex-col items-center active:scale-95 transition-transform"
              >
                <Icon icon={User} size={20} className="mb-1" /> Shimanto
              </button>
            </div>
          </div>
        </div>

        <button
          onClick={() => setPaymentModalDealId(null)}
          className="w-full mt-6 py-4 text-slate-400 font-black text-[10px] uppercase tracking-widest bg-slate-50 dark:bg-slate-800 rounded-2xl active:scale-95 transition-transform"
        >
          বাতিল
        </button>
      </div>
    </div>
  );
};
