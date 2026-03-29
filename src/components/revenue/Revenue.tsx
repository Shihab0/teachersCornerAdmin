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
          <h2 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter uppercase leading-none">
            রেভিনিউ <span className="text-indigo-600 dark:text-indigo-400 italic font-serif lowercase tracking-normal">& খরচ</span>
          </h2>
          <div className="flex space-x-2 bg-gray-100 dark:bg-slate-800 p-1.5 rounded-xl border border-gray-200 dark:border-slate-700">
            <select
              value={revYear}
              onChange={(e) => setRevYear(e.target.value)}
              className="bg-transparent border-none text-[10px] font-black text-gray-600 dark:text-slate-400 outline-none cursor-pointer px-2"
            >
              <option value="All">সব বছর</option>
              <option value="2025">২০২৫</option>
              <option value="2026">২০২৬</option>
            </select>
            <div className="w-px h-4 bg-gray-300 dark:bg-slate-700 self-center" />
            <select
              value={revMonth}
              onChange={(e) => setRevMonth(e.target.value)}
              className="bg-transparent border-none text-[10px] font-black text-gray-600 dark:text-slate-400 outline-none cursor-pointer px-2"
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
        <div className="h-px bg-gray-200 dark:bg-slate-800 w-full mt-2" />
      </div>

      <div className="bg-gray-900 dark:bg-slate-900 p-8 rounded-[40px] text-white shadow-2xl relative overflow-hidden border border-white/5">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full -mr-32 -mt-32 blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/10 rounded-full -ml-24 -mb-24 blur-3xl"></div>
        
        <div className="relative z-10">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-black text-indigo-400 text-[10px] tracking-[0.3em] uppercase">আদায়কৃত রেভিনিউ</h3>
            <div className="p-2 bg-white/5 rounded-xl backdrop-blur-sm">
              <TrendingUp size={20} className="text-indigo-400" />
            </div>
          </div>
          
          <div className="flex items-baseline gap-2 mb-8">
            <span className="text-2xl font-black text-indigo-400/50">৳</span>
            <h2 className="text-6xl font-black tracking-tighter leading-none">{revStats.collected.toLocaleString()}</h2>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-3xl">
              <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-1">পেন্ডিং</p>
              <p className="text-xl font-black text-orange-400">৳ {revStats.pending.toLocaleString()}</p>
            </div>
            <div className="bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-3xl">
              <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-1">মোট খরচ</p>
              <p className="text-xl font-black text-rose-400">৳ {revStats.totalExp.toLocaleString()}</p>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-white/10 flex items-center justify-between">
            <div>
              <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-1">নিট লাভ/লস</p>
              <p className={cn(
                "text-2xl font-black tracking-tight",
                revStats.collected - revStats.totalExp >= 0 ? "text-emerald-400" : "text-rose-400"
              )}>
                ৳ {(revStats.collected - revStats.totalExp).toLocaleString()}
              </p>
            </div>
            <div className={cn(
              "px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border",
              revStats.collected - revStats.totalExp >= 0 
              ? "bg-emerald-400/10 text-emerald-400 border-emerald-400/20" 
              : "bg-rose-400/10 text-rose-400 border-rose-400/20"
            )}>
              {revStats.collected - revStats.totalExp >= 0 ? "Profitable" : "Loss"}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-5 rounded-[32px] shadow-sm border border-gray-100 dark:border-slate-800">
        <h3 className="text-xs font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-4 flex items-center">
          <Icon icon={Wallet} size={14} className="mr-2 text-indigo-500" /> অ্যাডমিন ভিত্তিক হিসাব
        </h3>
        <div className="space-y-3">
          {["Dipu", "Shimanto"].map((admin) => {
            const net = revStats.admins[admin] - revStats.adminExps[admin];
            return (
              <div key={admin} className="bg-gray-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-gray-100 dark:border-slate-800">
                <p className="font-black text-gray-800 dark:text-slate-200 text-sm mb-3 flex items-center">
                  <Icon icon={User} size={14} className="mr-1.5 text-gray-400 dark:text-slate-600" />
                  {admin}
                </p>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="bg-white dark:bg-slate-900 p-2 rounded-xl border border-gray-100 dark:border-slate-800 text-center">
                    <p className="text-[9px] text-gray-400 dark:text-slate-500 font-bold uppercase mb-0.5">রিসিভ (+)</p>
                    <p className="text-xs font-black text-emerald-600 dark:text-emerald-400">৳{revStats.admins[admin]}</p>
                  </div>
                  <div className="bg-white dark:bg-slate-900 p-2 rounded-xl border border-gray-100 dark:border-slate-800 text-center">
                    <p className="text-[9px] text-gray-400 dark:text-slate-500 font-bold uppercase mb-0.5">খরচ (-)</p>
                    <p className="text-xs font-black text-red-500 dark:text-red-400">৳{revStats.adminExps[admin]}</p>
                  </div>
                </div>
                <div className="flex justify-between items-center text-xs font-bold pt-3 border-t border-gray-200 dark:border-slate-800">
                  <span className="text-gray-500 dark:text-slate-400">হাতে জমা আছে (Net):</span>
                  <span className={cn("text-sm font-black", net < 0 ? "text-red-500 dark:text-red-400" : "text-indigo-600 dark:text-indigo-400")}>৳ {net}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-6 rounded-[40px] shadow-sm border border-gray-100 dark:border-slate-800">
        <h3 className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-6 flex items-center">
          <Icon icon={Scale} size={14} className="mr-2 text-indigo-500" /> ব্যালেন্স স্কেল (Hardware View)
        </h3>

        <div className="mb-8 relative">
          <div className="flex h-8 rounded-2xl overflow-hidden bg-gray-100 dark:bg-slate-800 p-1 border-2 border-gray-200 dark:border-slate-700 shadow-inner">
            <div
              className="bg-cyan-500 h-full transition-all duration-700 rounded-xl shadow-[0_0_15px_rgba(6,182,212,0.5)]"
              style={{
                width: `${
                  (Math.max(0, dNet) / (Math.max(0, dNet) + Math.max(0, sNet) || 1)) * 100
                }%`,
              }}
            ></div>
            <div
              className="bg-amber-500 h-full transition-all duration-700 rounded-xl shadow-[0_0_15px_rgba(245,158,11,0.5)]"
              style={{
                width: `${
                  (Math.max(0, sNet) / (Math.max(0, dNet) + Math.max(0, sNet) || 1)) * 100
                }%`,
              }}
            ></div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="bg-gray-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-gray-100 dark:border-slate-800">
              <p className="text-[9px] font-black text-cyan-600 dark:text-cyan-400 uppercase tracking-widest mb-1">Dipu's Net</p>
              <p className="text-lg font-black text-gray-900 dark:text-white">৳{dNet.toLocaleString()}</p>
            </div>
            <div className="bg-gray-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-gray-100 dark:border-slate-800 text-right">
              <p className="text-[9px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest mb-1">Shimanto's Net</p>
              <p className="text-lg font-black text-gray-900 dark:text-white">৳{sNet.toLocaleString()}</p>
            </div>
          </div>

          <div
            className={cn(
              "mt-6 p-5 rounded-3xl text-center text-xs font-bold border-2 leading-relaxed backdrop-blur-sm",
              isEq 
              ? "bg-emerald-50/50 dark:bg-emerald-950/10 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/20" 
              : "bg-indigo-50/50 dark:bg-indigo-950/10 text-indigo-800 dark:text-indigo-300 border-indigo-100 dark:border-indigo-900/20"
            )}
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className={cn("w-2 h-2 rounded-full animate-pulse", isEq ? "bg-emerald-500" : "bg-indigo-500")} />
              <span className="text-[10px] uppercase tracking-widest opacity-60">Status Check</span>
            </div>
            {msg}
          </div>
        </div>

        <div
          className={cn(
            "p-4 rounded-2xl border transition-colors",
            isEditingExpense ? "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/30" : "bg-gray-50 dark:bg-slate-800/50 border-gray-100 dark:border-slate-800"
          )}
        >
          <div className="flex justify-between items-center mb-4">
            <p className="text-[10px] font-black text-gray-500 dark:text-slate-500 uppercase tracking-widest flex items-center">
              <Icon icon={isEditingExpense ? Edit : Receipt} size={12} className="mr-1.5" />{" "}
              {isEditingExpense ? "খরচ আপডেট করুন" : "খরচ এন্ট্রি"}
            </p>
            {isEditingExpense && (
              <button
                onClick={() => {
                  setIsEditingExpense(false);
                  setExpenseForm({ adminName: "", amount: "", purpose: "" });
                }}
                className="text-[10px] font-bold text-gray-400 dark:text-slate-500 bg-white dark:bg-slate-900 px-2 py-1 rounded-lg border border-gray-200 dark:border-slate-800"
              >
                বাতিল
              </button>
            )}
          </div>
          <form onSubmit={handleAddExpense} className="space-y-3">
            <div className="flex space-x-2">
              <select
                required
                name="adminName"
                value={expenseForm.adminName}
                onChange={handleExpenseChange}
                className="flex-1 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-3 text-xs font-bold text-gray-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="" disabled>
                  অ্যাডমিন
                </option>
                <option value="Dipu">Dipu</option>
                <option value="Shimanto">Shimanto</option>
              </select>
              <input
                required
                type="number"
                name="amount"
                value={expenseForm.amount}
                onChange={handleExpenseChange}
                placeholder="টাকা"
                className="w-1/3 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-3 text-xs font-black text-indigo-700 dark:text-indigo-400 outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <input
              required
              type="text"
              name="purpose"
              value={expenseForm.purpose}
              onChange={handleExpenseChange}
              placeholder="কী বাবদ খরচ? (যেমন: Boost)"
              className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-3 text-xs font-medium text-gray-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="submit"
              disabled={isProcessing}
              className={cn(
                "w-full text-white font-black py-3.5 rounded-xl text-xs uppercase tracking-widest active:scale-95 transition-transform flex items-center justify-center gap-2 disabled:opacity-50",
                isEditingExpense ? "bg-blue-600 shadow-lg shadow-blue-200 dark:shadow-none" : "bg-gray-800 dark:bg-slate-700 shadow-lg shadow-gray-200 dark:shadow-none"
              )}
            >
              {isProcessing && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {isEditingExpense ? "আপডেট করুন" : "সেভ করুন"}
            </button>
          </form>
        </div>

        <div className="space-y-3 mt-6">
          <p className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest pl-1 mb-2">সাম্প্রতিক খরচসমূহ</p>
          {displayedExpenses.map((exp) => (
            <div key={exp.id} className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col">
              <div className="flex justify-between items-center text-xs mb-3">
                <div className="flex items-center flex-1 pr-2">
                  <div
                    className={cn(
                      "w-8 h-8 rounded-xl flex items-center justify-center mr-3 shrink-0",
                      exp.adminName === "Dipu" ? "bg-cyan-50 dark:bg-cyan-950/30 text-cyan-600 dark:text-cyan-400" : "bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400"
                    )}
                  >
                    <Icon icon={User} size={14} />
                  </div>
                  <div>
                    <p className="font-bold text-gray-800 dark:text-slate-200">{exp.purpose}</p>
                    <p className="text-[9px] font-bold text-gray-400 dark:text-slate-500 uppercase mt-0.5">
                      {exp.adminName} • {new Date(exp.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <span className="font-black text-red-500 dark:text-red-400 text-sm">- ৳{exp.amount}</span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-gray-50 dark:border-slate-800">
                <button
                  onClick={() => onHistoryClick({ title: "খরচের হিস্টোরি", history: exp.history || [] })}
                  className="text-[9px] font-bold text-indigo-500 dark:text-indigo-400 flex items-center"
                >
                  <Icon icon={History} size={10} className="mr-1" /> লগ
                </button>
                <div className="flex space-x-1.5">
                  <button
                    onClick={() => onEditExpense(exp)}
                    className="p-2 bg-blue-50 dark:bg-blue-950/30 text-blue-500 dark:text-blue-400 rounded-lg active:scale-90 transition-transform"
                  >
                    <Icon icon={Edit} size={14} />
                  </button>
                  <button
                    onClick={() => setConfirmDeleteId(exp.id)}
                    className="p-2 bg-red-50 dark:bg-red-950/30 text-red-400 dark:text-red-400 rounded-lg active:scale-90 transition-transform"
                  >
                    <Icon icon={Trash2} size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {expenses.length > 4 && (
            <button
              onClick={() => setShowAllExpenses(!showAllExpenses)}
              className="w-full py-3 mt-2 flex items-center justify-center text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 rounded-xl transition-colors"
            >
              {showAllExpenses ? (
                <>
                  <Icon icon={ChevronUp} size={14} className="mr-1" /> কম দেখুন
                </>
              ) : (
                <>
                  <Icon icon={ChevronDown} size={14} className="mr-1" /> আরও দেখুন ({expenses.length - 4})
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
