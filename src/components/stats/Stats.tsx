import React, { useMemo, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line } from "recharts";
import { Deal, Teacher } from "../../types";
import { TrendingUp, TrendingDown, Users, BookOpen, CheckCircle, XCircle, GraduationCap, MapPin, Award, Calendar, BarChart3, LineChart as LineChartIcon, ChevronDown } from "lucide-react";
import { TuitionUpdatePost } from "./TuitionUpdatePost";
import { cn } from "../../lib/utils";

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
      { name: "Running", value: running, color: "#10b981" },
      { name: "Confirmed", value: confirmed, color: "#0d9488" },
      { name: "Rejected", value: rejected, color: "#f43f5e" },
      { name: "Cancelled", value: cancelled, color: "#f59e0b" },
      { name: "Processing", value: processing, color: "#64748b" },
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

    // Monthly Trends Data
    const monthlyTrends = months.map((month, index) => {
      const monthDeals = deals.filter(d => {
        const date = new Date(d.createdAt);
        return date.getMonth() === index && date.getFullYear() === selectedYear;
      });
      return {
        name: month.substring(0, 3),
        deals: monthDeals.length,
        commission: monthDeals.reduce((sum, d) => sum + (d.commission || 0), 0)
      };
    });

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
      recentTuitions,
      monthlyTrends
    };
  }, [deals, teachers, selectedYear, selectedMonth]);

  return (
    <div className="space-y-12 pb-12 pt-6 px-4 md:px-8 lg:px-12 max-w-6xl mx-auto fade-in transition-colors">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
        <div className="bg-white dark:bg-slate-900 p-8 sm:p-10 rounded-[48px] shadow-sm border border-slate-100 dark:border-slate-800 transition-all hover:border-emerald-200 dark:hover:border-emerald-800 group relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl group-hover:bg-emerald-500/10 transition-colors" />
          <div className="flex items-center gap-4 text-emerald-600 dark:text-emerald-400 mb-6 relative z-10">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl group-hover:scale-110 transition-transform shadow-sm border border-emerald-100 dark:border-emerald-900/20">
              <BookOpen className="w-6 h-6 sm:w-7 sm:h-7 shrink-0" />
            </div>
            <span className="text-[11px] sm:text-[12px] font-black uppercase tracking-[0.3em] truncate">Running</span>
          </div>
          <div className="text-4xl sm:text-5xl font-black text-slate-800 dark:text-white tracking-tighter relative z-10">{stats.running}</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-8 sm:p-10 rounded-[48px] shadow-sm border border-slate-100 dark:border-slate-800 transition-all hover:border-amber-200 dark:hover:border-amber-800 group relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl group-hover:bg-amber-500/10 transition-colors" />
          <div className="flex items-center gap-4 text-amber-600 dark:text-amber-400 mb-6 relative z-10">
            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-2xl group-hover:scale-110 transition-transform shadow-sm border border-amber-100 dark:border-amber-900/20">
              <Users className="w-6 h-6 sm:w-7 sm:h-7 shrink-0" />
            </div>
            <span className="text-[11px] sm:text-[12px] font-black uppercase tracking-[0.3em] truncate">Teachers</span>
          </div>
          <div className="text-4xl sm:text-5xl font-black text-slate-800 dark:text-white tracking-tighter relative z-10">{stats.totalTeachers}</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-8 sm:p-10 rounded-[48px] shadow-sm border border-slate-100 dark:border-slate-800 transition-all hover:border-emerald-200 dark:hover:border-emerald-800 group relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl group-hover:bg-emerald-500/10 transition-colors" />
          <div className="flex items-center gap-4 text-emerald-500 dark:text-emerald-400 mb-6 relative z-10">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl group-hover:scale-110 transition-transform shadow-sm border border-emerald-100 dark:border-emerald-900/20">
              <CheckCircle className="w-6 h-6 sm:w-7 sm:h-7 shrink-0" />
            </div>
            <span className="text-[11px] sm:text-[12px] font-black uppercase tracking-[0.3em] truncate">Avg. Comm.</span>
          </div>
          <div className="text-4xl sm:text-5xl font-black text-slate-800 dark:text-white tracking-tighter relative z-10">৳{stats.avgCommission}</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-8 sm:p-10 rounded-[48px] shadow-sm border border-slate-100 dark:border-slate-800 transition-all hover:border-rose-200 dark:hover:border-rose-800 group relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-32 h-32 bg-rose-500/5 rounded-full blur-3xl group-hover:bg-rose-500/10 transition-colors" />
          <div className="flex items-center gap-4 text-rose-600 dark:text-rose-400 mb-6 relative z-10">
            <div className="p-3 bg-rose-50 dark:bg-rose-900/20 rounded-2xl group-hover:scale-110 transition-transform shadow-sm border border-rose-100 dark:border-rose-900/20">
              <TrendingDown className="w-6 h-6 sm:w-7 sm:h-7 shrink-0" />
            </div>
            <span className="text-[11px] sm:text-[12px] font-black uppercase tracking-[0.3em] truncate">Loss</span>
          </div>
          <div className="text-4xl sm:text-5xl font-black text-slate-800 dark:text-white tracking-tighter relative z-10">৳{Math.round(stats.commissionLoss / 1000)}k</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="bg-white dark:bg-slate-900 p-10 md:p-12 rounded-[56px] card-shadow border border-slate-100 dark:border-slate-800/50 transition-colors">
          <div className="text-[13px] font-black text-slate-800 dark:text-slate-200 mb-10 flex items-center gap-4 uppercase tracking-[0.2em]">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl border border-emerald-100 dark:border-emerald-900/20">
              <TrendingUp size={22} className="text-emerald-600 dark:text-emerald-400" />
            </div>
            Tuition Status Overview
          </div>
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={105}
                  paddingAngle={10}
                  dataKey="value"
                  stroke="none"
                >
                  {stats.statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(15, 23, 42, 0.95)', 
                    borderRadius: '28px',
                    border: 'none',
                    boxShadow: '0 25px 30px -5px rgb(0 0 0 / 0.2)',
                    color: '#fff',
                    fontSize: '13px',
                    fontWeight: '900',
                    padding: '16px 20px'
                  }}
                  itemStyle={{ color: '#fff' }}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={40}
                  iconType="circle"
                  formatter={(value) => <span className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-10 md:p-12 rounded-[56px] card-shadow border border-slate-100 dark:border-slate-800/50 transition-colors">
          <div className="text-[13px] font-black text-slate-800 dark:text-slate-200 mb-10 flex items-center gap-4 uppercase tracking-[0.2em]">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl border border-emerald-100 dark:border-emerald-900/20">
              <BarChart3 size={22} className="text-emerald-600 dark:text-emerald-400" />
            </div>
            Monthly Tuition Trends ({selectedYear})
          </div>
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.monthlyTrends}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.3} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fontWeight: 900, fill: '#94a3b8' }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fontWeight: 900, fill: '#94a3b8' }}
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(16, 185, 129, 0.05)' }}
                  contentStyle={{ 
                    backgroundColor: 'rgba(15, 23, 42, 0.95)', 
                    borderRadius: '28px',
                    border: 'none',
                    boxShadow: '0 25px 30px -5px rgb(0 0 0 / 0.2)',
                    color: '#fff',
                    fontSize: '13px',
                    fontWeight: '900',
                    padding: '16px 20px'
                  }}
                />
                <Bar dataKey="deals" fill="#10b981" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="bg-white dark:bg-slate-900 p-10 md:p-12 rounded-[56px] card-shadow border border-slate-100 dark:border-slate-800/50 transition-colors">
          <div className="text-[13px] font-black text-slate-800 dark:text-slate-200 mb-10 flex items-center gap-4 uppercase tracking-[0.2em]">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl border border-emerald-100 dark:border-emerald-900/20">
              <LineChartIcon size={22} className="text-emerald-600 dark:text-emerald-400" />
            </div>
            Commission Growth ({selectedYear})
          </div>
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.monthlyTrends}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.3} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fontWeight: 900, fill: '#94a3b8' }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fontWeight: 900, fill: '#94a3b8' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(15, 23, 42, 0.95)', 
                    borderRadius: '28px',
                    border: 'none',
                    boxShadow: '0 25px 30px -5px rgb(0 0 0 / 0.2)',
                    color: '#fff',
                    fontSize: '13px',
                    fontWeight: '900',
                    padding: '16px 20px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="commission" 
                  stroke="#10b981" 
                  strokeWidth={6} 
                  dot={{ r: 7, fill: '#10b981', strokeWidth: 5, stroke: '#fff' }}
                  activeDot={{ r: 12, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white dark:bg-slate-900 p-10 md:p-12 rounded-[56px] card-shadow border border-slate-100 dark:border-slate-800/50 transition-colors">
            <div className="text-[13px] font-black text-slate-800 dark:text-slate-200 mb-8 flex items-center gap-4 uppercase tracking-[0.2em]">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl border border-emerald-100 dark:border-emerald-900/20">
                <GraduationCap size={22} className="text-emerald-600 dark:text-emerald-400" />
              </div>
              Top Institutions
            </div>
            <div className="space-y-6">
              {stats.topInstitutions.length > 0 ? (
                stats.topInstitutions.map(([name, count]) => (
                  <div key={name} className="flex items-center justify-between gap-6 group">
                    <span className="text-sm font-bold text-slate-600 dark:text-slate-400 truncate flex-1 group-hover:text-emerald-600 transition-colors" title={name}>{name}</span>
                    <span className="text-[11px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-5 py-2.5 rounded-2xl whitespace-nowrap shrink-0 border border-emerald-100 dark:border-emerald-900/20 uppercase tracking-[0.15em]">{count} teachers</span>
                  </div>
                ))
              ) : (
                <div className="text-xs text-slate-400 text-center py-8 font-black uppercase tracking-widest">No data available</div>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-10 md:p-12 rounded-[56px] card-shadow border border-slate-100 dark:border-slate-800/50 transition-colors">
            <div className="text-[13px] font-black text-slate-800 dark:text-slate-200 mb-8 flex items-center gap-4 uppercase tracking-[0.2em]">
              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-2xl border border-amber-100 dark:border-amber-900/20">
                <MapPin size={22} className="text-amber-600 dark:text-amber-400" />
              </div>
              Top Areas
            </div>
            <div className="space-y-6">
              {stats.topAreas.length > 0 ? (
                stats.topAreas.map(([name, count]) => (
                  <div key={name} className="flex items-center justify-between gap-6 group">
                    <span className="text-sm font-bold text-slate-600 dark:text-slate-400 truncate flex-1 group-hover:text-amber-600 transition-colors" title={name}>{name}</span>
                    <span className="text-[11px] font-black text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 px-5 py-2.5 rounded-2xl whitespace-nowrap shrink-0 border border-amber-100 dark:border-amber-900/20 uppercase tracking-[0.15em]">{count} teachers</span>
                  </div>
                ))
              ) : (
                <div className="text-xs text-slate-400 text-center py-8 font-black uppercase tracking-widest">No data available</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {stats.recentTuitions.length > 0 && (
        <div className="bg-white dark:bg-slate-900 p-10 md:p-12 rounded-[56px] shadow-sm border border-slate-100 dark:border-slate-800 transition-colors">
          <div className="text-[13px] font-black text-slate-800 dark:text-slate-200 mb-10 flex items-center gap-4 uppercase tracking-[0.2em]">
            <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-2xl border border-amber-200 dark:border-amber-800/20">
              <Award size={22} className="text-amber-600 dark:text-amber-400" />
            </div>
            Last 5 Tuition Updates
          </div>
          <TuitionUpdatePost deals={stats.recentTuitions} />
        </div>
      )}

      <div className="bg-rose-50 dark:bg-rose-950/20 p-10 md:p-12 rounded-[56px] border border-rose-100 dark:border-rose-900/30 transition-all">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-8 mb-12">
          <div className="space-y-3">
            <div className="text-[13px] font-black text-rose-900 dark:text-rose-100 flex items-center gap-4 uppercase tracking-[0.2em]">
              <div className="p-3 bg-rose-100 dark:bg-rose-900/30 rounded-2xl border border-rose-200 dark:border-rose-800/20">
                <TrendingDown size={22} />
              </div>
              Commission Loss
            </div>
            <p className="text-[11px] text-rose-700 dark:text-rose-400 font-black uppercase tracking-[0.25em] opacity-60">
              Rejected & Cancelled
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative flex-1 sm:flex-none group">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                className="w-full sm:w-auto pl-12 pr-12 py-4 bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/50 rounded-[24px] text-[12px] font-black text-rose-900 dark:text-rose-100 appearance-none focus:outline-none focus:ring-8 focus:ring-rose-500/10 transition-all cursor-pointer hover:border-rose-400 uppercase tracking-widest"
              >
                <option value={-1}>All Months</option>
                {months.map((m, i) => (
                  <option key={m} value={i}>{m}</option>
                ))}
              </select>
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-rose-400 group-hover:text-rose-600 transition-colors" />
              <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none">
                <ChevronDown size={16} className="text-rose-400" />
              </div>
            </div>
            
            <div className="relative flex-1 sm:flex-none group">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="w-full sm:w-auto pl-12 pr-12 py-4 bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/50 rounded-[24px] text-[12px] font-black text-rose-900 dark:text-rose-100 appearance-none focus:outline-none focus:ring-8 focus:ring-rose-500/10 transition-all cursor-pointer hover:border-rose-400 uppercase tracking-widest"
              >
                {years.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-rose-400 group-hover:text-rose-600 transition-colors" />
              <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none">
                <ChevronDown size={16} className="text-rose-400" />
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-baseline gap-6 mb-6">
          <div className="text-5xl sm:text-7xl font-black text-rose-600 dark:text-rose-500 tracking-tighter">
            ৳{stats.commissionLoss.toLocaleString()}
          </div>
          {stats.commissionLoss > 0 && (
            <div className="animate-pulse w-4 h-4 rounded-full bg-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.6)]"></div>
          )}
        </div>
        
        <div className="p-6 bg-white/50 dark:bg-slate-900/50 rounded-[32px] border border-rose-100/50 dark:border-rose-900/30">
          <p className="text-sm text-rose-800 dark:text-rose-200 font-black leading-relaxed flex items-center gap-4 uppercase tracking-wider">
            <CheckCircle size={20} className="text-rose-500 shrink-0" />
            {stats.commissionLoss > 0 
              ? `Potential loss for ${selectedMonth === -1 ? "all months" : months[selectedMonth]} ${selectedYear}.`
              : `Great! No commission loss recorded for ${selectedMonth === -1 ? "all months" : months[selectedMonth]} ${selectedYear}.`
            }
          </p>
        </div>
      </div>

      <div className="pt-10">
        <button
          onClick={onResetDemo}
          className="w-full py-6 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[40px] font-black text-[13px] uppercase tracking-[0.3em] shadow-2xl shadow-slate-900/30 dark:shadow-white/10 active:scale-[0.98] transition-all hover:opacity-90"
        >
          Reset Demo Data
        </button>
      </div>
    </div>
  );
};
