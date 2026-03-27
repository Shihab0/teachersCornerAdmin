import React, { useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Deal, Teacher } from "../../types";
import { TrendingUp, TrendingDown, Users, BookOpen, CheckCircle, XCircle, GraduationCap, MapPin } from "lucide-react";

interface StatsProps {
  deals: Deal[];
  teachers: Teacher[];
  onResetDemo: () => void;
}

export const Stats: React.FC<StatsProps> = ({ deals, teachers, onResetDemo }) => {
  const stats = useMemo(() => {
    const running = deals.filter(d => d.tuitionStatus === "Running").length;
    const confirmed = deals.filter(d => d.tuitionStatus === "Confirmed").length;
    const rejected = deals.filter(d => d.tuitionStatus === "Rejected").length;
    const cancelled = deals.filter(d => d.tuitionStatus === "Cancelled").length;
    const processing = deals.filter(d => d.tuitionStatus === "Processing").length;

    const commissionLoss = deals
      .filter(d => d.tuitionStatus === "Rejected" || d.tuitionStatus === "Cancelled")
      .reduce((sum, d) => sum + (d.commission || 0), 0);

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
        acc[t.institution] = (acc[t.institution] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    )
      .sort((a, b) => (b[1] as number) - (a[1] as number))
      .slice(0, 3);

    const topAreas = Object.entries(
      teachers.reduce((acc, t) => {
        acc[t.area] = (acc[t.area] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    )
      .sort((a, b) => (b[1] as number) - (a[1] as number))
      .slice(0, 3);

    return {
      running,
      totalTeachers: teachers.length,
      successCount: confirmed,
      rejectedCount: rejected + cancelled,
      commissionLoss,
      statusData,
      avgCommission,
      topInstitutions,
      topAreas
    };
  }, [deals, teachers]);

  return (
    <div className="space-y-6 pb-8">
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 text-indigo-600 mb-1">
            <BookOpen size={16} />
            <span className="text-[10px] font-bold uppercase tracking-wider">Running</span>
          </div>
          <div className="text-2xl font-black text-gray-800">{stats.running}</div>
        </div>
        <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 text-purple-600 mb-1">
            <Users size={16} />
            <span className="text-[10px] font-bold uppercase tracking-wider">Teachers</span>
          </div>
          <div className="text-2xl font-black text-gray-800">{stats.totalTeachers}</div>
        </div>
        <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 text-emerald-600 mb-1">
            <CheckCircle size={16} />
            <span className="text-[10px] font-bold uppercase tracking-wider">Avg. Comm.</span>
          </div>
          <div className="text-2xl font-black text-gray-800">৳{stats.avgCommission}</div>
        </div>
        <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 text-rose-600 mb-1">
            <TrendingDown size={16} />
            <span className="text-[10px] font-bold uppercase tracking-wider">Loss</span>
          </div>
          <div className="text-2xl font-black text-gray-800">৳{Math.round(stats.commissionLoss / 1000)}k</div>
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
              {stats.topInstitutions.map(([name, count]) => (
                <div key={name} className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-600">{name}</span>
                  <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg">{count} teachers</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-[40px] shadow-sm border border-gray-100">
            <h3 className="text-sm font-black text-gray-800 mb-4 flex items-center gap-2">
              <MapPin size={18} className="text-indigo-500" />
              Top Areas
            </h3>
            <div className="space-y-3">
              {stats.topAreas.map(([name, count]) => (
                <div key={name} className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-600">{name}</span>
                  <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg">{count} teachers</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-rose-50 p-6 rounded-[40px] border border-rose-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-black text-rose-900 flex items-center gap-2">
            <TrendingDown size={18} />
            Commission Loss
          </h3>
          <span className="text-xs font-bold text-rose-600 bg-rose-100 px-3 py-1 rounded-full">
            Rejected/Cancelled
          </span>
        </div>
        <div className="text-4xl font-black text-rose-600 mb-2">
          ৳{stats.commissionLoss.toLocaleString()}
        </div>
        <p className="text-xs text-rose-700 font-medium leading-relaxed">
          This amount represents the potential commission lost from rejected or cancelled tuitions.
        </p>
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
