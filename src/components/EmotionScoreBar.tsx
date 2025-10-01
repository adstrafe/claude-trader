import { useEffect, useState } from "react";
import { emotionDetector } from "@/lib/emotionDetection";
import { cn } from "@/lib/utils";

export function EmotionScoreBar() {
  const [score, setScore] = useState(emotionDetector.getScore());
  const [level, setLevel] = useState(emotionDetector.getEmotionLevel());

  useEffect(() => {
    const interval = setInterval(() => {
      setScore(emotionDetector.getScore());
      setLevel(emotionDetector.getEmotionLevel());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const getBarColor = () => {
    const colors = {
      excellent: 'bg-[hsl(var(--emotion-excellent))]',
      good: 'bg-[hsl(var(--emotion-good))]',
      neutral: 'bg-[hsl(var(--emotion-neutral))]',
      risky: 'bg-[hsl(var(--emotion-risky))]',
      danger: 'bg-[hsl(var(--emotion-danger))]'
    };
    return colors[level];
  };

  const getLabel = () => {
    const labels = {
      excellent: 'Excellent',
      good: 'Good',
      neutral: 'Neutral',
      risky: 'Caution',
      danger: 'High Risk'
    };
    return labels[level];
  };

  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-card/50 rounded-lg border">
      <span className="text-xs text-muted-foreground whitespace-nowrap">
        Emotional State:
      </span>
      <div className="flex-1 min-w-[100px] max-w-[200px] h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={cn(
            "h-full transition-all duration-500 rounded-full",
            getBarColor(),
            level === 'danger' && "animate-pulse"
          )}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className={cn(
        "text-xs font-medium tabular-nums",
        score >= 80 && "text-[hsl(var(--emotion-excellent))]",
        score >= 50 && score < 80 && "text-[hsl(var(--emotion-neutral))]",
        score < 50 && "text-[hsl(var(--emotion-danger))]"
      )}>
        {getLabel()} {Math.round(score)}/100
      </span>
    </div>
  );
}
