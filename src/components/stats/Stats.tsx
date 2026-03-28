import React, { useMemo, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Deal, Teacher } from "../../types";
import { TrendingUp, TrendingDown, Users, BookOpen, CheckCircle, XCircle, GraduationCap, MapPin, Award, Calendar } from "lucide-react";
import { TuitionUpdatePost } from "./TuitionUpdatePost";

interface StatsProps {
  deals: Deal[];
  teachers: Teacher[];
  onResetDemo: () => void;
}

export const Stats: React.FC<StatsProps> = ({ deals, teachers, onResetDemo }) => {
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  const years = useMemo(() => {
    const yearsSet = new Set<number>();
    deals.forEach(d => yearsSet.add(new Date(d.createdAt).getFullYear()));
    yearsSet.add(new Date().getFullYear());
    return Array.from(yearsSet).sort((a, b) => b - a);
  }, [deals]);

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const stats = useMemo(() => {
    const running = deals.filter(d => d.tuitionStatus === "Running").length;
    const confirmed = deals.filter(d => d.tuitionStatus === "Confirmed").length;
    const rejected = deals.filter(d => d.tuitionStatus === "Rejected").length;
    const cancelled = deals.filter(d => d.tuitionStatus === "Cancelled").length;
    const processing = deals.filter(d => d.tuitionStatus === "Processing").length;

    const filteredLossDeals = deals.filter(d => {
      const isRejectedOrCancelled = d.tuitionStatus === "Rejected" || d.tuitionStatus === "Cancelled";
      if (!isRejectedOrCancelled) return false;
      
      const date = new Date(d.createdAt);
      const matchMonth = selectedMonth === -1 || date.getMonth() === selectedMonth;
      const matchYear = date.getFullYear() === selectedYear;
      
      return matchMonth && matchYear;
    });

    const commissionLoss = filteredLossDeals.reduce((sum, d) => sum + (d.commission || 0), 0);

    const statusData = [
      { name: "Running", value: running, color: "#6366f1" },
      { name: "Confirmed", value: confirmed, color: "#10b981" },
      { name: "Rejected", value: rejected, color: "#ef4444" },
      { name: "Cancelled", value: cancelled, color: "#f59e0b" },
      { name: "Processing", value: processing, color: "#94a3b8" },
    ].filter(d => d.value > 0);

    const avgCommission = deals.length > 0 
      ? Math.round(deals.reduce((sum, d) => sum + (d.commission || 0), 0) / deals.length)
      : 0;

    const topInstitutions = Object.entries(
      teachers.reduce((acc, t) => {
        if (t.collegeName) {
          acc[t.collegeName] = (acc[t.collegeName] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>)
    )
      .sort((a, b) => (b[1] as number) - (a[1] as number))
      .slice(0, 3);

    const topAreas = Object.entries(
      teachers.reduce((acc, t) => {
        if (t.presentAddress) {
          acc[t.presentAddress] = (acc[t.presentAddress] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>)
    )
      .sort((a, b) => (b[1] as number) - (a[1] as number))
      .slice(0, 3);

    const recentTuitions = [...deals]
      .filter(d => d.tuitionStatus === "Confirmed" || d.tuitionStatus === "Running")
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 5);

    return {
      running,
      totalTeachers: teachers.length,
      successCount: confirmed,
      rejectedCount: rejected + cancelled,
      commissionLoss,
      statusData,
      avgCommission,
      topInstitutions,
      topAreas,
      recentTuitions
    };
  }, [deals, teachers]);

  return (
    <div className="space-y-6 pb-8">
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <div className="bg-white p-3 sm:p-4 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-1.5 sm:gap-2 text-indigo-600 mb-1">
            <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider truncate">Running</span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-gray-800">{stats.running}</div>
        </div>
        <div className="bg-white p-3 sm:p-4 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-1.5 sm:gap-2 text-purple-600 mb-1">
            <Users className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider truncate">Teachers</span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-gray-800">{stats.totalTeachers}</div>
        </div>
        <div className="bg-white p-3 sm:p-4 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-1.5 sm:gap-2 text-emerald-600 mb-1">
            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider truncate">Avg. Comm.</span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-gray-800">৳{stats.avgCommission}</div>
        </div>
        <div className="bg-white p-3 sm:p-4 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-1.5 sm:gap-2 text-rose-600 mb-1">
            <TrendingDown className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider truncate">Loss</span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-gray-800">৳{Math.round(stats.commissionLoss / 1000)}k</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-[40px] shadow-sm border border-gray-100">
          <h3 className="text-sm font-black text-gray-800 mb-6 flex items-center gap-2">
            <TrendingUp size={18} className="text-indigo-500" />
            Tuition Status Overview
          </h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stats.statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-[40px] shadow-sm border border-gray-100">
            <h3 className="text-sm font-black text-gray-800 mb-4 flex items-center gap-2">
              <GraduationCap size={18} className="text-indigo-500" />
              Top Institutions
            </h3>
            <div className="space-y-3">
              {stats.topInstitutions.length > 0 ? (
                stats.topInstitutions.map(([name, count]) => (
                  <div key={name} className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-gray-600 truncate flex-1" title={name}>{name}</span>
                    <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg whitespace-nowrap shrink-0">{count} teachers</span>
                  </div>
                ))
              ) : (
                <div className="text-xs text-gray-400 text-center py-4">No data available</div>
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-[40px] shadow-sm border border-gray-100">
            <h3 className="text-sm font-black text-gray-800 mb-4 flex items-center gap-2">
              <MapPin size={18} className="text-indigo-500" />
              Top Areas
            </h3>
            <div className="space-y-3">
              {stats.topAreas.length > 0 ? (
                stats.topAreas.map(([name, count]) => (
                  <div key={name} className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-gray-600 truncate flex-1" title={name}>{name}</span>
                    <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg whitespace-nowrap shrink-0">{count} teachers</span>
                  </div>
                ))
              ) : (
                <div className="text-xs text-gray-400 text-center py-4">No data available</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {stats.recentTuitions.length > 0 && (
        <div className="bg-white p-6 rounded-[40px] shadow-sm border border-gray-100">
          <h3 className="text-sm font-black text-gray-800 mb-8 flex items-center gap-2">
            <Award size={18} className="text-indigo-500" />
            Last 5 Tuition Updates
          </h3>
          <TuitionUpdatePost deals={stats.recentTuitions} />
        </div>
      )}

      <div className="bg-rose-50 p-6 rounded-[40px] border border-rose-100 transition-all">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="space-y-1">
            <h3 className="text-sm font-black text-rose-900 flex items-center gap-2">
              <TrendingDown size={18} />
              Commission Loss
            </h3>
            <p className="text-[10px] text-rose-700 font-bold uppercase tracking-wider opacity-60">
              Rejected & Cancelled
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:flex-none group">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                className="w-full sm:w-auto pl-9 pr-8 py-2.5 bg-white border border-rose-200 rounded-2xl text-[11px] font-black text-rose-900 appearance-none focus:outline-none focus:ring-4 focus:ring-rose-500/10 transition-all cursor-pointer hover:border-rose-400"
              >
                <option value={-1}>All Months</option>
                {months.map((m, i) => (
                  <option key={m} value={i}>{m}</option>
                ))}
              </select>
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-rose-400 group-hover:text-rose-600 transition-colors" />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <div className="w-1.5 h-1.5 border-r-2 border-b-2 border-rose-400 rotate-45"></div>
              </div>
            </div>
            
            <div className="relative flex-1 sm:flex-none group">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="w-full sm:w-auto pl-9 pr-8 py-2.5 bg-white border border-rose-200 rounded-2xl text-[11px] font-black text-rose-900 appearance-none focus:outline-none focus:ring-4 focus:ring-rose-500/10 transition-all cursor-pointer hover:border-rose-400"
              >
                {years.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-rose-400 group-hover:text-rose-600 transition-colors" />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <div className="w-1.5 h-1.5 border-r-2 border-b-2 border-rose-400 rotate-45"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-baseline gap-3 mb-3">
          <div className="text-5xl font-black text-rose-600 tracking-tighter">
            ৳{stats.commissionLoss.toLocaleString()}
          </div>
          {stats.commissionLoss > 0 && (
            <div className="animate-pulse w-2 h-2 rounded-full bg-rose-500"></div>
          )}
        </div>
        
        <div className="p-4 bg-white/50 rounded-2xl border border-rose-100/50">
          <p className="text-xs text-rose-800 font-bold leading-relaxed flex items-center gap-2">
            <CheckCircle size={14} className="text-rose-500" />
            {stats.commissionLoss > 0 
              ? `Potential loss for ${selectedMonth === -1 ? "all months" : months[selectedMonth]} ${selectedYear}.`
              : `Great! No commission loss recorded for ${selectedMonth === -1 ? "all months" : months[selectedMonth]} ${selectedYear}.`
            }
          </p>
        </div>
      </div>

      <div className="pt-4">
        <button
          onClick={onResetDemo}
          className="w-full py-4 bg-indigo-50 text-indigo-600 rounded-[24px] font-black text-xs uppercase tracking-widest border-2 border-indigo-100 hover:bg-indigo-100 transition-colors"
        >
          Reset Demo Data
        </button>
      </div>
    </div>
  );
};
