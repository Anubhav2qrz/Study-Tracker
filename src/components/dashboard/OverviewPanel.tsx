import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Flame, Clock, TrendingUp, CalendarDays } from "lucide-react";
import { supabase } from "@/lib/supabase";
import dayjs from "dayjs";

export default function OverviewPanel() {
  const [todayHours, setTodayHours] = useState(0);
  const [weeklyProgress, setWeeklyProgress] = useState(0);
  const [streak, setStreak] = useState(0);
  const [nextExam, setNextExam] = useState(0);

  useEffect(() => {
    fetchOverview();
  }, []);

  const fetchOverview = async () => {
    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;
    if (!user) return;

    const todayStart = dayjs().startOf("day").toISOString();
    const weekStart = dayjs().startOf("week").toISOString();

    const { data } = await supabase
      .from("study_sessions")
      .select("*")
      .eq("user_id", user.id);

    if (!data) return;

    // Today's hours
    const today = data.filter((s) =>
      dayjs(s.created_at).isAfter(todayStart)
    );
    const todayTotal =
      today.reduce((sum, s) => sum + s.duration_minutes, 0) / 60;

    setTodayHours(Number(todayTotal.toFixed(1)));

    // Weekly progress
    const week = data.filter((s) =>
      dayjs(s.created_at).isAfter(weekStart)
    );
    const weekTotal =
      week.reduce((sum, s) => sum + s.duration_minutes, 0) / 60;

    setWeeklyProgress(Math.min((weekTotal / 20) * 100, 100)); // assume 20h weekly goal

    // Simple streak logic
    const uniqueDays = new Set(
      data.map((s) => dayjs(s.created_at).format("YYYY-MM-DD"))
    );

    let streakCount = 0;
    let currentDay = dayjs();

    while (uniqueDays.has(currentDay.format("YYYY-MM-DD"))) {
      streakCount++;
      currentDay = currentDay.subtract(1, "day");
    }

    setStreak(streakCount);

    // Example next exam countdown (fake future date for now)
    const examDate = dayjs().add(5, "day");
    setNextExam(examDate.diff(dayjs(), "day"));
  };

  const stats = [
    {
      label: "Today's Hours",
      value: `${todayHours}h`,
      icon: Clock,
    },
    {
      label: "Weekly Progress",
      value: `${Math.round(weeklyProgress)}%`,
      icon: TrendingUp,
    },
    {
      label: "Study Streak",
      value: `${streak} days`,
      icon: Flame,
    },
    {
      label: "Next Exam",
      value: `${nextExam} days`,
      icon: CalendarDays,
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
              <span className="text-sm text-muted-foreground">{s.label}</span>
              <s.icon size={18} />
            </div>

            <p className="text-3xl font-bold">{s.value}</p>

            {s.label === "Weekly Progress" && (
              <div className="mt-3 h-2 rounded-full bg-muted overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${weeklyProgress}%` }}
                  transition={{ duration: 0.8 }}
                  className="h-full bg-primary"
                />
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}