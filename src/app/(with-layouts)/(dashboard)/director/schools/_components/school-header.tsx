import { ArrowLeft, MapMarker5 } from "@tailgrids/icons";
import Link from "next/link";

import { Badge } from "@/components/tailgrids/core/badge";
import type {
  SchoolClassification,
  SchoolIntelligenceData,
} from "@/services/api/schools/types";

import SchoolDecisionBrief from "./school-decision-brief";

interface SchoolHeaderProps {
  data: SchoolIntelligenceData;
}

const classificationLabel: Record<SchoolClassification, string> = {
  "Trọng điểm": "Ưu tiên cao",
  "Mở rộng": "Cần mở quan hệ",
  "Duy trì": "Duy trì đều",
  "Sàng lọc": "Theo dõi",
};

export default function SchoolHeader({ data }: SchoolHeaderProps) {
  const { school, classification, geography } = data;

  return (
    <header className="min-w-0">
      <Link
        href="/director/market-intelligence"
        className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-text-secondary transition hover:text-text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-button-primary-focus-ring"
      >
        <ArrowLeft size={16} />
        Quay lại bản đồ địa bàn
      </Link>

      <div className="min-w-0 overflow-hidden rounded-2xl border border-card-border bg-card-background">
        <div className="min-w-0 p-5 lg:p-6">
          <div className="flex min-w-0 items-start gap-4">
            <div
              className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-badge-primary-background text-lg font-semibold text-badge-primary-text"
              aria-hidden="true"
            >
              {school.name
                .replace(/^THPT\s+/i, "")
                .slice(0, 2)
                .toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <Badge
                  color={
                    classification.group === "Trọng điểm"
                      ? "success"
                      : classification.group === "Mở rộng"
                        ? "primary"
                        : classification.group === "Duy trì"
                          ? "warning"
                          : "gray"
                  }
                >
                  {classificationLabel[classification.group]}
                </Badge>
                {classification.isKeyAccount && (
                  <Badge color="success">Trường trọng điểm</Badge>
                )}
                {school.isBoardingSchool && (
                  <Badge color="violet">Trường DTNT</Badge>
                )}
                <span className="text-xs text-text-tertiary">
                  Mã {school.schoolCode}
                </span>
              </div>
              <h1 className="text-balance text-2xl font-semibold tracking-[-0.4px] text-text-primary lg:text-[30px] lg:leading-9">
                {school.name}
              </h1>
              <p className="mt-2 flex items-start gap-1.5 text-sm leading-5 text-text-secondary">
                <MapMarker5
                  size={16}
                  className="mt-0.5 shrink-0 text-icon-tertiary"
                />
                <span>
                  {school.district}, {school.province} · {geography.cluster}
                </span>
              </p>
              <p className="mt-1 text-xs leading-5 text-text-tertiary">
                {school.address}
              </p>
            </div>
          </div>

          <div className="mt-5">
            <SchoolDecisionBrief data={data} />
          </div>
        </div>
      </div>
    </header>
  );
}
