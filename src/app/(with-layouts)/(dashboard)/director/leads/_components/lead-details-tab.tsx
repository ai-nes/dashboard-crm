import { Book4, Layers2, User2 } from "@tailgrids/icons";
import { Badge } from "@/components/tailgrids/core/badge";
import LeadDetailSection from "./lead-detail-section";
import { LeadDetailField as Field, LeadDetailTags } from "./lead-detail-field";
import { conversionPotentialColor, leadStatusColor } from "./mappings";
import type { LeadDetail } from "./types";

export default function LeadDetailsTab({ lead }: { lead: LeadDetail }) {
  return (
    <div className="grid min-w-0 gap-4 lg:grid-cols-2">
      <LeadDetailSection
        title="Thông tin liên hệ"
        description="Thông tin cá nhân và liên lạc của lead"
        icon={<User2 size={18} />}
      >
        <dl className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
          <Field label="Họ và tên" value={lead.name} />
          <Field label="Di động" value={lead.phone} />
          <Field label="Email" value={lead.email} className="sm:col-span-2" />
          <Field
            label="Email khác"
            value={lead.secondaryEmail}
            className="sm:col-span-2"
          />
          <Field label="Tỉnh / Thành phố" value={lead.province} />
          <Field label="Trường THPT" value={lead.school} />
        </dl>
      </LeadDetailSection>
      <LeadDetailSection
        title="Thông tin tuyển sinh"
        description="Nhu cầu học tập và tiến độ tư vấn"
        icon={<Book4 size={18} />}
      >
        <dl className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
          <Field label="Ngành quan tâm" value={lead.interestedMajor} />
          <Field label="Nguyện vọng vào FPT" value={lead.fptAspiration} />
          <Field
            label="Tình trạng lead"
            value={
              lead.status && (
                <Badge size="sm" color={leadStatusColor[lead.status]}>
                  {lead.status}
                </Badge>
              )
            }
          />
          <Field
            label="Khả năng chuyển đổi"
            value={
              lead.conversionPotential && (
                <Badge
                  size="sm"
                  color={conversionPotentialColor[lead.conversionPotential]}
                >
                  {lead.conversionPotential}
                </Badge>
              )
            }
          />
          <Field
            label="Năm tuyển sinh"
            value={
              lead.enrollmentYear ? String(lead.enrollmentYear) : undefined
            }
          />
          <Field label="Chi nhánh" value={lead.branch} />
          <Field
            label="Người phụ trách"
            value={lead.owner}
            className="sm:col-span-2"
          />
        </dl>
      </LeadDetailSection>
      <LeadDetailSection
        title="Nguồn & phân loại"
        description="Nguồn tiếp cận, nhóm lead và các hoạt động đã tham gia"
        icon={<Layers2 size={18} />}
        className="lg:col-span-2"
      >
        <dl className="grid gap-x-6 gap-y-5 sm:grid-cols-2 xl:grid-cols-3">
          <Field label="Nguồn lead" value={lead.source} />
          <Field label="Kênh quảng cáo" value={lead.adChannel} />
          <LeadDetailTags
            label="Sự kiện tham gia"
            values={lead.eventsParticipated}
            className="xl:row-span-2"
          />
          <LeadDetailTags label="Phân khúc" values={lead.segments} />
          <LeadDetailTags label="Thẻ gắn" values={lead.tags} />
        </dl>
      </LeadDetailSection>
    </div>
  );
}
