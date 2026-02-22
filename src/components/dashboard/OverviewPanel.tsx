import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Flame, Clock, TrendingUp, CalendarDays } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function OverviewPanel() {
  const [todayHours] = useState(0);
  const [weeklyProgress] = useState(0);
  const [streak] = useState(0);
  const [nextExamDays, setNextExamDays] = useState<number | null>(null);
  const [examDate, setExamDate] = useState<string | null>(null);
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
    const { data, error } = await supabase
      .from("exams")
      .select("*")
      .eq("user_id", uid)
      .limit(1);

    if (!error && data && data.length > 0) {
      const savedDate = data[0].exam_date;
      setExamDate(savedDate);

      const today = new Date();
      const exam = new Date(savedDate);

      const diff = Math.ceil(
        (exam.getTime() - today.getTime()) /
          (1000 * 60 * 60 * 24)
      );

      setNextExamDays(diff >= 0 ? diff : 0);
    }
  };

  const handleDateChange = async (date: string) => {
    if (!userId) return;

    // Delete old exam row first (prevents duplicates)
    await supabase.from("exams").delete().eq("user_id", userId);

    await supabase.from("exams").insert({
      user_id: userId,
      exam_date: date,
    });

    fetchExam(userId);
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

          <input
            type="date"
            value={examDate || ""}
            className="mt-3 text-sm bg-muted rounded-lg px-3 py-1"
            onChange={(e) =>
              handleDateChange(e.target.value)
            }
          />
        </motion.div>
      </div>
    </div>
  );
}