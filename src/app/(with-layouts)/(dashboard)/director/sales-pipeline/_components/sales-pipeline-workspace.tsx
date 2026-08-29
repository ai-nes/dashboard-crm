"use client";

import { ArrowLeft, ArrowRight, Close, Filter, InfoTriangle, RefreshCircle1Clockwise, Search1 } from "@tailgrids/icons";
import Link from "next/link";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/tailgrids/core/badge";
import { Button } from "@/components/tailgrids/core/button";
import { Card } from "@/components/tailgrids/core/card";
import { Input } from "@/components/tailgrids/core/input";

import { dailyTasks, pipelineLeads, stageLabels } from "./data";
import PipelineColumn from "./pipeline-column";
import TaskQueue from "./task-queue";
import { pipelineStages, type DailyTask, type PipelineLead } from "./types";

export default function SalesPipelineWorkspace() {
  const [selectedLead, setSelectedLead] = useState<PipelineLead | null>(null);
  const [search, setSearch] = useState("");
  const [queueOpen, setQueueOpen] = useState(false);
  const [tasks, setTasks] = useState(dailyTasks);
  const [showAtRisk, setShowAtRisk] = useState(false);
  const [stageWindowStart, setStageWindowStart] = useState(0);

  const visibleLeads = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("vi");
    return pipelineLeads.filter((lead) => (!query || [lead.name, lead.school, lead.owner, lead.major].join(" ").toLocaleLowerCase("vi").includes(query)) && (!showAtRisk || lead.risk === "critical" || lead.risk === "attention"));
  }, [search, showAtRisk]);

  const stagesInView = pipelineStages.slice(stageWindowStart, stageWindowStart + 4);

  const completeTask = (task: DailyTask) => {
    setTasks((current) => current.filter((item) => item.id !== task.id));
    toast.success(`Đã hoàn thành: ${task.title}`);
  };

  const selectTask = (task: DailyTask) => {
    setSelectedLead(pipelineLeads.find((lead) => lead.id === task.leadId) ?? null);
    setQueueOpen(false);
  };

  const moveStageWindow = (direction: -1 | 1) => {
    setStageWindowStart((current) => Math.min(Math.max(current + direction, 0), pipelineStages.length - 4));
  };

  return <main className="min-w-0 space-y-4 px-2 py-4 pb-8 lg:px-6" id="main-content">
    <header className="flex flex-col gap-3 border-b border-card-border pb-3 lg:flex-row lg:items-center lg:justify-between"><div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-2"><h1 className="text-balance text-[26px] leading-8 font-semibold tracking-[-0.4px] text-text-primary">Sales Pipeline</h1><Badge color="primary">{pipelineLeads.length} hồ sơ đang theo dõi</Badge><span className="hidden h-4 w-px bg-card-border lg:block" aria-hidden="true" /><p className="min-w-0 text-sm text-text-secondary">Theo dõi sức khỏe phễu tuyển sinh và đưa đúng hồ sơ vào hành động tiếp theo.</p></div><div className="flex shrink-0 items-center gap-2 self-start lg:self-auto"><Button variant="danger" appearance="outline" size="sm" onPress={() => setQueueOpen(true)}><InfoTriangle size={16} />18 việc cần xử lý</Button><Button appearance="outline" size="sm" onPress={() => toast.message("Pipeline đã được làm mới.")}><RefreshCircle1Clockwise size={16} />Làm mới</Button></div></header>
    <section className="overflow-hidden rounded-xl border border-card-border bg-card-background" aria-label="Pipeline tuyển sinh">
      <div className="flex flex-col gap-3 border-b border-card-border p-3 lg:flex-row lg:items-center lg:justify-between"><div className="flex flex-1 flex-wrap gap-2"><div className="relative min-w-52 flex-1 sm:max-w-sm"><Search1 className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-text-tertiary" size={16} /><Input aria-label="Tìm kiếm hồ sơ trong pipeline" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm học sinh, trường, tư vấn viên…" className="h-9 pl-9" /></div><Button appearance={showAtRisk ? "fill" : "outline"} size="sm" onPress={() => setShowAtRisk((current) => !current)}><Filter size={15} />{showAtRisk ? "Đang lọc rủi ro" : "Cần chú ý"}</Button></div><div className="flex items-center gap-2 text-xs text-text-tertiary"><span className="size-2 rounded-full bg-success-500" aria-hidden="true" />Cập nhật trong 7 ngày qua</div></div>
      <div className="flex items-center justify-between border-b border-card-border bg-background-soft-50 px-3 py-2" aria-label="Điều hướng pipeline"><p className="text-xs text-text-secondary">Hiển thị <strong className="font-semibold text-text-primary">{stageWindowStart + 1}–{stageWindowStart + stagesInView.length}</strong> trong {pipelineStages.length} giai đoạn</p><div className="flex items-center gap-1"><Button appearance="ghost" iconOnly size="xs" onPress={() => moveStageWindow(-1)} isDisabled={stageWindowStart === 0} aria-label="Xem các giai đoạn trước"><ArrowLeft size={15} /></Button><Button appearance="ghost" iconOnly size="xs" onPress={() => moveStageWindow(1)} isDisabled={stageWindowStart >= pipelineStages.length - 4} aria-label="Xem các giai đoạn tiếp theo"><ArrowRight size={15} /></Button></div></div>
      <div className="p-3"><div className="grid grid-cols-1 items-start gap-3 sm:grid-cols-2 xl:grid-cols-4">{stagesInView.map((stage) => <PipelineColumn key={stage} stage={stage} leads={visibleLeads.filter((lead) => lead.stage === stage)} selectedId={selectedLead?.id ?? null} onSelect={setSelectedLead} />)}</div></div>
    </section>
    {selectedLead && <section className="sticky bottom-3 z-20 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2" aria-label="Tóm tắt hồ sơ đã chọn"><Card className="grid gap-4 border-primary-200 p-4 shadow-lg lg:grid-cols-[minmax(0,1fr)_auto]"><div className="flex min-w-0 items-start gap-3"><span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-badge-primary-background text-sm font-semibold text-badge-primary-text">{selectedLead.initials}</span><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h2 className="truncate text-base font-semibold text-text-primary">{selectedLead.name}</h2><Badge color="primary">{stageLabels[selectedLead.stage]}</Badge></div><p className="mt-1 truncate text-xs text-text-secondary">{selectedLead.school} · {selectedLead.region} · {selectedLead.major}</p><div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-text-tertiary"><span>Điểm phù hợp: <strong className="text-text-primary">{selectedLead.score}</strong></span><span>Xác suất nhập học: <strong className="text-success-500">{selectedLead.probability}%</strong></span><span>Chủ sở hữu: <strong className="text-text-primary">{selectedLead.owner}</strong></span></div><p className="mt-3 text-sm text-text-secondary"><strong className="font-medium text-text-primary">Hành động tiếp theo: </strong>{selectedLead.nextAction}</p></div></div><div className="flex items-center gap-2 self-end lg:self-center"><Link href={`/director/students/${selectedLead.id}`} className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-button-primary-background px-3 text-sm font-medium text-button-primary-text transition hover:bg-button-primary-hover-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500">Mở hồ sơ <ArrowRight size={15} /></Link><Button appearance="ghost" iconOnly size="sm" onPress={() => setSelectedLead(null)} aria-label="Đóng tóm tắt hồ sơ"><Close size={17} /></Button></div></Card></section>}
    {queueOpen && <TaskQueue tasks={tasks} onClose={() => setQueueOpen(false)} onComplete={completeTask} onSelectTask={selectTask} />}
  </main>;
}
