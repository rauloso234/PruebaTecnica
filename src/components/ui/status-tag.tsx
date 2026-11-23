import { opportunityStatusLabel, type OpportunityStatus } from "@/lib/domain/models";
import { cn } from "@/lib/utils";

export const stageColors: Record<OpportunityStatus, string> = {
  new: "bg-slate-100 text-slate-700",
  qualified: "bg-cyan-100 text-cyan-900",
  proposal: "bg-blue-100 text-blue-900",
  won: "bg-teal-100 text-teal-900",
  lost: "bg-rose-100 text-rose-900",
};

export function StatusTag({ status }: { status: OpportunityStatus }) {
  return <span className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-semibold", stageColors[status])}>{opportunityStatusLabel[status]}</span>;
}
