import { useState, useEffect } from "react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import { Plus, Check, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface Task {
  id: string;
  text: string;
  done: boolean;
}

export default function TaskManager() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [input, setInput] = useState("");
  const [userId, setUserId] = useState<string | null>(null);

  // 🔥 Get user + initial fetch
  useEffect(() => {
    const init = async () => {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      if (!user) return;

      setUserId(user.id);

      const { data } = await supabase
        .from("tasks")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });

      if (data) setTasks(data);
    };

    init();
  }, []);

  // 🔥 REALTIME SUBSCRIPTION (production safe)
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel("tasks-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "tasks",
          filter: `user_id=eq.${userId}`,
        },
        async () => {
          const { data } = await supabase
            .from("tasks")
            .select("*")
            .eq("user_id", userId)
            .order("created_at", { ascending: true });

          if (data) setTasks(data);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const addTask = async () => {
    if (!input.trim() || !userId) return;

    await supabase.from("tasks").insert({
      text: input,
      done: false,
      user_id: userId,
    });

    setInput("");
  };

  const toggle = async (id: string, current: boolean) => {
    await supabase.from("tasks").update({ done: !current }).eq("id", id);
  };

  const remove = async (id: string) => {
    await supabase.from("tasks").delete().eq("id", id);
  };

  const completed = tasks.filter((t) => t.done).length;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Tasks</h2>
        <span className="text-sm text-muted-foreground">
          {completed}/{tasks.length} done
        </span>
      </div>

      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
          animate={{
            width: tasks.length
              ? `${(completed / tasks.length) * 100}%`
              : "0%",
          }}
          transition={{ duration: 0.5 }}
        />
      </div>

      <div className="flex gap-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addTask()}
          placeholder="Add a new task..."
          className="flex-1 bg-muted rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
        />
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={addTask}
          className="btn-glow text-primary-foreground px-4 rounded-xl"
        >
          <Plus size={20} />
        </motion.button>
      </div>

      <Reorder.Group
        axis="y"
        values={tasks}
        onReorder={setTasks}
        className="space-y-2"
      >
        <AnimatePresence>
          {tasks.map((task) => (
            <Reorder.Item
              key={task.id}
              value={task}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -100 }}
              className="glass-card-hover p-4 flex items-center gap-3 cursor-grab active:cursor-grabbing"
            >
              <button
                onClick={() => toggle(task.id, task.done)}
                className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all shrink-0 ${
                  task.done
                    ? "bg-primary border-primary"
                    : "border-muted-foreground/30 hover:border-primary/50"
                }`}
              >
                {task.done && (
                  <Check
                    size={14}
                    className="text-primary-foreground"
                  />
                )}
              </button>

              <span
                className={`flex-1 text-sm ${
                  task.done
                    ? "line-through text-muted-foreground"
                    : ""
                }`}
              >
                {task.text}
              </span>

              <button
                onClick={() => remove(task.id)}
                className="text-muted-foreground hover:text-destructive transition-colors p-1"
              >
                <Trash2 size={14} />
              </button>
            </Reorder.Item>
          ))}
        </AnimatePresence>
      </Reorder.Group>
    </div>
  );
}