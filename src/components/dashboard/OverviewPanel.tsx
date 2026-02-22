import { motion } from "framer-motion";
import { Flame, Clock, TrendingUp, CalendarDays } from "lucide-react";

const stats = [
  { label: "Today's Hours", value: "4.5h", icon: Clock, color: "text-neon-blue" },
  { label: "Weekly Progress", value: "72%", icon: TrendingUp, color: "text-primary" },
  { label: "Study Streak", value: "12 days", icon: Flame, color: "text-warning" },
  { label: "Next Exam", value: "5 days", icon: CalendarDays, color: "text-accent" },
];

export default function OverviewPanel() {
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
              <s.icon size={18} className={s.color} />
            </div>
            <p className="text-3xl font-bold">{s.value}</p>
            {s.label === "Weekly Progress" && (
              <div className="mt-3 h-2 rounded-full bg-muted overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "72%" }}
                  transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
                  className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
                />
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Quick summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass-card p-6">
          <h3 className="font-semibold mb-3">Today's Plan</h3>
          <div className="space-y-3">
            {["Math — Chapter 7 Review", "Physics — Lab Report", "CS — Algorithm Practice"].map((t) => (
              <div key={t} className="flex items-center gap-3 text-sm text-muted-foreground">
                <div className="w-2 h-2 rounded-full bg-primary" />
                {t}
              </div>
            ))}
          </div>
        </div>
        <div className="glass-card p-6">
          <h3 className="font-semibold mb-3">Recent Achievements</h3>
          <div className="flex gap-3 flex-wrap">
            {["🔥 7-Day Streak", "📚 10 Subjects", "⏱ 100 Hours"].map((b) => (
              <span key={b} className="glass-card px-3 py-1.5 text-xs font-medium">{b}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
