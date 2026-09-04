import React, { useState } from "react";
import { Icon } from "../ui/Icon";
import {
  TrendingUp,
  Wallet,
  User,
  Receipt,
  Edit,
  History,
  Trash2,
  ChevronDown,
  ChevronUp,
  Download,
  RotateCcw,
} from "lucide-react";
import { Expense, HistoryEntry } from "../../types";
import { cn } from "../../lib/utils";
import { ConfirmDialog } from "../modals/ConfirmDialog";
import { useStore } from "../../store/useStore";
import { useRevenue } from "../../hooks/useRevenue";

interface RevenueProps {
  onHistoryClick?: (data: { title: string; history: HistoryEntry[] }) => void;
}

export const Revenue = ({
  onHistoryClick,
}: RevenueProps) => {
  const {
    revYear,
    setRevYear,
    revMonth,
    setRevMonth,
    deals,
    expenses,
    expenseForm,
    setExpenseForm,
    isEditingExpense,
    setIsEditingExpense,
    setEditExpenseId,
    isProcessing,
  } = useStore();

  const {
    revStats,
    handleExpenseChange,
    handleAddExpense,
    handleEditExpenseClick,
    deleteExpense,
    exportToCSV,
  } = useRevenue();

  // Ensure both Dipu and Shimanto are always available in the list
  const adminList = React.useMemo(() => {
    const defaultAdmins = ["Dipu", "Shimanto"];
    const dynamicAdmins = revStats.sortedAdmins;
    const combined = Array.from(new Set([...defaultAdmins, ...dynamicAdmins]));
    return combined.sort();
  }, [revStats.sortedAdmins]);

  const [showAllExpenses, setShowAllExpenses] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const admin1 = adminList.includes("Dipu") ? "Dipu" : adminList[0];
  const admin2 = adminList.includes("Shimanto") ? "Shimanto" : adminList[1];

  const dNet = admin1 ? (revStats.admins[admin1] || 0) - (revStats.adminExps[admin1] || 0) : 0;
  const sNet = admin2 ? (revStats.admins[admin2] || 0) - (revStats.adminExps[admin2] || 0) : 0;
  
  const totalNet = Math.max(0, dNet) + Math.max(0, sNet);
  const dWidth = totalNet > 0 ? (Math.max(0, dNet) / totalNet) * 100 : 50;
  const sWidth = totalNet > 0 ? (Math.max(0, sNet) / totalNet) * 100 : 50;

  const diff = Math.abs(dNet - sNet) / 2;
  const isEq = dNet === sNet;

  let msg = "হিসাব সম্পূর্ণ সমান!";
  if (admin1 && admin2) {
    if (dNet > sNet) {
      msg = `হিসাব সমান করতে ${admin1}-এর ${admin2}-কে ৳${diff} দিতে হবে (বা খরচ করতে হবে)।`;
    } else if (sNet > dNet) {
      msg = `হিসাব সমান করতে ${admin2}-এর ${admin1}-কে ৳${diff} দিতে হবে (বা খরচ করতে হবে)।`;
    }
  } else {
    msg = "হিসাব সমান করার জন্য অন্তত দুইজন অ্যাডমিন প্রয়োজন।";
  }

  const displayedExpenses = showAllExpenses ? expenses : expenses.slice(0, 4);

  return (
    <div className="space-y-12 pb-12 pt-6 px-4 md:px-8 lg:px-12 max-w-6xl mx-auto fade-in transition-colors">
      <div className="bg-white dark:bg-slate-900 p-12 md:p-16 rounded-[56px] border border-slate-100 dark:border-slate-800 shadow-sm mb-12 overflow-hidden relative group">
        <div className="absolute -right-24 -top-24 text-[25vw] font-black text-slate-50 dark:text-slate-800/10 select-none pointer-events-none tracking-tighter leading-none uppercase italic transform -rotate-12 group-hover:scale-110 transition-transform duration-1000">
          ACC
        </div>
        
        <div className="relative z-10 flex flex-col gap-6">
          <div className="flex items-center justify-between flex-wrap gap-8">
            <h2 className="text-5xl md:text-6xl font-black text-slate-950 dark:text-white tracking-tight uppercase leading-tight transform -skew-x-3">
              REVENUE <br />
              <span className="text-emerald-600 dark:text-emerald-400 italic lowercase tracking-normal text-3xl md:text-4xl">& EXPENSE</span>
            </h2>
            <div className="flex flex-col items-end gap-6">
              <div className="flex space-x-4 bg-slate-100 dark:bg-slate-800/50 p-3 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-inner">
                <select
                  value={revYear}
                  onChange={(e) => setRevYear(e.target.value)}
                  className="bg-transparent border-none text-[13px] font-black text-slate-700 dark:text-slate-300 outline-none cursor-pointer px-6 uppercase tracking-widest"
                >
                  <option value="All">সব বছর</option>
                  {Array.from(new Set([
                    ...deals.map(d => new Date(d.confirmDate || d.selectionDate || d.createdAt).getFullYear().toString()).filter(y => y && y !== "NaN"),
                    ...expenses.map(e => new Date(e.createdAt).getFullYear().toString()).filter(y => y && y !== "NaN"),
                    ...Array.from({ length: 2030 - 2024 + 1 }, (_, i) => (2030 - i).toString())
                  ])).sort((a, b) => b.localeCompare(a)).map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
                <div className="w-px h-8 bg-slate-300 dark:bg-slate-700 self-center" />
                <select
                  value={revMonth}
                  onChange={(e) => setRevMonth(e.target.value)}
                  className="bg-transparent border-none text-[13px] font-black text-slate-700 dark:text-slate-300 outline-none cursor-pointer px-6 uppercase tracking-widest"
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
              <div className="text-[12px] font-black text-slate-400 uppercase tracking-[0.5em] vertical-rl transform rotate-180 opacity-40">
                FINANCIAL OVERVIEW {revYear !== "All" ? revYear : new Date().getFullYear()}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-950 dark:bg-slate-900 p-12 md:p-16 rounded-[64px] text-white shadow-2xl relative overflow-hidden border border-white/5">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/20 rounded-full -mr-48 -mt-48 blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/10 rounded-full -ml-40 -mb-40 blur-[100px]"></div>
        
        <div className="relative z-10">
          <div className="flex justify-between items-center mb-8">
            <h3 className="font-bold text-emerald-400 text-[11px] tracking-[0.4em] uppercase">আদায়কৃত রেভিনিউ</h3>
            <div className="p-4 bg-white/5 rounded-2xl backdrop-blur-md border border-white/10">
              <TrendingUp size={24} className="text-emerald-400" />
            </div>
          </div>
          
          <div className="flex items-baseline gap-4 mb-12">
            <span className="text-4xl font-bold text-emerald-400/50">৳</span>
            <h2 className="text-7xl md:text-8xl font-black tracking-tighter leading-none">{revStats.collected.toLocaleString()}</h2>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-3xl transition-all hover:bg-white/10">
              <p className="text-[9px] font-bold text-white/40 uppercase tracking-[0.2em] mb-2">পেন্ডিং</p>
              <p className="text-2xl font-black text-amber-400">৳ {revStats.pending.toLocaleString()}</p>
            </div>
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-3xl transition-all hover:bg-white/10">
              <p className="text-[9px] font-bold text-white/40 uppercase tracking-[0.2em] mb-2">মোট খরচ</p>
              <p className="text-2xl font-black text-rose-400">৳ {revStats.totalExp.toLocaleString()}</p>
            </div>
          </div>

          <div className="mt-10 pt-10 border-t border-white/10 flex items-center justify-between">
            <div className="space-y-2">
              <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] mb-1">নিট লাভ/লস</p>
              <p className={cn(
                "text-4xl font-black tracking-tighter",
                revStats.collected - revStats.totalExp >= 0 ? "text-emerald-400" : "text-rose-400"
              )}>
                ৳ {(revStats.collected - revStats.totalExp).toLocaleString()}
              </p>
            </div>
            <div className={cn(
              "px-8 py-4 rounded-[24px] text-[11px] font-black uppercase tracking-[0.3em] border shadow-2xl",
              revStats.collected - revStats.totalExp >= 0 
              ? "bg-emerald-400/10 text-emerald-400 border-emerald-400/20 shadow-emerald-500/10" 
              : "bg-rose-400/10 text-rose-400 border-rose-400/20 shadow-rose-500/10"
            )}>
              {revStats.collected - revStats.totalExp >= 0 ? "Profitable" : "Loss"}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-8 md:p-12 rounded-[48px] card-shadow border border-slate-100 dark:border-slate-800/50 transition-all">
        <div className="flex justify-between items-center mb-12">
          <div className="text-[12px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.3em] flex items-center">
            <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl mr-6 shadow-sm border border-emerald-100 dark:border-emerald-900/20">
              <Wallet size={24} className="text-emerald-600 dark:text-emerald-400" />
            </div>
            অ্যাডমিন ভিত্তিক হিসাব
          </div>
          <div className="flex gap-4">
            <button
              onClick={exportToCSV}
              className="w-12 h-12 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-2xl hover:bg-slate-950 dark:hover:bg-white hover:text-white dark:hover:text-slate-950 transition-all shadow-sm active:scale-95 flex items-center justify-center"
              title="Export CSV"
            >
              <Download size={20} />
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          {adminList.map((admin) => {
            const net = (revStats.admins[admin] || 0) - (revStats.adminExps[admin] || 0);
            return (
              <div key={admin} className="bg-slate-50/50 dark:bg-slate-800/30 p-8 rounded-[40px] border border-slate-100 dark:border-slate-800/50 group hover:border-emerald-200 dark:hover:border-emerald-800 transition-all hover:shadow-xl">
                <div className="font-bold text-slate-950 dark:text-white text-xl mb-8 flex items-center">
                  <div className="w-12 h-12 bg-white dark:bg-slate-900 rounded-2xl mr-4 shadow-sm border border-slate-100 dark:border-slate-800 group-hover:scale-110 transition-transform flex items-center justify-center">
                    <Icon icon={User} size={20} className="text-slate-400 dark:text-slate-600" />
                  </div>
                  {admin}
                </div>
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 text-center shadow-sm">
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase mb-2 tracking-widest">রিসিভ (+)</p>
                    <p className="text-lg font-black text-emerald-600 dark:text-emerald-400">৳{revStats.admins[admin]}</p>
                  </div>
                  <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 text-center shadow-sm">
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase mb-2 tracking-widest">খরচ (-)</p>
                    <p className="text-lg font-black text-rose-500 dark:text-rose-400">৳{revStats.adminExps[admin]}</p>
                  </div>
                </div>
                <div className="flex justify-between items-center pt-6 border-t border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] text-[10px] font-bold">হাতে জমা (Net):</span>
                  <span className={cn("text-2xl font-black tracking-tighter", net < 0 ? "text-rose-500 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400")}>৳ {net}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-10 md:p-12 rounded-[56px] card-shadow border border-slate-100 dark:border-slate-800/50 relative overflow-hidden group">
        <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none group-hover:bg-emerald-500/10 transition-all duration-1000"></div>
        
        <div className="flex justify-between items-center mb-10">
          <div className="text-[11px] font-mono font-bold text-emerald-500/60 uppercase tracking-[0.6em] flex items-center">
            <div className="w-2 h-2 bg-emerald-500 rounded-full mr-4 animate-pulse shadow-[0_0_10px_#10b981]"></div>
            BALANCE_SCALE_V4.0
          </div>
          <div className="flex gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/40"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/20"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/10"></div>
          </div>
        </div>

        <div className="space-y-12 mb-10">
          <div className="relative pt-6">
            <div className="flex justify-between text-[11px] font-black uppercase tracking-widest mb-6">
              <span className="text-emerald-600 dark:text-emerald-400">{admin1 || "Admin 1"} ({Math.round(dWidth)}%)</span>
              <span className="text-amber-600 dark:text-amber-400">{admin2 || "Admin 2"} ({Math.round(sWidth)}%)</span>
            </div>
            <div className="h-6 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex shadow-inner">
              <div 
                style={{ width: `${dWidth}%` }} 
                className="h-full bg-emerald-500 transition-all duration-1000 ease-out relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/10"></div>
              </div>
              <div 
                style={{ width: `${sWidth}%` }} 
                className="h-full bg-amber-500 transition-all duration-1000 ease-out relative"
              >
                <div className="absolute inset-0 bg-gradient-to-l from-transparent to-white/10"></div>
              </div>
            </div>
            <div className="absolute left-1/2 top-0 -translate-x-1/2 h-full w-px bg-white/20 dark:bg-slate-900/20 z-10"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
            <div className="p-8 bg-slate-50/50 dark:bg-white/5 rounded-[40px] border border-slate-100 dark:border-white/10 relative group-hover:border-emerald-500/30 transition-all duration-500">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[9px] font-mono text-slate-400 dark:text-white/20 uppercase tracking-widest">Admin_01 / {admin1 || "Admin 1"}</span>
                <div className="w-3 h-3 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                </div>
              </div>
              <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-500 uppercase tracking-[0.3em] mb-2">Current_Net</p>
              <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tighter truncate">
                <span className="text-emerald-500/30 mr-2 text-xl font-light">৳</span>
                {dNet.toLocaleString()}
              </p>
            </div>
            
            <div className="p-8 bg-slate-50/50 dark:bg-white/5 rounded-[40px] border border-slate-100 dark:border-white/10 relative group-hover:border-amber-500/30 transition-all duration-500">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[9px] font-mono text-slate-400 dark:text-white/20 uppercase tracking-widest">Admin_02 / {admin2 || "Admin 2"}</span>
                <div className="w-3 h-3 rounded-full bg-amber-500/20 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                </div>
              </div>
              <p className="text-[10px] font-bold text-amber-600 dark:text-amber-500 uppercase tracking-[0.3em] mb-2">Current_Net</p>
              <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tighter truncate">
                <span className="text-amber-500/30 mr-2 text-xl font-light">৳</span>
                {sNet.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div
          className={cn(
            "p-6 rounded-3xl text-center font-medium text-xs border border-dashed transition-all duration-700",
            isEq 
            ? "bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" 
            : "bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-white/80 border-slate-100 dark:border-white/10"
          )}
        >
          <div className="flex items-center justify-center gap-4 mb-3">
            <div className={cn("w-1.5 h-1.5 rounded-full", isEq ? "bg-emerald-500 animate-ping" : "bg-slate-300 dark:bg-white/20")} />
            <span className="text-[9px] uppercase tracking-[0.4em] text-slate-400 dark:text-white/30 font-bold">System_Status</span>
            <div className={cn("w-1.5 h-1.5 rounded-full", isEq ? "bg-emerald-500 animate-ping" : "bg-slate-300 dark:bg-white/20")} />
          </div>
          <p className="text-sm leading-relaxed tracking-tight font-bold">
            {msg}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div
          className={cn(
            "p-8 md:p-10 rounded-[48px] border transition-all duration-700 shadow-sm",
            isEditingExpense ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/30 shadow-2xl shadow-emerald-500/10" : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800/50"
          )}
        >
          <div className="flex justify-between items-center mb-12">
            <div className="text-[12px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.3em] flex items-center">
              <div className="p-4 bg-white dark:bg-slate-950 rounded-2xl mr-6 shadow-sm border border-slate-100 dark:border-slate-800 transition-all group-hover:scale-110">
                <Icon icon={isEditingExpense ? Edit : Receipt} size={24} className="text-emerald-500" />
              </div>
              {isEditingExpense ? "খরচ আপডেট করুন" : "খরচ এন্ট্রি"}
            </div>
            {isEditingExpense && (
              <button
                onClick={() => {
                  setIsEditingExpense(false);
                  setEditExpenseId(null);
                  setExpenseForm({ adminName: "", amount: "", purpose: "" });
                }}
                className="text-[11px] font-bold text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-900 px-6 py-3 rounded-xl border border-slate-200 dark:border-slate-800 uppercase tracking-widest hover:bg-slate-50 transition-colors shadow-sm active:scale-95"
              >
                বাতিল
              </button>
            )}
          </div>
          <form onSubmit={handleAddExpense} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative group">
                <select
                  required
                  name="adminName"
                  value={expenseForm.adminName}
                  onChange={handleExpenseChange}
                  className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 text-sm font-bold text-slate-700 dark:text-slate-300 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 appearance-none uppercase tracking-widest shadow-sm transition-all"
                >
                  <option value="" disabled>অ্যাডমিন সিলেক্ট করুন</option>
                  {adminList.map(name => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
                <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <ChevronDown size={20} />
                </div>
              </div>
              <div className="relative group">
                <input
                  required
                  type="number"
                  name="amount"
                  value={expenseForm.amount}
                  onChange={handleExpenseChange}
                  placeholder="টাকার পরিমাণ"
                  className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 text-sm font-black text-emerald-600 dark:text-emerald-400 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all shadow-sm placeholder:text-slate-400"
                />
                <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-300 dark:text-slate-700 font-black text-lg">৳</div>
              </div>
            </div>
            <div className="relative group">
              <input
                required
                type="text"
                name="purpose"
                value={expenseForm.purpose}
                onChange={handleExpenseChange}
                placeholder="কী বাবদ খরচ? (যেমন: Facebook Boost)"
                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 text-sm font-bold text-slate-700 dark:text-slate-300 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all shadow-sm placeholder:text-slate-400"
              />
            </div>
            <button
              type="submit"
              disabled={isProcessing}
              className={cn(
                "w-full text-white font-black py-6 rounded-[28px] text-sm uppercase tracking-[0.3em] active:scale-[0.98] transition-all flex items-center justify-center gap-4 shadow-xl",
                isEditingExpense ? "bg-emerald-600 shadow-emerald-500/30" : "bg-slate-950 dark:bg-emerald-600 shadow-slate-950/30 dark:shadow-emerald-500/30"
              )}
            >
              {isProcessing && <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {isEditingExpense ? "আপডেট করুন" : "সেভ করুন"}
            </button>
          </form>
        </div>

        <div className="p-6 md:p-8 rounded-[40px] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/50 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-2 mb-6">
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">সাম্প্রতিক খরচসমূহ</p>
            <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800 mx-6"></div>
          </div>
          
          <div className="grid grid-cols-1 gap-3">
            {displayedExpenses.map((exp) => (
              <div key={exp.id} className="bg-slate-50/50 dark:bg-slate-800/30 p-4 rounded-[24px] border border-slate-100 dark:border-slate-800/50 flex flex-col group hover:border-emerald-200 dark:hover:border-emerald-800 transition-all hover:shadow-md">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center flex-1 pr-3">
                    <div
                      className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center mr-3 shrink-0 shadow-sm border transition-all group-hover:scale-110",
                        exp.adminName === admin1 ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/20" : "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/20"
                      )}
                    >
                      <Icon icon={User} size={16} />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 dark:text-white text-sm truncate group-hover:text-emerald-600 transition-colors tracking-tight">{exp.purpose}</p>
                      <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase mt-0.5 tracking-wider flex items-center gap-1.5">
                        {exp.adminName} • {new Date(exp.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-rose-500 dark:text-rose-400 text-lg tracking-tighter">- ৳{exp.amount}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-slate-200/50 dark:border-slate-800/50">
                  <button
                    onClick={() => onHistoryClick?.({ title: "খরচের হিস্টোরি", history: exp.history || [] })}
                    className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center uppercase tracking-widest bg-white dark:bg-slate-900 px-4 py-2 rounded-lg hover:bg-emerald-600 hover:text-white transition-all shadow-sm active:scale-95 border border-slate-100 dark:border-slate-800"
                  >
                    <Icon icon={History} size={12} className="mr-1.5" /> লগ দেখুন
                  </button>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditExpenseClick(exp)}
                      className="w-8 h-8 bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-600 rounded-lg active:scale-90 transition-all hover:bg-emerald-50 hover:text-emerald-600 border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-center"
                    >
                      <Icon icon={Edit} size={14} />
                    </button>
                    <button
                      onClick={() => setConfirmDeleteId(exp.id)}
                      className="w-8 h-8 bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-600 rounded-lg active:scale-90 transition-all hover:bg-rose-50 hover:text-rose-500 border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-center"
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
                className="w-full py-4 mt-2 flex items-center justify-center text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-600 hover:text-white rounded-2xl transition-all uppercase tracking-[0.2em] shadow-sm border border-emerald-100 dark:border-emerald-900/20"
              >
                {showAllExpenses ? (
                  <>
                    <Icon icon={ChevronUp} size={16} className="mr-2" /> কম দেখুন
                  </>
                ) : (
                  <>
                    <Icon icon={ChevronDown} size={16} className="mr-2" /> আরও দেখুন ({expenses.length - 4})
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={!!confirmDeleteId}
        title="খরচ ডিলিট"
        message="আপনি কি নিশ্চিতভাবে এই খরচটি ডিলিট করতে চান? এই কাজটি আর ফিরিয়ে আনা যাবে না।"
        onConfirm={() => {
          if (confirmDeleteId) {
            deleteExpense(confirmDeleteId);
            setConfirmDeleteId(null);
          }
        }}
        onCancel={() => setConfirmDeleteId(null)}
        isDanger={true}
      />
    </div>
  );
};
