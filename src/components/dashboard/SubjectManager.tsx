import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, X, Check } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface Subject {
  id: string;
  name: string;
  color: string;
  hours: number;
  target: number;
}

const colorOptions = [
  "#6C63FF",
  "#3B82F6",
  "#A855F7",
  "#EC4899",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#06B6D4",
];

export default function SubjectManager() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState(colorOptions[0]);
  const [newTarget, setNewTarget] = useState("30");

  // 🔥 Fetch subjects from database
  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    const { data, error } = await supabase
      .from("subjects")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setSubjects(data);
    } else {
      console.error(error);
    }
  };

  // ➕ Add subject
  const addSubject = async () => {
    if (!newName.trim()) return;

    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;

    if (!user) return;

    const { error } = await supabase.from("subjects").insert({
      name: newName,
      color: newColor,
      target: parseInt(newTarget) || 30,
      hours: 0,
      user_id: user.id,
    });

    if (error) {
      console.error(error);
      return;
    }

    setNewName("");
    setAdding(false);
    fetchSubjects();
  };

  // 🗑 Delete subject
  const remove = async (id: string) => {
    await supabase.from("subjects").delete().eq("id", id);
    fetchSubjects();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Subjects</h2>

        <button
          onClick={() => setAdding(!adding)}
          className="px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 bg-primary text-white"
        >
          {adding ? <X size={16} /> : <Plus size={16} />}
          {adding ? "Cancel" : "Add Subject"}
        </button>
      </div>

      {/* Add Subject Form */}
      <AnimatePresence>
        {adding && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="p-5 space-y-4 border rounded-xl overflow-hidden"
          >
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Subject name"
              className="w-full bg-muted rounded-xl px-4 py-3 text-sm"
            />

            <div className="flex gap-2">
              {colorOptions.map((c) => (
                <button
                  key={c}
                  onClick={() => setNewColor(c)}
                  className={`w-7 h-7 rounded-full transition-transform ${
                    newColor === c ? "scale-125 ring-2 ring-foreground/40" : ""
                  }`}
                  style={{ background: c }}
                />
              ))}
            </div>

            <input
              value={newTarget}
              onChange={(e) => setNewTarget(e.target.value)}
              type="number"
              className="w-24 bg-muted rounded-xl px-3 py-2 text-sm"
            />

            <button
              onClick={addSubject}
              className="flex items-center gap-2 text-sm font-medium text-primary"
            >
              <Check size={16} /> Add Subject
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Subject Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {subjects.map((s) => {
          const pct = Math.min((s.hours / s.target) * 100, 100);
          const circumference = 2 * Math.PI * 36;

          return (
            <motion.div
              key={s.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="p-5 border rounded-xl flex items-center gap-5 bg-card"
            >
              {/* Circular Progress */}
              <div className="relative w-20 h-20 shrink-0">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
                  <circle
                    cx="40"
                    cy="40"
                    r="36"
                    fill="none"
                    stroke="hsl(var(--muted))"
                    strokeWidth="6"
                  />
                  <motion.circle
                    cx="40"
                    cy="40"
                    r="36"
                    fill="none"
                    stroke={s.color}
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{
                      strokeDashoffset:
                        circumference - (circumference * pct) / 100,
                    }}
                    transition={{ duration: 1 }}
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold">
                  {Math.round(pct)}%
                </span>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <div
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ background: s.color }}
                  />
                  <h3 className="font-semibold truncate">{s.name}</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  {s.hours}h / {s.target}h studied
                </p>
              </div>

              {/* Delete */}
              <button
                onClick={() => remove(s.id)}
                className="text-red-500 hover:scale-110 transition-transform"
              >
                <Trash2 size={16} />
              </button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}