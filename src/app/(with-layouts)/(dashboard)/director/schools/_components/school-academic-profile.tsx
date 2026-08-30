import { Badge } from "@/components/tailgrids/core/badge";
import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import type { SchoolIntelligenceData } from "@/services/api/schools/types";

interface SchoolAcademicProfileProps {
  data: SchoolIntelligenceData;
}

interface Recommendation {
  badge: string;
  title: string;
  reason: string;
  majors: string[];
}

export default function SchoolAcademicProfile({ data }: SchoolAcademicProfileProps) {
  const { subjectMix } = data;
  const otherShare = Math.max(0, 100 - subjectMix.naturalScienceShare - subjectMix.socialScienceShare);
  const recommendation = getRecommendation(subjectMix.naturalScienceShare, subjectMix.socialScienceShare);
  const groups = [
    { label: "Khoa học tự nhiên", value: subjectMix.naturalScienceShare, color: "bg-primary-500" },
    { label: "Khoa học xã hội", value: subjectMix.socialScienceShare, color: "bg-warning-500" },
    { label: "Khác / chưa chọn", value: otherShare, color: "bg-text-tertiary" },
  ];

  return (
    <Card className="min-w-0 p-5 lg:p-6">
      <CardHeader className="mb-5 items-center">
        <div className="min-w-0">
          <CardTitle>Học sinh chọn nhóm môn nào?</CardTitle>
          <p className="mt-1 text-xs text-text-tertiary">Từ tỷ lệ chọn môn, xác định ngành nên giới thiệu</p>
        </div>
        <Badge color="primary">{recommendation.badge}</Badge>
      </CardHeader>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="min-w-0">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-text-primary">Tỷ lệ chọn nhóm môn</p>
            <span className="text-xs text-text-tertiary">Khối 12</span>
          </div>

          <div className="mt-4 flex h-4 overflow-hidden rounded-full bg-background-soft-100" aria-label="Tỷ lệ chọn nhóm môn của học sinh khối 12">
            {groups.map((group) => <div key={group.label} className={`h-full ${group.color}`} style={{ width: `${group.value}%` }} />)}
          </div>

          <div className="mt-5 grid gap-4">
            {groups.map((group) => <SubjectShare key={group.label} {...group} />)}
          </div>
        </div>

        <div className="min-w-0 lg:border-l lg:border-card-border lg:pl-6">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-text-primary">Nên tư vấn gì?</p>
            <span className="text-xs text-text-tertiary">Từ dữ liệu bên trái</span>
          </div>

          <div className="mt-4 rounded-2xl border border-primary-200 bg-badge-primary-background p-4">
            <p className="text-lg font-semibold leading-6 text-text-primary">{recommendation.title}</p>
            <p className="mt-2 text-sm leading-5 text-text-secondary">{recommendation.reason}</p>
          </div>

          <p className="mt-5 text-xs text-text-tertiary">Nhóm ngành nên giới thiệu</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {recommendation.majors.map((major) => <span key={major} className="rounded-lg border border-card-border bg-background-soft-50 px-3 py-2 text-sm font-medium text-text-primary">{major}</span>)}
          </div>
        </div>
      </div>
    </Card>
  );
}

function SubjectShare({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="min-w-0">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className={`size-2.5 shrink-0 rounded-full ${color}`} aria-hidden="true" />
          <p className="truncate text-sm text-text-secondary">{label}</p>
        </div>
        <strong className="shrink-0 text-base font-semibold text-text-primary">{value}%</strong>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-background-soft-100" aria-hidden="true">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function getRecommendation(naturalScienceShare: number, socialScienceShare: number): Recommendation {
  if (naturalScienceShare >= socialScienceShare + 8) {
    return {
      badge: "Ưu tiên nhóm tự nhiên",
      title: "Ưu tiên Công nghệ & kỹ thuật",
      reason: `Khoa học tự nhiên chiếm ${naturalScienceShare}%, cao hơn các nhóm còn lại.`,
      majors: ["Công nghệ", "Kỹ thuật", "Khoa học"],
    };
  }

  if (socialScienceShare >= naturalScienceShare + 8) {
    return {
      badge: "Ưu tiên nhóm xã hội",
      title: "Ưu tiên Kinh doanh & ngôn ngữ",
      reason: `Khoa học xã hội chiếm ${socialScienceShare}%, cao hơn các nhóm còn lại.`,
      majors: ["Kinh doanh", "Truyền thông", "Ngôn ngữ"],
    };
  }

  return {
    badge: "Tư vấn 2 nhóm",
    title: "Mở cả Công nghệ và Kinh doanh",
    reason: `Khoa học tự nhiên ${naturalScienceShare}% · Khoa học xã hội ${socialScienceShare}% — tỷ lệ khá cân bằng.`,
    majors: ["Công nghệ", "Kỹ thuật", "Kinh doanh", "Ngôn ngữ"],
  };
}
