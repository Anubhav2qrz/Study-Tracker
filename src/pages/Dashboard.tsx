import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";

import OverviewPanel from "@/components/dashboard/OverviewPanel";
import SubjectManager from "@/components/dashboard/SubjectManager";
import PomodoroTimer from "@/components/dashboard/PomodoroTimer";
import StudyAnalytics from "@/components/dashboard/StudyAnalytics";
import TaskManager from "@/components/dashboard/TaskManager";
import MotivationalQuote from "@/components/dashboard/MotivationalQuote";

import {
  LayoutDashboard,
  BookOpen,
  Clock,
  BarChart3,
  CheckSquare,
  LogOut,
} from "lucide-react";

const tabs = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "subjects", label: "Subjects", icon: BookOpen },
  { id: "timer", label: "Pomodoro", icon: Clock },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "tasks", label: "Tasks", icon: CheckSquare },
] as const;

type Tab = (typeof tabs)[number]["id"];

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="sticky top-0 z-50 px-4 md:px-8 py-4 flex items-center justify-between border-b">
        <h1 className="text-xl font-bold">StudyTracker</h1>

        <div className="flex items-center gap-4">
          <MotivationalQuote />
          <button
            onClick={handleSignOut}
            className="text-muted-foreground hover:text-foreground transition-colors p-2"
            title="Sign out"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      <div className="flex flex-col md:flex-row">
        {/* Sidebar */}
        <nav className="fixed bottom-0 left-0 right-0 md:sticky md:top-[73px] md:h-[calc(100vh-73px)] md:w-56 md:shrink-0 z-40 border-t md:border-t-0 md:border-r flex md:flex-col items-center md:items-stretch gap-1 px-2 py-2 md:px-3">
          {tabs.map((t) => {
            const active = activeTab === t.id;

            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`relative flex flex-col md:flex-row items-center md:gap-3 px-3 py-2 rounded-xl text-xs md:text-sm font-medium transition-colors flex-1 md:flex-none ${
                  active
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <t.icon size={18} />
                <span className="mt-1 md:mt-0">{t.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Main content */}
        <main className="flex-1 p-4 md:p-8 pb-24 md:pb-8 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
            >
              {activeTab === "overview" && <OverviewPanel />}
              {activeTab === "subjects" && <SubjectManager />}
              {activeTab === "timer" && <PomodoroTimer />}
              {activeTab === "analytics" && <StudyAnalytics />}
              {activeTab === "tasks" && <TaskManager />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}