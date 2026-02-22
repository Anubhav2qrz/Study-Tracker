import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";

export default function PomodoroTimer() {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>("");

  useEffect(() => {
    fetchSubjects();
  }, []);

  useEffect(() => {
    let interval: any;

    if (running && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    }

    if (timeLeft === 0 && running) {
      handleSessionComplete();
    }

    return () => clearInterval(interval);
  }, [running, timeLeft]);

  const fetchSubjects = async () => {
    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;
    if (!user) return;

    const { data } = await supabase
      .from("subjects")
      .select("*")
      .eq("user_id", user.id);

    if (data) {
      setSubjects(data);
      if (data.length > 0) {
        setSelectedSubject(data[0].id);
      }
    }
  };

  const handleSessionComplete = async () => {
    setRunning(false);
    setTimeLeft(25 * 60);

    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;
    if (!user || !selectedSubject) return;

    // 1️⃣ Save study session
    await supabase.from("study_sessions").insert({
      user_id: user.id,
      subject_id: selectedSubject,
      duration_minutes: 25,
    });

    // 2️⃣ Update subject total hours
    const { data: subject } = await supabase
      .from("subjects")
      .select("hours")
      .eq("id", selectedSubject)
      .single();

    if (subject) {
      await supabase
        .from("subjects")
        .update({
          hours: subject.hours + 25 / 60,
        })
        .eq("id", selectedSubject);
    }

    alert("Pomodoro complete! Session saved 🔥");
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Pomodoro Timer</h2>

      {/* Subject Selector */}
      <select
        value={selectedSubject}
        onChange={(e) => setSelectedSubject(e.target.value)}
        className="bg-muted rounded-xl px-4 py-2"
      >
        {subjects.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </select>

      {/* Timer */}
      <div className="text-center">
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          className="text-6xl font-bold"
        >
          {minutes}:{seconds.toString().padStart(2, "0")}
        </motion.div>

        <div className="flex justify-center gap-4 mt-6">
          <button
            onClick={() => setRunning(true)}
            className="bg-primary text-white px-6 py-2 rounded-xl"
          >
            Start
          </button>

          <button
            onClick={() => {
              setRunning(false);
              setTimeLeft(25 * 60);
            }}
            className="bg-muted px-6 py-2 rounded-xl"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}