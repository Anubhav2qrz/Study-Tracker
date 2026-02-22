import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import dayjs from "dayjs";

interface Session {
  subject_id: string;
  duration_minutes: number;
  created_at: string;
  subjects?: {
    name: string;
    color: string;
  };
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card px-3 py-2 text-xs">
      <p className="font-medium">{label}</p>
      <p className="text-primary">{payload[0].value}h</p>
    </div>
  );
};

export default function StudyAnalytics() {
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [subjectBreakdown, setSubjectBreakdown] = useState<any[]>([]);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;
    if (!user) return;

    const sevenDaysAgo = dayjs().subtract(6, "day").startOf("day").toISOString();
    const monthStart = dayjs().startOf("month").toISOString();

    const { data, error } = await supabase
      .from("study_sessions")
      .select("*, subjects(name,color)")
      .eq("user_id", user.id);

    if (error || !data) return;

    const sessions: Session[] = data;

    // -------- WEEKLY --------
    const weekMap: any = {};
    for (let i = 0; i < 7; i++) {
      const day = dayjs().subtract(i, "day").format("ddd");
      weekMap[day] = 0;
    }

    sessions.forEach((s) => {
      if (dayjs(s.created_at).isAfter(sevenDaysAgo)) {
        const day = dayjs(s.created_at).format("ddd");
        weekMap[day] += s.duration_minutes / 60;
      }
    });

    const weekArray = Object.keys(weekMap)
      .reverse()
      .map((day) => ({
        day,
        hours: Number(weekMap[day].toFixed(1)),
      }));

    setWeeklyData(weekArray);

    // -------- MONTHLY --------
    const monthMap: any = {};
    sessions.forEach((s) => {
      if (dayjs(s.created_at).isAfter(monthStart)) {
        const week = `W${Math.ceil(dayjs(s.created_at).date() / 7)}`;
        if (!monthMap[week]) monthMap[week] = 0;
        monthMap[week] += s.duration_minutes / 60;
      }
    });

    const monthArray = Object.keys(monthMap).map((w) => ({
      week: w,
      hours: Number(monthMap[w].toFixed(1)),
    }));

    setMonthlyData(monthArray);

    // -------- SUBJECT BREAKDOWN --------
    const subjectMap: any = {};
    sessions.forEach((s) => {
      const name = s.subjects?.name || "Unknown";
      const color = s.subjects?.color || "#888";

      if (!subjectMap[name]) {
        subjectMap[name] = { name, hours: 0, color };
      }

      subjectMap[name].hours += s.duration_minutes / 60;
    });

    setSubjectBreakdown(Object.values(subjectMap));
  };

  const totalWeek = weeklyData.reduce((a, b) => a + b.hours, 0);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Study Analytics</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div className="glass-card p-5">
          <div className="flex justify-between mb-4">
            <h3 className="font-semibold">Weekly Hours</h3>
            <span className="text-sm text-muted-foreground">
              {totalWeek.toFixed(1)}h total
            </span>
          </div>

          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="hours" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div className="glass-card p-5">
          <h3 className="font-semibold mb-4">Monthly Trend</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="hours" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      <motion.div className="glass-card p-5">
        <h3 className="font-semibold mb-4">Subject Breakdown</h3>
        <div className="space-y-3">
          {subjectBreakdown.map((s: any) => {
            const max = Math.max(
              ...subjectBreakdown.map((x: any) => x.hours),
              1
            );
            const pct = (s.hours / max) * 100;

            return (
              <div key={s.name} className="flex items-center gap-3">
                <span className="w-20 text-sm text-muted-foreground">
                  {s.name}
                </span>

                <div className="flex-1 h-3 rounded-full bg-muted overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.8 }}
                    className="h-full rounded-full"
                    style={{ background: s.color }}
                  />
                </div>

                <span className="text-sm font-medium w-10 text-right">
                  {s.hours.toFixed(1)}h
                </span>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}