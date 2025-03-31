import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cva } from "class-variance-authority";

const statusIndicatorVariants = cva(
  "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium",
  {
    variants: {
      variant: {
        default: "bg-neutral-100 text-neutral-600",
        success: "bg-green-100 text-green-800",
        warning: "bg-yellow-100 text-yellow-800",
        danger: "bg-red-100 text-red-800",
        info: "bg-blue-100 text-blue-800",
      }
    },
    defaultVariants: {
      variant: "default",
    }
  }
);

type StatusCardProps = {
  title: string;
  value: string | number;
  icon?: ReactNode;
  trend?: {
    label: string;
    direction: "up" | "down" | "stable";
    value?: string;
  };
  footer?: ReactNode;
  progress?: number;
  progressColor?: string;
  progressLabel?: string;
  variant?: "default" | "success" | "warning" | "danger" | "info";
};

export function StatusCard({
  title,
  value,
  icon,
  trend,
  footer,
  progress,
  progressColor = "bg-success-500",
  progressLabel,
  variant = "default",
}: StatusCardProps) {
  
  // Determine the trend icon
  const trendIcon = trend ? (
    trend.direction === "up" ? (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
      </svg>
    ) : trend.direction === "down" ? (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
      </svg>
    ) : (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
      </svg>
    )
  ) : null;
  
  return (
    <Card className="border border-neutral-100 shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-neutral-500">{title}</h3>
          {trend && (
            <span className={statusIndicatorVariants({ variant })}>
              {trendIcon}
              {trend.label}
              {trend.value && <span className="ml-1">{trend.value}</span>}
            </span>
          )}
        </div>
        <div className="mt-2 flex items-baseline">
          {icon ? (
            <div className="mr-2">{icon}</div>
          ) : null}
          <p className="text-3xl font-semibold text-neutral-900">{value}</p>
        </div>
        {progress !== undefined && (
          <div className="mt-4">
            <Progress value={progress} className="h-2 bg-neutral-100" indicatorClassName={progressColor} />
            {progressLabel && (
              <div className="mt-2 text-xs text-neutral-500">
                {progressLabel}
              </div>
            )}
          </div>
        )}
        {footer && (
          <div className="mt-4">
            {footer}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
