import { cn } from "@/lib/utils";

interface RiskGaugeProps {
  score: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

export const RiskGauge = ({ score, size = "md", showLabel = true }: RiskGaugeProps) => {
  const getRiskLevel = () => {
    if (score < 30) return { label: "Low", color: "success" };
    if (score < 50) return { label: "Medium", color: "warning" };
    if (score < 70) return { label: "High", color: "danger" };
    return { label: "Very High", color: "danger" };
  };

  const risk = getRiskLevel();
  
  const sizeClasses = {
    sm: "h-2 text-xs",
    md: "h-3 text-sm",
    lg: "h-4 text-base",
  };

  return (
    <div className="space-y-1">
      {showLabel && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Risk Score</span>
          <span className={cn("font-semibold", `text-${risk.color}`)}>
            {score}/100 - {risk.label}
          </span>
        </div>
      )}
      <div className={cn("w-full rounded-full bg-muted overflow-hidden", sizeClasses[size])}>
        <div
          className={cn(
            "h-full transition-all duration-300",
            score < 30 && "bg-success",
            score >= 30 && score < 50 && "bg-warning",
            score >= 50 && "bg-danger"
          )}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
};
