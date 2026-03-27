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
} from "lucide-react";
import { Expense, HistoryEntry } from "../../types";
import { cn } from "../../lib/utils";

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
}: RevenueProps) => {
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

  return (
    <div className="space-y-6 fade-in">
      <div className="flex space-x-2 bg-white p-2.5 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-center w-10 bg-gray-50 rounded-xl text-gray-400">
          <Icon icon={Calendar} size={16} />
        </div>
        <select
          value={revYear}
          onChange={(e) => setRevYear(e.target.value)}
          className="flex-1 bg-gray-50 border-none rounded-xl p-2.5 text-xs font-bold text-gray-700 outline-none"
        >
          <option value="All">সব বছর</option>
          <option value="2025">২০২৫</option>
          <option value="2026">২০২৬</option>
          <option value="2027">২০২৭</option>
        </select>
        <select
          value={revMonth}
          onChange={(e) => setRevMonth(e.target.value)}
          className="flex-1 bg-gray-50 border-none rounded-xl p-2.5 text-xs font-bold text-gray-700 outline-none"
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

      <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 p-6 rounded-[32px] text-white shadow-xl shadow-indigo-200 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-bold text-indigo-200 text-xs tracking-wider uppercase">টোটাল রেভিনিউ (আদায়কৃত)</h3>
          <Icon icon={TrendingUp} size={18} className="text-indigo-300" />
        </div>
        <h2 className="text-4xl font-black mb-6 leading-none">৳ {revStats.collected}</h2>

        <div className="flex justify-between items-center bg-white/10 p-4 rounded-2xl backdrop-blur-md border border-white/10">
          <div className="text-[11px] font-bold text-indigo-100 space-y-1">
            <p className="flex items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-400 mr-1.5"></span>
              পেন্ডিং: ৳ {revStats.pending}
            </p>
            <p className="flex items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 mr-1.5"></span>
              মোট খরচ: ৳ {revStats.totalExp}
            </p>
          </div>
          <div
            className={cn(
              "text-xs font-black px-4 py-2 rounded-xl shadow-sm",
              revStats.collected - revStats.totalExp >= 0 ? "bg-emerald-400 text-emerald-900" : "bg-red-400 text-red-900"
            )}
          >
            {revStats.collected - revStats.totalExp >= 0
              ? `লাভ: ৳ ${revStats.collected - revStats.totalExp}`
              : `লস: ৳ ${Math.abs(revStats.collected - revStats.totalExp)}`}
          </div>
        </div>
      </div>

      <div className="bg-white p-5 rounded-[32px] shadow-sm border border-gray-100">
        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center">
          <Icon icon={Wallet} size={14} className="mr-2 text-indigo-500" /> অ্যাডমিন ভিত্তিক হিসাব
        </h3>
        <div className="space-y-3">
          {["Dipu", "Shimanto"].map((admin) => {
            const net = revStats.admins[admin] - revStats.adminExps[admin];
            return (
              <div key={admin} className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <p className="font-black text-gray-800 text-sm mb-3 flex items-center">
                  <Icon icon={User} size={14} className="mr-1.5 text-gray-400" />
                  {admin}
                </p>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="bg-white p-2 rounded-xl border border-gray-100 text-center">
                    <p className="text-[9px] text-gray-400 font-bold uppercase mb-0.5">রিসিভ (+)</p>
                    <p className="text-xs font-black text-emerald-600">৳{revStats.admins[admin]}</p>
                  </div>
                  <div className="bg-white p-2 rounded-xl border border-gray-100 text-center">
                    <p className="text-[9px] text-gray-400 font-bold uppercase mb-0.5">খরচ (-)</p>
                    <p className="text-xs font-black text-red-500">৳{revStats.adminExps[admin]}</p>
                  </div>
                </div>
                <div className="flex justify-between items-center text-xs font-bold pt-3 border-t border-gray-200">
                  <span className="text-gray-500">হাতে জমা আছে (Net):</span>
                  <span className={cn("text-sm font-black", net < 0 ? "text-red-500" : "text-indigo-600")}>৳ {net}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-white p-5 rounded-[32px] shadow-sm border border-gray-100">
        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center">
          <Icon icon={Scale} size={14} className="mr-2 text-indigo-500" /> ব্যালেন্স স্কেল
        </h3>

        <div className="mb-6 relative pt-2 pb-2">
          <div className="flex h-5 rounded-full overflow-hidden bg-gray-100 shadow-inner">
            <div
              className="bg-cyan-500 h-full transition-all duration-500"
              style={{
                width: `${
                  (Math.max(0, dNet) / (Math.max(0, dNet) + Math.max(0, sNet) || 1)) * 100
                }%`,
              }}
            ></div>
            <div
              className="bg-amber-500 h-full transition-all duration-500"
              style={{
                width: `${
                  (Math.max(0, sNet) / (Math.max(0, dNet) + Math.max(0, sNet) || 1)) * 100
                }%`,
              }}
            ></div>
          </div>
          <div className="flex justify-between mt-3 text-[9px] font-black uppercase tracking-wider">
            <div className="text-cyan-600">Dipu (৳{dNet})</div>
            <div className="text-amber-600">Shimanto (৳{sNet})</div>
          </div>

          <div
            className={cn(
              "mt-5 p-4 rounded-2xl text-center text-xs font-bold border leading-relaxed",
              isEq ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-indigo-50 text-indigo-800 border-indigo-100"
            )}
          >
            <Icon
              icon={isEq ? CheckCircle : AlertTriangle}
              size={16}
              className={cn("inline mb-1 mr-1", isEq ? "text-emerald-500" : "text-indigo-400")}
            />
            <br />
            {msg}
          </div>
        </div>

        <div
          className={cn(
            "p-4 rounded-2xl border transition-colors",
            isEditingExpense ? "bg-blue-50 border-blue-200" : "bg-gray-50 border-gray-100"
          )}
        >
          <div className="flex justify-between items-center mb-4">
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center">
              <Icon icon={isEditingExpense ? Edit : Receipt} size={12} className="mr-1.5" />{" "}
              {isEditingExpense ? "খরচ আপডেট করুন" : "খরচ এন্ট্রি"}
            </p>
            {isEditingExpense && (
              <button
                onClick={() => {
                  setIsEditingExpense(false);
                  setExpenseForm({ adminName: "", amount: "", purpose: "" });
                }}
                className="text-[10px] font-bold text-gray-400 bg-white px-2 py-1 rounded-lg border border-gray-200"
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
                className="flex-1 bg-white border border-gray-200 rounded-xl p-3 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500"
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
                className="w-1/3 bg-white border border-gray-200 rounded-xl p-3 text-xs font-black text-indigo-700 outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <input
              required
              type="text"
              name="purpose"
              value={expenseForm.purpose}
              onChange={handleExpenseChange}
              placeholder="কী বাবদ খরচ? (যেমন: Boost)"
              className="w-full bg-white border border-gray-200 rounded-xl p-3 text-xs font-medium outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="submit"
              className={cn(
                "w-full text-white font-black py-3.5 rounded-xl text-xs uppercase tracking-widest active:scale-95 transition-transform",
                isEditingExpense ? "bg-blue-600 shadow-lg shadow-blue-200" : "bg-gray-800 shadow-lg shadow-gray-200"
              )}
            >
              {isEditingExpense ? "আপডেট করুন" : "সেভ করুন"}
            </button>
          </form>
        </div>

        <div className="space-y-3 mt-6">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1 mb-2">সাম্প্রতিক খরচসমূহ</p>
          {expenses.map((exp) => (
            <div key={exp.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
              <div className="flex justify-between items-center text-xs mb-3">
                <div className="flex items-center flex-1 pr-2">
                  <div
                    className={cn(
                      "w-8 h-8 rounded-xl flex items-center justify-center mr-3 shrink-0",
                      exp.adminName === "Dipu" ? "bg-cyan-50 text-cyan-600" : "bg-amber-50 text-amber-600"
                    )}
                  >
                    <Icon icon={User} size={14} />
                  </div>
                  <div>
                    <p className="font-bold text-gray-800">{exp.purpose}</p>
                    <p className="text-[9px] font-bold text-gray-400 uppercase mt-0.5">
                      {exp.adminName} • {new Date(exp.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <span className="font-black text-red-500 text-sm">- ৳{exp.amount}</span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-gray-50">
                <button
                  onClick={() => onHistoryClick({ title: "খরচের হিস্টোরি", history: exp.history || [] })}
                  className="text-[9px] font-bold text-indigo-500 flex items-center"
                >
                  <Icon icon={History} size={10} className="mr-1" /> লগ
                </button>
                <div className="flex space-x-1.5">
                  <button
                    onClick={() => onEditExpense(exp)}
                    className="p-2 bg-blue-50 text-blue-500 rounded-lg active:scale-90 transition-transform"
                  >
                    <Icon icon={Edit} size={14} />
                  </button>
                  <button
                    onClick={() => onDeleteExpense(exp.id)}
                    className="p-2 bg-red-50 text-red-400 rounded-lg active:scale-90 transition-transform"
                  >
                    <Icon icon={Trash2} size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
