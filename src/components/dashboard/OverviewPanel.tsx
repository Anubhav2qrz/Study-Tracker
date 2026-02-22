import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Flame, Clock, TrendingUp, CalendarDays } from "lucide-react";
import { supabase } from "@/lib/supabase";
import dayjs from "dayjs";

export default function OverviewPanel() {
  const [todayHours, setTodayHours] = useState(0);
  const [weeklyProgress, setWeeklyProgress] = useState(0);
  const [streak, setStreak] = useState(0);
  const [nextExam, setNextExam] = useState(5); // keep same style

  useEffect(() => {
    fetchOverview();
  }, []);

  const fetchOverview = async () => {
    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;
    if (!user) return;

    const { data } = await supabase
      .from("study_sessions")
      .select("*")
      .eq("user_id", user.id);

    if (!data) return;

    const todayStart = dayjs().startOf("day");
    const weekStart = dayjs().startOf("week");

    const todayTotal =
      data
        .filter((s) => dayjs(s.created_at).isAfter(todayStart))
        .reduce((sum, s) => sum + s.duration_minutes, 0) / 60;

    setTodayHours(Number(todayTotal.toFixed(1)));

    const weekTotal =
      data
        .filter((s) => dayjs(s.created_at).isAfter(weekStart))
        .reduce((sum, s) => sum + s.duration_minutes, 0) / 60;

    const progress = Math.min((weekTotal / 20) * 100, 100); // 20h weekly goal
    setWeeklyProgress(progress);

    const uniqueDays = new Set(
      data.map((s) => dayjs(s.created_at).format("YYYY-MM-DD"))
    );

    let streakCount = 0;
    let current = dayjs();

    while (uniqueDays.has(current.format("YYYY-MM-DD"))) {
      streakCount++;
      current = current.subtract(1, "day");
    }

    setStreak(streakCount);
  };

  const stats = [
    {
      label: "Today's Hours",
      value: `${todayHours}h`,
      icon: Clock,
      color: "text-neon-blue",
    },
    {
      label: "Weekly Progress",
      value: `${Math.round(weeklyProgress)}%`,
      icon: TrendingUp,
      color: "text-primary",
    },
    {
      label: "Study Streak",
      value: `${streak} days`,
      icon: Flame,
      color: "text-warning",
    },
    {
      label: "Next Exam",
      value: `${nextExam} days`,
      icon: CalendarDays,
      color: "text-accent",
    },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Dashboard Overview</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card-hover p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">
                {s.label}
              </span>
              <s.icon size={18} className={s.color} />
            </div>

            <p className="text-3xl font-bold">{s.value}</p>

            {s.label === "Weekly Progress" && (
              <div className="mt-3 h-2 rounded-full bg-muted overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${weeklyProgress}%` }}
                  transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
                  className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
                />
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}