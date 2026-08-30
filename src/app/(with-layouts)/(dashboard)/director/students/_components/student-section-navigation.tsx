"use client";

import { Link } from "react-aria-components";

const sections = [
  { id: "decision", label: "Quyết định" },
  { id: "context", label: "Chân dung & nguồn" },
  { id: "behavior", label: "Hành vi & hành trình" },
  { id: "family", label: "Gia đình & rào cản" },
  { id: "records", label: "Hồ sơ & lịch sử" },
];

export default function StudentSectionNavigation() {
  return (
    <nav aria-label="Điều hướng nội dung hồ sơ học sinh" className="sticky top-0 z-20 mt-5 border-y border-card-border bg-card-background/95 px-2 py-2 backdrop-blur lg:mx-6 lg:rounded-xl lg:border lg:px-3">
      <div className="flex min-w-max items-center gap-1">
        <span className="mr-2 hidden text-[10px] font-semibold tracking-[0.14em] text-text-tertiary uppercase md:inline">Đi đến</span>
        {sections.map((section) => (
          <Link
            key={section.id}
            href={`#student-${section.id}`}
            className="inline-flex h-8 items-center gap-2 rounded-lg px-3 text-xs font-medium text-text-secondary outline-none transition data-[hovered]:bg-background-soft-100 data-[hovered]:text-text-primary data-[focus-visible]:ring-4 data-[focus-visible]:ring-button-outline-focus-ring"
          >
            {section.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
