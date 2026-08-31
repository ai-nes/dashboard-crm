import type { SlaMetric, SlaRiskCase, SlaRiskReason, SlaStatusBucket } from "./types";

export const slaMetrics: SlaMetric[] = [
  { label: "Đã quá hạn", value: "125", detail: "Cần xử lý trước tiên", tone: "error" },
  { label: "Sắp đến hạn", value: "312", detail: "Còn dưới 60 phút", tone: "warning" },
  { label: "Phản hồi trung vị", value: "4 giờ 18 phút", detail: "Mục tiêu: dưới 4 giờ", tone: "warning" },
  { label: "Đúng hạn", value: "86,2%", detail: "Tăng 3,4 điểm trong tuần", tone: "success" },
];

export const slaStatusBuckets: SlaStatusBucket[] = [
  { label: "Còn trong hạn", value: "8.420", share: "95,1%", shareValue: 95.1, detail: "Có thể xử lý theo lịch hiện tại", tone: "success" },
  { label: "Sắp đến hạn", value: "312", share: "3,5%", shareValue: 3.5, detail: "Còn dưới 60 phút trước mốc phản hồi", tone: "warning" },
  { label: "Đã quá hạn", value: "125", share: "1,4%", shareValue: 1.4, detail: "Cần điều phối ngay", tone: "error" },
];

export const slaRiskCases: SlaRiskCase[] = [
  { name: "Nguyễn T. Hà", school: "THPT Bùi Hữu Nghĩa", probability: 68, silentFor: "23 ngày", owner: "Nguyễn T. Hà", priority: "Cao" },
  { name: "Đặng V. F.", school: "THPT Châu Văn Liêm", probability: 63, silentFor: "14 ngày", owner: "Chưa phân công", priority: "Cao" },
  { name: "Bùi H. M.", school: "THPT Nguyễn Việt Hồng", probability: 61, silentFor: "11 ngày", owner: "Trần Q. Bảo", priority: "Theo dõi" },
  { name: "Lý K. T.", school: "THPT Thới Lai", probability: 58, silentFor: "9 ngày", owner: "Lê V. Cường", priority: "Theo dõi" },
];

export const slaRiskReasons: SlaRiskReason[] = [
  { label: "Thiếu người phụ trách", percentage: 48, detail: "Tập trung ở đội có tải cao" },
  { label: "Chưa có bước tiếp theo", percentage: 31, detail: "Đã liên hệ nhưng chưa ghi nhận kết quả" },
  { label: "Dữ liệu thiếu hoặc trễ", percentage: 21, detail: "Nguồn chưa đồng bộ xong" },
];
