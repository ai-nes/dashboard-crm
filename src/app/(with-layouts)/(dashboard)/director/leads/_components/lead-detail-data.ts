import { leads } from "./data";
import type {
  ConversionPotential,
  FptAspiration,
  LeadDetail,
  LeadLogEntry,
} from "./types";

const provinces = ["Hà Nội", "TP. Hồ Chí Minh", "Hải Phòng", "Đà Nẵng", "Cần Thơ", "Huế"];
const adChannels = ["Facebook Ads", "Google Ads", "TikTok Ads", "Zalo Ads", "Không xác định"];
const segmentPool = ["Học lực khá giỏi", "Gia đình có điều kiện", "Quan tâm học bổng", "Đã từng liên hệ trước đó"];
const tagPool = ["khu_vuc_1", "khu_vuc_2", "chien_dich_he_2026", "uu_tien_cao"];
const eventPool = ["Ngày hội tư vấn tuyển sinh 2026", "Workshop hướng nghiệp FPT", "Livestream tư vấn tuyển sinh"];
const conversionPotentials: ConversionPotential[] = ["Cao", "Trung bình", "Thấp"];
const fptAspirations: FptAspiration[] = ["Nguyện vọng 1", "Nguyện vọng 2", "Dự phòng", "Chưa xác định"];
const majors = ["Công nghệ thông tin", "Quản trị kinh doanh", "Ngôn ngữ Anh", "Marketing", "Thiết kế đồ họa"];
const branches = ["TP. Hồ Chí Minh"];

function pick<T>(pool: T[], index: number, offset = 0): T {
  return pool[(index + offset) % pool.length];
}

function pickMany<T>(pool: T[], index: number, count: number): T[] {
  return Array.from({ length: count }, (_, i) => pick(pool, index, i));
}

function emailOf(name: string, index: number): string {
  const ascii = name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/gi, "d")
    .toLowerCase()
    .split(/\s+/)
    .join(".");
  return `${ascii}${index + 1}@example.com`;
}

function getLeadDetail(id: string): LeadDetail | undefined {
  const index = leads.findIndex((lead) => lead.id === id);
  if (index === -1) return undefined;
  const lead = leads[index];

  return {
    ...lead,
    email: emailOf(lead.name, index),
    secondaryEmail: index % 3 === 0 ? "" : emailOf(`${lead.name} phu huynh`, index),
    province: pick(provinces, index),
    interestedMajor: pick(majors, index),
    adChannel: pick(adChannels, index),
    segments: pickMany(segmentPool, index, (index % 2) + 1),
    enrollmentYear: 2026,
    conversionPotential: pick(conversionPotentials, index),
    branch: branches[0],
    tags: pickMany(tagPool, index, (index % 2) + 1),
    fptAspiration: pick(fptAspirations, index),
    eventsParticipated: index % 4 === 3 ? [] : pickMany(eventPool, index, (index % 2) + 1),
    description: `Lead quan tâm ngành ${pick(majors, index)}, tiếp cận qua ${lead.source.toLowerCase()}. Cần theo dõi thêm để xác nhận nhu cầu tuyển sinh.`,
  };
}

function getLeadLog(id: string): LeadLogEntry[] {
  const index = leads.findIndex((lead) => lead.id === id);
  if (index === -1) return [];
  const lead = leads[index];

  const baseDay = 10 + (index % 15);
  const entries: LeadLogEntry[] = [
    {
      id: `${id}-log-1`,
      type: "activity",
      title: "Lead được tạo tự động",
      author: "Hệ thống",
      date: `2026-09-${String(baseDay).padStart(2, "0")}T08:30:00+07:00`,
      content: `Lead được tiếp nhận từ nguồn ${lead.source}.`,
    },
    {
      id: `${id}-log-2`,
      type: "activity",
      title: "Cập nhật tình trạng lead",
      author: lead.owner === "Chưa phân công" ? "Hệ thống" : lead.owner,
      date: `2026-09-${String(baseDay + 1).padStart(2, "0")}T10:15:00+07:00`,
      content: `Tình trạng lead được cập nhật thành "${lead.status}".`,
    },
  ];

  if (lead.owner !== "Chưa phân công") {
    entries.push({
      id: `${id}-log-3`,
      type: "note",
      title: "Ghi chú chăm sóc",
      author: lead.owner,
      date: `2026-09-${String(baseDay + 2).padStart(2, "0")}T14:45:00+07:00`,
      content: "Đã liên hệ qua điện thoại, phụ huynh quan tâm học phí và ký túc xá. Hẹn gọi lại tuần sau.",
    });
  }

  return entries;
}

export { getLeadDetail, getLeadLog };
