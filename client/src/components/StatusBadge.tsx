import { cn } from "@/lib/utils";
import { REPORT_STATUS } from "@shared/schema";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const styles = {
    [REPORT_STATUS.DRAFT]: "bg-slate-100 text-slate-700 border-slate-200",
    [REPORT_STATUS.SUBMITTED]: "bg-blue-50 text-blue-700 border-blue-200",
    [REPORT_STATUS.REVIEWED]: "bg-emerald-50 text-emerald-700 border-emerald-200",
    [REPORT_STATUS.ACTION_REQUIRED]: "bg-orange-50 text-orange-700 border-orange-200",
  };

  const labels = {
    [REPORT_STATUS.DRAFT]: "Draft",
    [REPORT_STATUS.SUBMITTED]: "Submitted",
    [REPORT_STATUS.REVIEWED]: "Reviewed",
    [REPORT_STATUS.ACTION_REQUIRED]: "Action Required",
  };

  const style = styles[status as keyof typeof styles] || styles[REPORT_STATUS.DRAFT];
  const label = labels[status as keyof typeof labels] || status;

  return (
    <span className={cn(
      "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
      style,
      className
    )}>
      {label}
    </span>
  );
}
