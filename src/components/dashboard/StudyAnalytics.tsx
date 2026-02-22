import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { motion } from "framer-motion";

const weeklyData = [
  { day: "Mon", hours: 3.5 },
  { day: "Tue", hours: 5 },
  { day: "Wed", hours: 2 },
  { day: "Thu", hours: 6 },
  { day: "Fri", hours: 4.5 },
  { day: "Sat", hours: 7 },
  { day: "Sun", hours: 3 },
];

const monthlyData = [
  { week: "W1", hours: 22 },
  { week: "W2", hours: 28 },
  { week: "W3", hours: 25 },
  { week: "W4", hours: 31 },
];

const subjectBreakdown = [
  { name: "Math", hours: 12, color: "#6C63FF" },
  { name: "Physics", hours: 8, color: "#3B82F6" },
  { name: "CS", hours: 10, color: "#A855F7" },
  { name: "English", hours: 5, color: "#EC4899" },
];

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
  const totalWeek = weeklyData.reduce((a, b) => a + b.hours, 0);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Study Analytics</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Weekly bar chart */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Weekly Hours</h3>
            <span className="text-sm text-muted-foreground">{totalWeek}h total</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(230 20% 18%)" />
              <XAxis dataKey="day" tick={{ fill: "hsl(220 15% 55%)", fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "hsl(220 15% 55%)", fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="hours" fill="hsl(250 85% 65%)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Monthly trend */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="glass-card p-5">
          <h3 className="font-semibold mb-4">Monthly Trend</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(230 20% 18%)" />
              <XAxis dataKey="week" tick={{ fill: "hsl(220 15% 55%)", fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "hsl(220 15% 55%)", fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="hours" stroke="hsl(270 80% 60%)" strokeWidth={3} dot={{ fill: "hsl(270 80% 60%)", r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Subject breakdown */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="glass-card p-5">
        <h3 className="font-semibold mb-4">Subject Breakdown</h3>
        <div className="space-y-3">
          {subjectBreakdown.map((s) => {
            const pct = (s.hours / Math.max(...subjectBreakdown.map((x) => x.hours))) * 100;
            return (
              <div key={s.name} className="flex items-center gap-3">
                <span className="w-16 text-sm text-muted-foreground">{s.name}</span>
                <div className="flex-1 h-3 rounded-full bg-muted overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="h-full rounded-full"
                    style={{ background: s.color }}
                  />
                </div>
                <span className="text-sm font-medium w-8 text-right">{s.hours}h</span>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
