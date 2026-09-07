export type LeadStatus =
  | "Mới"
  | "Đang liên hệ"
  | "Cần bổ sung thông tin"
  | "Không tiềm năng"
  | "Đã chuyển đổi";

export interface LeadListItem {
  id: string;
  initials: string;
  name: string;
  phone: string;
  school: string;
  status: LeadStatus;
  source: string;
  owner: string;
}

export type ConversionPotential = "Cao" | "Trung bình" | "Thấp";

export type FptAspiration =
  | "Nguyện vọng 1"
  | "Nguyện vọng 2"
  | "Dự phòng"
  | "Chưa xác định";

export interface LeadDetail extends LeadListItem {
  email: string;
  secondaryEmail: string;
  province: string;
  interestedMajor: string;
  adChannel: string;
  segments: string[];
  enrollmentYear: number;
  conversionPotential: ConversionPotential;
  branch: string;
  tags: string[];
  fptAspiration: FptAspiration;
  eventsParticipated: string[];
  description: string;
}

export type LeadLogEntryType = "note" | "activity";

export interface LeadLogEntry {
  id: string;
  type: LeadLogEntryType;
  title: string;
  author: string;
  date: string;
  content: string;
}
