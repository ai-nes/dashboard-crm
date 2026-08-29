import { stageLabels } from "./data";
import PipelineCard from "./pipeline-card";
import type { PipelineLead, PipelineStage } from "./types";

const stageRibbonClasses: Record<PipelineStage, string> = {
  new: "bg-badge-primary-background text-badge-primary-text after:bg-badge-primary-background",
  engaged: "bg-badge-blue-background text-badge-blue-text after:bg-badge-blue-background",
  qualified: "bg-badge-cyan-background text-badge-cyan-text after:bg-badge-cyan-background",
  counselling: "bg-badge-warning-background text-badge-warning-text after:bg-badge-warning-background",
  application: "bg-badge-orange-background text-badge-orange-text after:bg-badge-orange-background",
  accepted: "bg-badge-success-background text-badge-success-text after:bg-badge-success-background",
  enrolled: "bg-badge-success-background text-badge-success-text after:bg-badge-success-background",
};

interface PipelineColumnProps {
  stage: PipelineStage;
  leads: PipelineLead[];
  selectedId: string | null;
  onSelect: (lead: PipelineLead) => void;
}

export default function PipelineColumn({ stage, leads, selectedId, onSelect }: PipelineColumnProps) {
  const needsAttention = leads.filter((lead) => lead.risk === "critical" || lead.risk === "attention").length;

  return (
    <section className="flex min-h-0 w-full min-w-0 flex-col rounded-lg bg-background-soft-50 p-2.5" aria-label={`${stageLabels[stage]}: ${leads.length} hồ sơ`}>
      <header className="mb-3">
        <div className={`relative mr-3 flex h-7 items-center justify-between px-2.5 text-xs font-medium ${stageRibbonClasses[stage]} after:absolute after:top-0 after:-right-3 after:h-7 after:w-3 after:[clip-path:polygon(0_0,0_100%,100%_50%)] after:content-['']`}>
          <h2 className="text-sm font-semibold">{stageLabels[stage]}</h2>
          <span className="rounded-full bg-card-background/70 px-2 py-0.5 text-xs font-medium tabular-nums">{leads.length}</span>
        </div>
        <p className="border-b border-card-border px-0.5 pt-2 pb-2.5 text-xs text-text-tertiary">{needsAttention ? `${needsAttention} cần chú ý` : "Đang ổn định"}</p>
      </header>
      <div className="space-y-2">
        {leads.map((lead) => <PipelineCard key={lead.id} lead={lead} isSelected={selectedId === lead.id} onSelect={onSelect} />)}
      </div>
    </section>
  );
}
