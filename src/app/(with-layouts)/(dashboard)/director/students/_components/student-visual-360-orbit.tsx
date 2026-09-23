"use client";

import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/tailgrids/core/avatar";
import { Button } from "@/components/tailgrids/core/button";
import type { Student360Data } from "@/services/api/students/types";
import { cn } from "@/utils/cn";
import { studentStatusLabel } from "./student-status";
import {
  getVisual360Sector,
  getVisual360Rotation,
} from "./student-visual-360-geometry";
import {
  visual360Sections,
  type Visual360SectionId,
} from "./student-visual-360-sections";

interface StudentVisual360OrbitProps {
  student: Student360Data["student"];
  selected: Visual360SectionId;
  onSelect: (section: Visual360SectionId) => void;
  panelId: string;
}

export default function StudentVisual360Orbit({
  student,
  selected,
  onSelect,
  panelId,
}: StudentVisual360OrbitProps) {
  const selectedIndex = visual360Sections.findIndex(
    (section) => section.id === selected,
  );
  const [dial, setDial] = useState({ selected, rotation: -selectedIndex * 72 });
  if (dial.selected !== selected) {
    setDial({
      selected,
      rotation: getVisual360Rotation(dial.rotation, selectedIndex),
    });
  }
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[420px]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-full border border-card-border bg-card-background"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-[24%] z-10 rounded-full border-2 border-card-background bg-card-background"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-1/2 z-10 h-3 w-1 -translate-x-1/2 rounded-full bg-primary-500"
      />
      <div
        style={{ transform: `rotate(${dial.rotation}deg)` }}
        className="absolute inset-0 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none"
      >
        <svg
          viewBox="0 0 100 100"
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 size-full overflow-visible"
        >
          {visual360Sections.map((section, index) => (
            <path
              key={section.id}
              d={getVisual360Sector(index).path}
              className={cn(
                "stroke-card-background stroke-[0.4] transition-colors duration-200 motion-reduce:transition-none",
                selected === section.id
                  ? "fill-badge-primary-background"
                  : "fill-background-soft-100",
              )}
            />
          ))}
        </svg>
        <div role="group" aria-label="Các góc nhìn hồ sơ học sinh">
          {visual360Sections.map((section, index) => {
            const Icon = section.icon;
            const active = selected === section.id;
            const sector = getVisual360Sector(index);
            return (
              <Button
                key={section.id}
                appearance="ghost"
                size="sm"
                aria-label={section.label}
                aria-pressed={active}
                aria-controls={panelId}
                onPress={() => onSelect(section.id)}
                style={{ clipPath: sector.clipPath }}
                className="group absolute inset-0 size-full rounded-none border-0 bg-transparent p-0 text-text-primary outline-none transition-colors duration-200 hover:bg-foreground-soft-200/20 focus:bg-foreground-soft-200/30 focus:ring-0 data-[focused=true]:ring-0 motion-reduce:transition-none"
              >
                <span
                  style={{
                    left: `${sector.label[0]}%`,
                    top: `${sector.label[1]}%`,
                  }}
                  className="absolute w-[24%] -translate-x-1/2 -translate-y-1/2"
                >
                  <span
                    style={{ transform: `rotate(${-dial.rotation}deg)` }}
                    className="flex flex-col items-center gap-1 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none sm:gap-2"
                  >
                    <span
                      className={cn(
                        "flex size-7 shrink-0 items-center justify-center rounded-full group-data-[focus-visible=true]:outline-2 group-data-[focus-visible=true]:outline-offset-2 group-data-[focus-visible=true]:outline-text-primary sm:size-8",
                        active
                          ? "bg-primary-500 text-white-100"
                          : "text-text-secondary",
                      )}
                    >
                      <Icon className="size-4 sm:size-5" aria-hidden="true" />
                    </span>
                    <span className="text-[10px] leading-tight font-semibold sm:text-xs sm:leading-4">
                      {section.label}
                    </span>
                    <span
                      className={cn(
                        "h-1 w-1 rounded-full bg-primary-500",
                        active ? "visible" : "invisible",
                      )}
                    ></span>
                  </span>
                </span>
              </Button>
            );
          })}
        </div>
      </div>
      <div className="pointer-events-none absolute left-1/2 top-1/2 z-10 flex w-[43%] -translate-x-1/2 -translate-y-1/2 flex-col items-center text-center">
        <Avatar size="xxl" className="mb-2 size-12 sm:mb-3 sm:size-14">
          <AvatarFallback className="bg-badge-primary-background text-xl text-badge-primary-text sm:text-xl">
            {student.initials || "HS"}
          </AvatarFallback>
        </Avatar>
        <p className="line-clamp-2 max-w-full break-words text-xs font-semibold text-text-primary sm:text-sm">
          {student.name || "Học sinh"}
        </p>
        <p className="mt-1 text-[10px] text-text-secondary sm:text-xs">
          {student.studentStage
            ? studentStatusLabel[student.studentStage]
            : "Chưa có giai đoạn"}
        </p>
      </div>
    </div>
  );
}
