import React, { useMemo, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line } from "recharts";
import { Deal, Teacher } from "../../types";
import { TrendingUp, TrendingDown, Users, BookOpen, CheckCircle, XCircle, GraduationCap, MapPin, Award, Calendar, BarChart3, LineChart as LineChartIcon, ChevronDown, ChevronUp, UserCheck, Share2 } from "lucide-react";
import { TuitionUpdatePost } from "./TuitionUpdatePost";
import { cn } from "../../lib/utils";

interface StatsProps {
  deals: Deal[];
  teachers: Teacher[];
}

export const Stats: React.FC<StatsProps> = ({ deals, teachers }) => {
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [showAllReferrers, setShowAllReferrers] = useState<boolean>(false);

  const years = useMemo(() => {
    const yearsSet = new Set<number>();
    deals.forEach(d => {
      const yr = new Date(d.createdAt).getFullYear();
      if (!isNaN(yr)) yearsSet.add(yr);
    });
    // Add years from 2024 to 2030 (ensures 2027-2030 are always selectable)
    for (let y = 2024; y <= 2030; y++) {
      yearsSet.add(y);
    }
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

    // Last 50 Tuitions Guardian Gender Requirement Analysis
    const last50Deals = [...deals]
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
      .slice(0, 50);

    let maleCount = 0;
    let femaleCount = 0;
    let anyCount = 0;

    last50Deals.forEach(d => {
      if (d.tutorGender === "Male") {
        maleCount++;
      } else if (d.tutorGender === "Female") {
        femaleCount++;
      } else {
        anyCount++;
      }
    });

    const total50 = last50Deals.length;
    const malePercent = total50 > 0 ? Math.round((maleCount / total50) * 100) : 0;
    const femalePercent = total50 > 0 ? Math.round((femaleCount / total50) * 100) : 0;
    const anyPercent = total50 > 0 ? Math.round((anyCount / total50) * 100) : 0;

    const genderReqData = [
      { name: "পুরুষ (Male)", count: maleCount, percentage: malePercent, fill: "#3b82f6" },
      { name: "মহিলা (Female)", count: femaleCount, percentage: femalePercent, fill: "#ec4899" },
      { name: "উভয় / যে কোনো (Any)", count: anyCount, percentage: anyPercent, fill: "#10b981" },
    ];

    // Referrer Statistics Analysis
    const referrerCounts: Record<string, { total: number; confirmed: number; running: number; totalCommission: number }> = {};
    let totalReferredDeals = 0;

    deals.forEach(d => {
      const ref = (d.referrerName || "").trim();
      if (ref && ref.toLowerCase() !== "n/a" && ref.toLowerCase() !== "none" && ref !== "-") {
        totalReferredDeals++;
        if (!referrerCounts[ref]) {
          referrerCounts[ref] = { total: 0, confirmed: 0, running: 0, totalCommission: 0 };
        }
        referrerCounts[ref].total += 1;
        if (d.tuitionStatus === "Confirmed") referrerCounts[ref].confirmed += 1;
        if (d.tuitionStatus === "Running") referrerCounts[ref].running += 1;
        referrerCounts[ref].totalCommission += (d.commission || 0);
      }
    });

    const topReferrersList = Object.entries(referrerCounts)
      .map(([name, data]) => ({
        name,
        count: data.total,
        successful: data.confirmed + data.running,
        totalCommission: data.totalCommission
      }))
      .sort((a, b) => b.count - a.count);

    const totalUniqueReferrers = topReferrersList.length;

    const referrerChartData = topReferrersList.slice(0, 10).map(r => ({
      name: r.name.length > 18 ? r.name.substring(0, 18) + "..." : r.name,
      fullName: r.name,
      count: r.count,
      successful: r.successful,
      totalCommission: r.totalCommission
    }));

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
      monthlyTrends,
      total50,
      maleCount,
      femaleCount,
      anyCount,
      malePercent,
      femalePercent,
      anyPercent,
      genderReqData,
      totalReferredDeals,
      totalUniqueReferrers,
      topReferrersList,
      referrerChartData
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
            <div className="text-[13px] font-black text-slate-800 dark:text-slate-200 flex items-center gap-4 uppercase tracking-[0.2em]">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl border border-emerald-100 dark:border-emerald-900/20">
                <BarChart3 size={22} className="text-emerald-600 dark:text-emerald-400" />
              </div>
              Monthly Tuition Trends ({selectedYear})
            </div>
            <div className="relative group self-start sm:self-auto">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl text-[11px] font-black text-slate-800 dark:text-slate-200 appearance-none focus:outline-none focus:ring-4 focus:ring-emerald-500/10 cursor-pointer hover:border-emerald-400 uppercase tracking-widest"
              >
                {years.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
              <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500 pointer-events-none" />
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                <ChevronDown size={14} className="text-slate-400" />
              </div>
            </div>
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

      {/* Guardian Gender Requirement in Last 50 Tuitions */}
      <div className="bg-white dark:bg-slate-900 p-10 md:p-12 rounded-[56px] card-shadow border border-slate-100 dark:border-slate-800/50 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
          <div className="text-[13px] font-black text-slate-800 dark:text-slate-200 flex items-center gap-4 uppercase tracking-[0.2em]">
            <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-900/20">
              <UserCheck size={22} className="text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <span>সর্বশেষ ৫০টি টিউশনে অভিভাবকের চাহিদা (Gender)</span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold block normal-case tracking-normal mt-0.5">
                Tutor Preference Breakdown (Male / Female / Any)
              </span>
            </div>
          </div>
          <span className="text-[11px] font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-5 py-2.5 rounded-2xl whitespace-nowrap self-start sm:self-auto border border-indigo-100 dark:border-indigo-900/20 uppercase tracking-[0.15em]">
            সর্বমোট বিশ্লেষণ: {stats.total50} টি টিউশন
          </span>
        </div>

        {stats.total50 > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Stat Cards Column */}
            <div className="lg:col-span-5 space-y-4">
              <div className="p-5 bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 rounded-3xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-500 text-white flex items-center justify-center font-black text-xs shadow-md shadow-blue-500/20">
                    M
                  </div>
                  <div>
                    <div className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">পুরুষ টিউটর আবশ্যক</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 font-bold">Male Required</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-black text-blue-600 dark:text-blue-400">{stats.maleCount} টি</div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stats.malePercent}%</div>
                </div>
              </div>

              <div className="p-5 bg-pink-50/60 dark:bg-pink-950/30 border border-pink-100 dark:border-pink-900/40 rounded-3xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-pink-500 text-white flex items-center justify-center font-black text-xs shadow-md shadow-pink-500/20">
                    F
                  </div>
                  <div>
                    <div className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">মহিলা টিউটর আবশ্যক</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 font-bold">Female Required</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-black text-pink-600 dark:text-pink-400">{stats.femaleCount} টি</div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stats.femalePercent}%</div>
                </div>
              </div>

              <div className="p-5 bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 rounded-3xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center font-black text-xs shadow-md shadow-emerald-500/20">
                    A
                  </div>
                  <div>
                    <div className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">যে কোনো (উভয়) গ্রহণযোগ্য</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 font-bold">Any (Male / Female)</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-black text-emerald-600 dark:text-emerald-400">{stats.anyCount} টি</div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stats.anyPercent}%</div>
                </div>
              </div>
            </div>

            {/* Recharts Bar Chart */}
            <div className="lg:col-span-7 h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.genderReqData} layout="vertical" margin={{ left: 10, right: 30, top: 10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" opacity={0.3} />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 900, fill: '#94a3b8' }} />
                  <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 900, fill: '#64748b' }} width={130} />
                  <Tooltip
                    cursor={{ fill: 'rgba(99, 102, 241, 0.05)' }}
                    contentStyle={{
                      backgroundColor: 'rgba(15, 23, 42, 0.95)',
                      borderRadius: '24px',
                      border: 'none',
                      boxShadow: '0 25px 30px -5px rgb(0 0 0 / 0.2)',
                      color: '#fff',
                      fontSize: '13px',
                      fontWeight: '900',
                      padding: '14px 18px'
                    }}
                    formatter={(value: any) => [`${value} টি টিউশন`, "সংখ্যা"]}
                  />
                  <Bar dataKey="count" radius={[0, 12, 12, 0]} barSize={32}>
                    {stats.genderReqData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          <div className="text-xs text-slate-400 text-center py-8 font-black uppercase tracking-widest">টিউশনের কোনো ডাটা পাওয়া যায়নি</div>
        )}
      </div>

      {/* Referrer Statistics Graph & Leaderboard */}
      <div className="bg-white dark:bg-slate-900 p-10 md:p-12 rounded-[56px] card-shadow border border-slate-100 dark:border-slate-800/50 transition-colors space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="text-[13px] font-black text-slate-800 dark:text-slate-200 flex items-center gap-4 uppercase tracking-[0.2em]">
            <div className="p-3 bg-violet-50 dark:bg-violet-900/20 rounded-2xl border border-violet-100 dark:border-violet-900/20">
              <Share2 size={22} className="text-violet-600 dark:text-violet-400" />
            </div>
            <div>
              <span>রেফারালভিত্তিক টিউশন পরিসংখ্যান</span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold block normal-case tracking-normal mt-0.5">
                Referrer Performance & Tuition Referral Counts
              </span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-black text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/30 px-5 py-2.5 rounded-2xl whitespace-nowrap border border-violet-100 dark:border-violet-900/20 uppercase tracking-[0.15em]">
              রেফারকৃত টিউশন: {stats.totalReferredDeals} টি
            </span>
            <span className="text-[11px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-5 py-2.5 rounded-2xl whitespace-nowrap border border-emerald-100 dark:border-emerald-900/20 uppercase tracking-[0.15em]">
              মোট রেফারার: {stats.totalUniqueReferrers} জন
            </span>
          </div>
        </div>

        {stats.topReferrersList.length > 0 ? (
          <div className="space-y-8">
            {/* Graph Visualization */}
            <div className="p-6 bg-slate-50/50 dark:bg-slate-800/30 rounded-[32px] border border-slate-100 dark:border-slate-800">
              <div className="text-xs font-black text-slate-700 dark:text-slate-300 mb-4 uppercase tracking-wider flex items-center gap-2">
                <BarChart3 size={16} className="text-violet-500" />
                <span>সর্বোচ্চ টিউশন রেফারকারীদের গ্রাফ (Top Referrers)</span>
              </div>
              <div className="h-[320px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.referrerChartData} margin={{ left: 10, right: 30, top: 10, bottom: 25 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.3} />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 11, fontWeight: 900, fill: '#64748b' }}
                      interval={0}
                      angle={-15}
                      textAnchor="end"
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 11, fontWeight: 900, fill: '#94a3b8' }}
                      allowDecimals={false}
                    />
                    <Tooltip 
                      cursor={{ fill: 'rgba(139, 92, 246, 0.05)' }}
                      contentStyle={{ 
                        backgroundColor: 'rgba(15, 23, 42, 0.95)', 
                        borderRadius: '24px',
                        border: 'none',
                        boxShadow: '0 25px 30px -5px rgb(0 0 0 / 0.2)',
                        color: '#fff',
                        fontSize: '13px',
                        fontWeight: '900',
                        padding: '14px 18px'
                      }}
                      formatter={(value: any) => [`${value} টি টিউশন`, "রেফার সংখ্যা"]}
                      labelFormatter={(label, items) => {
                        if (items && items[0]) {
                          return `রেফারার: ${items[0].payload.fullName}`;
                        }
                        return label;
                      }}
                    />
                    <Bar dataKey="count" fill="#8b5cf6" radius={[10, 10, 0, 0]} barSize={36} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Referrer Ranking List */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <div className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <Award size={16} className="text-amber-500" />
                  <span>রেফারকারীদের র‍্যাঙ্কিং তালিকা (Referrer Ranking)</span>
                </div>
                {stats.topReferrersList.length > 6 && (
                  <button
                    type="button"
                    onClick={() => setShowAllReferrers(!showAllReferrers)}
                    className="text-xs font-black text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-1 self-start sm:self-auto"
                  >
                    {showAllReferrers ? (
                      <>
                        <span>কম দেখুন</span>
                        <ChevronUp size={14} />
                      </>
                    ) : (
                      <>
                        <span>আরও দেখুন ({stats.topReferrersList.length} জন)</span>
                        <ChevronDown size={14} />
                      </>
                    )}
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(showAllReferrers ? stats.topReferrersList : stats.topReferrersList.slice(0, 6)).map((ref, idx) => (
                  <div 
                    key={ref.name + idx}
                    className="p-4 bg-white dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 rounded-2xl flex items-center justify-between gap-4 shadow-sm hover:border-violet-300 dark:hover:border-violet-700 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black shrink-0",
                        idx === 0 ? "bg-amber-500 text-white shadow-md shadow-amber-500/20" :
                        idx === 1 ? "bg-slate-400 text-white" :
                        idx === 2 ? "bg-amber-700 text-white" :
                        "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                      )}>
                        #{idx + 1}
                      </div>
                      <div>
                        <div className="text-xs font-black text-slate-800 dark:text-slate-100 line-clamp-1">
                          {ref.name}
                        </div>
                        <div className="text-[10px] text-slate-400 font-bold">
                          সফল টিউশন: {ref.successful} টি
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="inline-block px-3 py-1 bg-violet-50 dark:bg-violet-950/50 text-violet-600 dark:text-violet-400 rounded-xl text-xs font-black border border-violet-100 dark:border-violet-900/30">
                        {ref.count} টি রেফার
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              {stats.topReferrersList.length > 6 && (
                <div className="text-center pt-3">
                  <button
                    type="button"
                    onClick={() => setShowAllReferrers(!showAllReferrers)}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 font-black text-xs hover:bg-violet-100 dark:hover:bg-violet-900/60 border border-violet-100 dark:border-violet-900/30 transition-all shadow-sm"
                  >
                    {showAllReferrers ? (
                      <>
                        <span>কম দেখুন</span>
                        <ChevronUp size={16} />
                      </>
                    ) : (
                      <>
                        <span>সকল রেফারার দেখুন (আরও {stats.topReferrersList.length - 6} জন)</span>
                        <ChevronDown size={16} />
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-xs text-slate-400 text-center py-8 font-black uppercase tracking-widest">
            কোনো রেফারারের তথ্য পাওয়া যায়নি
          </div>
        )}
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
    </div>
  );
};
