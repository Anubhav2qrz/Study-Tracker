import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Flame, Clock, TrendingUp, CalendarDays } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function OverviewPanel() {
  const [todayHours] = useState(0);
  const [weeklyProgress] = useState(0);
  const [streak] = useState(0);
  const [nextExamDays, setNextExamDays] = useState<number | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;
    if (!user) return;

    setUserId(user.id);
    fetchExam(user.id);
  };

  const fetchExam = async (uid: string) => {
    const { data } = await supabase
      .from("exams")
      .select("*")
      .eq("user_id", uid)
      .single();

    if (data?.exam_date) {
      const today = new Date();
      const examDate = new Date(data.exam_date);
      const diff = Math.ceil(
        (examDate.getTime() - today.getTime()) /
          (1000 * 60 * 60 * 24)
      );

      setNextExamDays(diff >= 0 ? diff : 0);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Dashboard Overview</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Today's Hours */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card-hover p-5"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-muted-foreground">
              Today's Hours
            </span>
            <Clock size={18} />
          </div>
          <p className="text-3xl font-bold">{todayHours}h</p>
        </motion.div>

        {/* Weekly Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card-hover p-5"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-muted-foreground">
              Weekly Progress
            </span>
            <TrendingUp size={18} />
          </div>
          <p className="text-3xl font-bold">{weeklyProgress}%</p>

          <div className="mt-3 h-2 rounded-full bg-muted overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${weeklyProgress}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
            />
          </div>
        </motion.div>

        {/* Study Streak */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card-hover p-5"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-muted-foreground">
              Study Streak
            </span>
            <Flame size={18} />
          </div>
          <p className="text-3xl font-bold">{streak} days</p>
        </motion.div>

        {/* Next Exam */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card-hover p-5"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-muted-foreground">
              Next Exam
            </span>
            <CalendarDays size={18} />
          </div>

          <p className="text-3xl font-bold">
            {nextExamDays !== null
              ? `${nextExamDays} days`
              : "Not set"}
          </p>

          {/* Date Picker */}
          <input
            type="date"
            className="mt-3 text-sm bg-muted rounded-lg px-3 py-1"
            onChange={async (e) => {
              if (!userId) return;

              await supabase.from("exams").upsert({
                user_id: userId,
                exam_date: e.target.value,
              });

              fetchExam(userId);
            }}
          />
        </motion.div>
      </div>
    </div>
  );
}