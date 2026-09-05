"use client";

import { Check, InfoCircle } from "@tailgrids/icons";
import { Button } from "@/components/tailgrids/core/button";
import { useAssignment } from "./assignment-context";
import DetailDrawer from "./detail-drawer";
import { stepMetrics } from "./mappings";

export default function StepDetail() {
  const { selectedStep, selectStep, workflowSteps, setFilter } = useAssignment();
  const step = workflowSteps.find((item) => item.id === selectedStep);
  if (!step) return null;
  return (
    <DetailDrawer
      title={step.title}
      subtitle="CHI TIẾT BƯỚC XỬ LÝ"
      onClose={() => selectStep(null)}
    >
      <p className="text-sm leading-6 text-text-secondary">{step.detail}</p>
      <div className="my-6 rounded-xl border border-card-border bg-background-gray-secondary p-4">
        <p className="text-xs text-text-tertiary">Trong snapshot workspace hiện tại</p>
        <p className="mt-2 text-lg font-semibold text-text-primary">
          {stepMetrics(step)}
        </p>
      </div>
      <h3 className="text-sm font-semibold text-text-primary">Cách xử lý</h3>
      <ul className="mt-3 space-y-3">
        {step.rules.map((rule) => (
          <li
            key={rule}
            className="flex gap-2.5 text-sm leading-6 text-text-secondary"
          >
            <Check
              size={16}
              className="mt-1 shrink-0 text-badge-success-text"
              aria-hidden="true"
            />
            {rule}
          </li>
        ))}
      </ul>
      <p className="mt-6 flex gap-2 rounded-lg bg-badge-sky-background p-3 text-xs leading-5 text-badge-sky-text">
        <InfoCircle size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
        Điều kiện và metrics được lấy từ snapshot workspace hiện tại.
      </p>
      <Button
        appearance="outline"
        className="mt-6 w-full"
        onPress={() => {
          setFilter(
            step.id === "review"
              ? "review"
              : "all",
          );
          selectStep(null);
          requestAnimationFrame(() =>
            document
              .getElementById("assignment-history")
              ?.scrollIntoView({ block: "start" }),
          );
        }}
      >
        Xem danh sách học sinh
      </Button>
    </DetailDrawer>
  );
}
