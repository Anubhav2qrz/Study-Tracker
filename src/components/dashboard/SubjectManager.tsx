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

  // 🔥 Fetch Subjects
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
    }
  };

  // ➕ Add Subject
  const addSubject = async () => {
    if (!newName.trim()) return;

    const user = (await supabase.auth.getUser()).data.user;
    if (!user) return;

    const { error } = await supabase.from("subjects").insert({
      name: newName,
      color: newColor,
      target: parseInt(newTarget) || 30,
      hours: 0,
      user_id: user.id,
    });

    if (!error) {
      fetchSubjects();
      setNewName("");
      setAdding(false);
    }
  };

  // 🗑 Delete Subject
  const remove = async (id: string) => {
    await supabase.from("subjects").delete().eq("id", id);
    fetchSubjects();
  };

  return (
    <div className="space-y-6">
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

      <AnimatePresence>
        {adding && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-5 space-y-4 border rounded-xl"
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
                  className={`w-7 h-7 rounded-full ${
                    newColor === c ? "ring-2 ring-black" : ""
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {subjects.map((s) => {
          const pct = Math.min((s.hours / s.target) * 100, 100);

          return (
            <motion.div
              key={s.id}
              layout
              className="p-5 border rounded-xl flex items-center justify-between"
            >
              <div>
                <h3 className="font-semibold">{s.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {s.hours}h / {s.target}h
                </p>
              </div>

              <button
                onClick={() => remove(s.id)}
                className="text-red-500"
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