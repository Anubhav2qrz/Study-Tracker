import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Edit2, X, Check } from "lucide-react";

interface Subject {
  id: string;
  name: string;
  color: string;
  hours: number;
  target: number;
}

const defaultSubjects: Subject[] = [
  { id: "1", name: "Mathematics", color: "#6C63FF", hours: 24, target: 40 },
  { id: "2", name: "Physics", color: "#3B82F6", hours: 18, target: 30 },
  { id: "3", name: "Computer Science", color: "#A855F7", hours: 32, target: 35 },
  { id: "4", name: "English", color: "#EC4899", hours: 10, target: 20 },
];

const colorOptions = ["#6C63FF", "#3B82F6", "#A855F7", "#EC4899", "#10B981", "#F59E0B", "#EF4444", "#06B6D4"];

export default function SubjectManager() {
  const [subjects, setSubjects] = useState<Subject[]>(defaultSubjects);
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState(colorOptions[0]);
  const [newTarget, setNewTarget] = useState("30");

  const addSubject = () => {
    if (!newName.trim()) return;
    setSubjects((prev) => [
      ...prev,
      { id: Date.now().toString(), name: newName, color: newColor, hours: 0, target: parseInt(newTarget) || 30 },
    ]);
    setNewName("");
    setAdding(false);
  };

  const remove = (id: string) => setSubjects((prev) => prev.filter((s) => s.id !== id));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Subjects</h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setAdding(!adding)}
          className="btn-glow text-primary-foreground px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2"
        >
          {adding ? <X size={16} /> : <Plus size={16} />}
          {adding ? "Cancel" : "Add Subject"}
        </motion.button>
      </div>

      <AnimatePresence>
        {adding && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="glass-card p-5 space-y-4 overflow-hidden"
          >
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Subject name"
              className="w-full bg-muted rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
            />
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">Color:</span>
              <div className="flex gap-2">
                {colorOptions.map((c) => (
                  <button
                    key={c}
                    onClick={() => setNewColor(c)}
                    className={`w-7 h-7 rounded-full transition-transform ${newColor === c ? "scale-125 ring-2 ring-foreground/30" : ""}`}
                    style={{ background: c }}
                  />
                ))}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">Target hours:</span>
              <input
                value={newTarget}
                onChange={(e) => setNewTarget(e.target.value)}
                type="number"
                className="w-20 bg-muted rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <button onClick={addSubject} className="flex items-center gap-2 text-sm font-medium text-primary hover:underline">
              <Check size={16} /> Add Subject
            </button>
          </motion.div>
        )}
      </AnimatePresence>

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
              className="glass-card-hover p-5 flex items-center gap-5"
            >
              {/* Circular progress */}
              <div className="relative w-20 h-20 shrink-0">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r="36" fill="none" stroke="hsl(var(--muted))" strokeWidth="6" />
                  <motion.circle
                    cx="40" cy="40" r="36"
                    fill="none"
                    stroke={s.color}
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: circumference - (circumference * pct) / 100 }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold">
                  {Math.round(pct)}%
                </span>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-3 h-3 rounded-full shrink-0" style={{ background: s.color }} />
                  <h3 className="font-semibold truncate">{s.name}</h3>
                </div>
                <p className="text-sm text-muted-foreground">{s.hours}h / {s.target}h studied</p>
              </div>

              <button onClick={() => remove(s.id)} className="text-muted-foreground hover:text-destructive transition-colors p-1">
                <Trash2 size={16} />
              </button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
