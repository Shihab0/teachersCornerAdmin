import React, { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { Icon } from "../ui/Icon";
import {
  Calendar,
  TrendingUp,
  Wallet,
  User,
  Scale,
  CheckCircle,
  AlertTriangle,
  Receipt,
  Edit,
  History,
  Trash2,
  ChevronDown,
  ChevronUp,
  RotateCcw
} from "lucide-react";
import { Expense, HistoryEntry } from "../../types";
import { cn } from "../../lib/utils";
import { ConfirmDialog } from "../modals/ConfirmDialog";

interface RevenueProps {
  revYear: string;
  setRevYear: (y: string) => void;
  revMonth: string;
  setRevMonth: (m: string) => void;
  revStats: any;
  expenses: Expense[];
  expenseForm: any;
  handleExpenseChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  handleAddExpense: (e: FormEvent) => void;
  isEditingExpense: boolean;
  setIsEditingExpense: (b: boolean) => void;
  setExpenseForm: (f: any) => void;
  onEditExpense: (exp: Expense) => void;
  onDeleteExpense: (id: string) => void;
  onHistoryClick: (data: { title: string; history: HistoryEntry[] }) => void;
  isProcessing?: boolean;
}

export const Revenue = ({
  revYear,
  setRevYear,
  revMonth,
  setRevMonth,
  revStats,
  expenses,
  expenseForm,
  handleExpenseChange,
  handleAddExpense,
  isEditingExpense,
  setIsEditingExpense,
  setExpenseForm,
  onEditExpense,
  onDeleteExpense,
  onHistoryClick,
  isProcessing = false,
}: RevenueProps) => {
  const [showAllExpenses, setShowAllExpenses] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const dNet = revStats.admins.Dipu - revStats.adminExps.Dipu;
  const sNet = revStats.admins.Shimanto - revStats.adminExps.Shimanto;
  const diff = Math.abs(dNet - sNet) / 2;
  const isEq = dNet === sNet;

  let msg = "হিসাব সম্পূর্ণ সমান!";
  if (dNet > sNet) {
    msg = `হিসাব সমান করতে Dipu-এর Shimanto-কে ৳${diff} দিতে হবে (বা খরচ করতে হবে)।`;
  } else if (sNet > dNet) {
    msg = `হিসাব সমান করতে Shimanto-এর Dipu-কে ৳${diff} দিতে হবে (বা খরচ করতে হবে)।`;
  }

  const displayedExpenses = showAllExpenses ? expenses : expenses.slice(0, 4);

  return (
    <div className="space-y-6 fade-in">
      <div className="flex flex-col gap-1 mb-8">
        <div className="flex items-center justify-between">
          <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none">
            রেভিনিউ <span className="text-emerald-600 dark:text-emerald-400 italic font-serif lowercase tracking-normal">& খরচ</span>
          </h2>
          <div className="flex space-x-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
            <select
              value={revYear}
              onChange={(e) => setRevYear(e.target.value)}
              className="bg-transparent border-none text-[10px] font-black text-slate-600 dark:text-slate-400 outline-none cursor-pointer px-2 uppercase tracking-widest"
            >
              <option value="All">সব বছর</option>
              <option value="2025">২০২৫</option>
              <option value="2026">২০২৬</option>
            </select>
            <div className="w-px h-4 bg-slate-300 dark:bg-slate-700 self-center" />
            <select
              value={revMonth}
              onChange={(e) => setRevMonth(e.target.value)}
              className="bg-transparent border-none text-[10px] font-black text-slate-600 dark:text-slate-400 outline-none cursor-pointer px-2 uppercase tracking-widest"
            >
              <option value="All">সব মাস</option>
              <option value="01">জানুয়ারি</option>
              <option value="02">ফেব্রুয়ারি</option>
              <option value="03">মার্চ</option>
              <option value="04">এপ্রিল</option>
              <option value="05">মে</option>
              <option value="06">জুন</option>
              <option value="07">জুলাই</option>
              <option value="08">আগস্ট</option>
              <option value="09">সেপ্টেম্বর</option>
              <option value="10">অক্টোবর</option>
              <option value="11">নভেম্বর</option>
              <option value="12">ডিসেম্বর</option>
            </select>
          </div>
        </div>
        <div className="h-px bg-slate-200 dark:bg-slate-800 w-full mt-3" />
      </div>

      <div className="bg-slate-900 dark:bg-slate-900 p-10 rounded-[48px] text-white shadow-2xl relative overflow-hidden border border-white/5">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/20 rounded-full -mr-40 -mt-40 blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full -ml-32 -mb-32 blur-3xl"></div>
        
        <div className="relative z-10">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-black text-emerald-400 text-[10px] tracking-[0.4em] uppercase">আদায়কৃত রেভিনিউ</h3>
            <div className="p-3 bg-white/5 rounded-2xl backdrop-blur-sm border border-white/10">
              <TrendingUp size={24} className="text-emerald-400" />
            </div>
          </div>
          
          <div className="flex items-baseline gap-3 mb-10">
            <span className="text-3xl font-black text-emerald-400/50">৳</span>
            <h2 className="text-7xl font-black tracking-tighter leading-none">{revStats.collected.toLocaleString()}</h2>
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-[32px] transition-transform hover:scale-[1.02]">
              <p className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em] mb-2">পেন্ডিং</p>
              <p className="text-2xl font-black text-amber-400">৳ {revStats.pending.toLocaleString()}</p>
            </div>
            <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-[32px] transition-transform hover:scale-[1.02]">
              <p className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em] mb-2">মোট খরচ</p>
              <p className="text-2xl font-black text-rose-400">৳ {revStats.totalExp.toLocaleString()}</p>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-white/10 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em] mb-1">নিট লাভ/লস</p>
              <p className={cn(
                "text-3xl font-black tracking-tighter",
                revStats.collected - revStats.totalExp >= 0 ? "text-emerald-400" : "text-rose-400"
              )}>
                ৳ {(revStats.collected - revStats.totalExp).toLocaleString()}
              </p>
            </div>
            <div className={cn(
              "px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border shadow-lg",
              revStats.collected - revStats.totalExp >= 0 
              ? "bg-emerald-400/10 text-emerald-400 border-emerald-400/20 shadow-emerald-500/10" 
              : "bg-rose-400/10 text-rose-400 border-rose-400/20 shadow-rose-500/10"
            )}>
              {revStats.collected - revStats.totalExp >= 0 ? "Profitable" : "Loss"}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-8 rounded-[40px] card-shadow border border-slate-100 dark:border-slate-800/50">
        <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] mb-8 flex items-center">
          <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl mr-3">
            <Wallet size={16} className="text-emerald-600 dark:text-emerald-400" />
          </div>
          অ্যাডমিন ভিত্তিক হিসাব
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {["Dipu", "Shimanto"].map((admin) => {
            const net = revStats.admins[admin] - revStats.adminExps[admin];
            return (
              <div key={admin} className="bg-slate-50 dark:bg-slate-800/30 p-6 rounded-[32px] border border-slate-100 dark:border-slate-800/50 group hover:border-emerald-200 dark:hover:border-emerald-800 transition-all">
                <p className="font-black text-slate-800 dark:text-slate-200 text-base mb-5 flex items-center">
                  <div className="p-1.5 bg-white dark:bg-slate-900 rounded-lg mr-3 shadow-sm border border-slate-100 dark:border-slate-800">
                    <Icon icon={User} size={14} className="text-slate-400 dark:text-slate-600" />
                  </div>
                  {admin}
                </p>
                <div className="grid grid-cols-2 gap-3 mb-5">
                  <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 text-center shadow-sm">
                    <p className="text-[9px] text-slate-400 dark:text-slate-500 font-black uppercase mb-1 tracking-widest">রিসিভ (+)</p>
                    <p className="text-sm font-black text-emerald-600 dark:text-emerald-400">৳{revStats.admins[admin]}</p>
                  </div>
                  <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 text-center shadow-sm">
                    <p className="text-[9px] text-slate-400 dark:text-slate-500 font-black uppercase mb-1 tracking-widest">খরচ (-)</p>
                    <p className="text-sm font-black text-rose-500 dark:text-rose-400">৳{revStats.adminExps[admin]}</p>
                  </div>
                </div>
                <div className="flex justify-between items-center text-xs font-black pt-4 border-t border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400 uppercase tracking-widest text-[9px]">হাতে জমা (Net):</span>
                  <span className={cn("text-base font-black tracking-tight", net < 0 ? "text-rose-500 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400")}>৳ {net}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-8 rounded-[40px] card-shadow border border-slate-100 dark:border-slate-800/50">
        <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] mb-8 flex items-center">
          <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl mr-3">
            <Scale size={16} className="text-emerald-600 dark:text-emerald-400" />
          </div>
          ব্যালেন্স স্কেল (Hardware View)
        </h3>

        <div className="mb-8 relative">
          <div className="flex h-10 rounded-[20px] overflow-hidden bg-slate-100 dark:bg-slate-800 p-1.5 border-2 border-slate-200 dark:border-slate-700 shadow-inner">
            <div
              className="bg-emerald-500 h-full transition-all duration-1000 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.4)]"
              style={{
                width: `${
                  (Math.max(0, dNet) / (Math.max(0, dNet) + Math.max(0, sNet) || 1)) * 100
                }%`,
              }}
            ></div>
            <div
              className="bg-amber-500 h-full transition-all duration-1000 rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.4)]"
              style={{
                width: `${
                  (Math.max(0, sNet) / (Math.max(0, dNet) + Math.max(0, sNet) || 1)) * 100
                }%`,
              }}
            ></div>
          </div>
          
          <div className="grid grid-cols-2 gap-6 mt-6">
            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-[24px] border border-slate-100 dark:border-slate-800/50">
              <p className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.2em] mb-1">Dipu's Net</p>
              <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">৳{dNet.toLocaleString()}</p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-[24px] border border-slate-100 dark:border-slate-800/50 text-right">
              <p className="text-[9px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-[0.2em] mb-1">Shimanto's Net</p>
              <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">৳{sNet.toLocaleString()}</p>
            </div>
          </div>

          <div
            className={cn(
              "mt-8 p-6 rounded-[32px] text-center text-xs font-black border-2 leading-relaxed backdrop-blur-sm shadow-xl transition-all",
              isEq 
              ? "bg-emerald-50/50 dark:bg-emerald-950/10 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/20" 
              : "bg-emerald-50/30 dark:bg-emerald-950/5 text-emerald-800 dark:text-emerald-300 border-emerald-100/50 dark:border-emerald-900/10"
            )}
          >
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className={cn("w-2.5 h-2.5 rounded-full animate-pulse shadow-[0_0_10px_currentColor]", isEq ? "bg-emerald-500" : "bg-emerald-500/50")} />
              <span className="text-[10px] uppercase tracking-[0.3em] opacity-60">Status Check</span>
            </div>
            {msg}
          </div>
        </div>

        <div
          className={cn(
            "p-8 rounded-[40px] border transition-all duration-300",
            isEditingExpense ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/30 shadow-2xl shadow-emerald-500/10" : "bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800/50"
          )}
        >
          <div className="flex justify-between items-center mb-8">
            <p className="text-[10px] font-black text-slate-500 dark:text-slate-500 uppercase tracking-[0.3em] flex items-center">
              <div className="p-1.5 bg-white dark:bg-slate-900 rounded-lg mr-3 shadow-sm border border-slate-100 dark:border-slate-800">
                <Icon icon={isEditingExpense ? Edit : Receipt} size={12} className="text-emerald-500" />
              </div>
              {isEditingExpense ? "খরচ আপডেট করুন" : "খরচ এন্ট্রি"}
            </p>
            {isEditingExpense && (
              <button
                onClick={() => {
                  setIsEditingExpense(false);
                  setExpenseForm({ adminName: "", amount: "", purpose: "" });
                }}
                className="text-[10px] font-black text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-900 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 uppercase tracking-widest hover:bg-slate-50 transition-colors"
              >
                বাতিল
              </button>
            )}
          </div>
          <form onSubmit={handleAddExpense} className="space-y-4">
            <div className="flex space-x-3">
              <div className="flex-1 relative">
                <select
                  required
                  name="adminName"
                  value={expenseForm.adminName}
                  onChange={handleExpenseChange}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 text-xs font-black text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 appearance-none uppercase tracking-widest"
                >
                  <option value="" disabled>
                    অ্যাডমিন
                  </option>
                  <option value="Dipu">Dipu</option>
                  <option value="Shimanto">Shimanto</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <ChevronDown size={14} className="text-slate-400" />
                </div>
              </div>
              <input
                required
                type="number"
                name="amount"
                value={expenseForm.amount}
                onChange={handleExpenseChange}
                placeholder="টাকা"
                className="w-1/3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 text-xs font-black text-emerald-600 dark:text-emerald-400 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
            </div>
            <input
              required
              type="text"
              name="purpose"
              value={expenseForm.purpose}
              onChange={handleExpenseChange}
              placeholder="কী বাবদ খরচ? (যেমন: Boost)"
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 text-xs font-bold text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
            <button
              type="submit"
              disabled={isProcessing}
              className={cn(
                "w-full text-white font-black py-5 rounded-2xl text-xs uppercase tracking-[0.2em] active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-2xl",
                isEditingExpense ? "bg-emerald-600 shadow-emerald-500/20" : "bg-slate-900 dark:bg-emerald-600 shadow-slate-900/20 dark:shadow-emerald-500/20"
              )}
            >
              {isProcessing && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {isEditingExpense ? "আপডেট করুন" : "সেভ করুন"}
            </button>
          </form>
        </div>

        <div className="space-y-4 mt-10">
          <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] pl-2 mb-4">সাম্প্রতিক খরচসমূহ</p>
          {displayedExpenses.map((exp) => (
            <div key={exp.id} className="bg-white dark:bg-slate-900 p-6 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col group hover:border-emerald-200 dark:hover:border-emerald-800 transition-all">
              <div className="flex justify-between items-center text-xs mb-5">
                <div className="flex items-center flex-1 pr-4">
                  <div
                    className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center mr-4 shrink-0 shadow-sm border transition-colors",
                      exp.adminName === "Dipu" ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/20" : "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/20"
                    )}
                  >
                    <Icon icon={User} size={18} />
                  </div>
                  <div>
                    <p className="font-black text-slate-800 dark:text-slate-200 text-sm group-hover:text-emerald-600 transition-colors">{exp.purpose}</p>
                    <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase mt-1 tracking-widest">
                      {exp.adminName} • {new Date(exp.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <span className="font-black text-rose-500 dark:text-rose-400 text-lg tracking-tighter">- ৳{exp.amount}</span>
              </div>
              <div className="flex justify-between items-center pt-5 border-t border-slate-50 dark:border-slate-800/50">
                <button
                  onClick={() => onHistoryClick({ title: "খরচের হিস্টোরি", history: exp.history || [] })}
                  className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 flex items-center uppercase tracking-widest bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1.5 rounded-lg hover:bg-emerald-100 transition-colors"
                >
                  <Icon icon={History} size={10} className="mr-1.5" /> লগ
                </button>
                <div className="flex space-x-2">
                  <button
                    onClick={() => onEditExpense(exp)}
                    className="p-2.5 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-xl active:scale-90 transition-all hover:bg-emerald-50 hover:text-emerald-600 border border-slate-100 dark:border-slate-800"
                  >
                    <Icon icon={Edit} size={16} />
                  </button>
                  <button
                    onClick={() => setConfirmDeleteId(exp.id)}
                    className="p-2.5 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-xl active:scale-90 transition-all hover:bg-rose-50 hover:text-rose-500 border border-slate-100 dark:border-slate-800"
                  >
                    <Icon icon={Trash2} size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {expenses.length > 4 && (
            <button
              onClick={() => setShowAllExpenses(!showAllExpenses)}
              className="w-full py-4 mt-4 flex items-center justify-center text-[10px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 rounded-2xl transition-all uppercase tracking-[0.2em]"
            >
              {showAllExpenses ? (
                <>
                  <Icon icon={ChevronUp} size={14} className="mr-2" /> কম দেখুন
                </>
              ) : (
                <>
                  <Icon icon={ChevronDown} size={14} className="mr-2" /> আরও দেখুন ({expenses.length - 4})
                </>
              )}
            </button>
          )}
        </div>
      </div>

      <ConfirmDialog
        isOpen={!!confirmDeleteId}
        title="খরচ ডিলিট"
        message="আপনি কি নিশ্চিতভাবে এই খরচটি ডিলিট করতে চান? এই কাজটি আর ফিরিয়ে আনা যাবে না।"
        onConfirm={() => {
          if (confirmDeleteId) {
            onDeleteExpense(confirmDeleteId);
            setConfirmDeleteId(null);
          }
        }}
        onCancel={() => setConfirmDeleteId(null)}
        isDanger={true}
      />
    </div>
  );
};
