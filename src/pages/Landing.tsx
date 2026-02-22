import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { BookOpen, BarChart3, Clock, Target, Zap, Trophy } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";

const features = [
  { icon: Clock, title: "Pomodoro Timer", desc: "Stay focused with 25/5 sessions and animated countdowns" },
  { icon: BarChart3, title: "Study Analytics", desc: "Track weekly progress with interactive charts and insights" },
  { icon: Target, title: "Goal Tracking", desc: "Set daily targets and maintain your study streak" },
  { icon: BookOpen, title: "Subject Manager", desc: "Organize subjects with color coding and progress tracking" },
  { icon: Zap, title: "Task Manager", desc: "Plan daily tasks and check them off with satisfying animations" },
  { icon: Trophy, title: "Achievements", desc: "Earn badges and celebrate milestones with confetti" },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center px-4">
        <img
          src={heroBg}
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/60 to-background" />

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 text-center max-w-3xl mx-auto"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="inline-flex items-center gap-2 glass-card px-4 py-2 mb-8 text-sm text-muted-foreground"
          >
            <Zap size={14} className="text-primary" />
            Supercharge your study sessions
          </motion.div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tight mb-6 leading-tight">
            Level Up Your{" "}
            <span className="neon-text">Study Game</span>
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto mb-10">
            Track your study progress, stay consistent, and crush your academic goals with a beautiful dashboard built for students.
          </p>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/auth")}
            className="btn-glow text-primary-foreground font-semibold text-lg px-10 py-4 rounded-2xl"
          >
            Get Started — It's Free
          </motion.button>
        </motion.div>
      </section>

      {/* Features */}
      <section className="relative z-10 px-4 pb-24 -mt-16">
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
          className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {features.map((f) => (
            <motion.div
              key={f.title}
              variants={fadeUp}
              className="glass-card-hover p-6 group cursor-default"
            >
              <div className="w-11 h-11 rounded-xl gradient-bg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <f.icon size={20} className="text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-1">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>
    </div>
  );
}
