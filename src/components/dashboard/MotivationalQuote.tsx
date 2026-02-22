import { useState, useEffect } from "react";
import { Sparkles } from "lucide-react";

const quotes = [
  "The secret of getting ahead is getting started.",
  "Small daily improvements lead to stunning results.",
  "Don't watch the clock; do what it does — keep going.",
  "Success is the sum of small efforts repeated daily.",
  "The beautiful thing about learning is that nobody can take it away from you.",
  "Push yourself, because no one else is going to do it for you.",
  "Study hard, for the well is deep, and our brains are shallow.",
];

export default function MotivationalQuote() {
  const [quote, setQuote] = useState(quotes[0]);

  useEffect(() => {
    setQuote(quotes[Math.floor(Math.random() * quotes.length)]);
  }, []);

  return (
    <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground max-w-sm truncate">
      <Sparkles size={12} className="text-primary shrink-0" />
      <span className="italic truncate">"{quote}"</span>
    </div>
  );
}
