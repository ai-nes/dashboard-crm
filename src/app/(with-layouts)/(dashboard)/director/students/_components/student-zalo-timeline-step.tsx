import { FileText } from "@tailgrids/icons";
import type { ReactNode } from "react";

export default function StudentZaloTimelineStep({
  children,
  isManual = false,
}: {
  children: ReactNode;
  isManual?: boolean;
}) {
  return (
    <li className="relative">
      <span
        className="absolute -left-[2.05rem] top-0 flex size-7 items-center justify-center rounded-full border-2 border-card-background bg-card-background text-badge-sky-text shadow-sm"
        aria-hidden="true"
      >
        {isManual ? (
          <FileText size={16} />
        ) : (
          <span className="size-2.5 rounded-full bg-badge-sky-text" />
        )}
      </span>
      {children}
    </li>
  );
}
