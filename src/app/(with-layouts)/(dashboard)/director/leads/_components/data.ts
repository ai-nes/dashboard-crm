import type { LeadListItem } from "./types";

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return parts
    .slice(-2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

const rows: Array<Omit<LeadListItem, "id" | "initials">> = [
  { name: "Nguyễn Thị Ngọc Anh", phone: "0912 345 671", school: "THPT Chu Văn An", status: "Đã chuyển đổi", source: "Website", owner: "Trần Văn Long" },
  { name: "Phạm Minh Khôi", phone: "0912 345 672", school: "THPT Nguyễn Thị Minh Khai", status: "Đang liên hệ", source: "Fanpage Facebook", owner: "Lê Thị Hương" },
  { name: "Trần Bảo Trân", phone: "0912 345 673", school: "THPT Phan Châu Trinh", status: "Mới", source: "Zalo OA", owner: "Chưa phân công" },
  { name: "Lê Hoàng Phúc", phone: "0912 345 674", school: "THPT Châu Văn Liêm", status: "Cần bổ sung thông tin", source: "Giới thiệu", owner: "Chưa phân công" },
  { name: "Vũ Thị Thu Hà", phone: "0912 345 675", school: "THPT Lê Hồng Phong", status: "Đang liên hệ", source: "Sự kiện trường", owner: "Phạm Đức Anh" },
  { name: "Đặng Gia Bảo", phone: "0912 345 676", school: "THPT Hạ Long", status: "Không tiềm năng", source: "Website", owner: "Trần Văn Long" },
  { name: "Hoàng Yến Nhi", phone: "0912 345 677", school: "THPT Việt Đức", status: "Mới", source: "Fanpage Facebook", owner: "Chưa phân công" },
  { name: "Bùi Anh Tuấn", phone: "0912 345 678", school: "THPT Lê Quý Đôn", status: "Đã chuyển đổi", source: "Zalo OA", owner: "Lê Thị Hương" },
  { name: "Ngô Thảo Vy", phone: "0912 345 679", school: "THPT Trần Phú", status: "Đang liên hệ", source: "Website", owner: "Phạm Đức Anh" },
  { name: "Đỗ Minh Quân", phone: "0912 345 680", school: "THPT An Giang", status: "Mới", source: "Giới thiệu", owner: "Chưa phân công" },
  { name: "Trịnh Bảo Ngọc", phone: "0912 345 681", school: "THPT Nguyễn Huệ", status: "Cần bổ sung thông tin", source: "Sự kiện trường", owner: "Chưa phân công" },
  { name: "Lý Gia Hân", phone: "0912 345 682", school: "THPT Hòn Gai", status: "Đang liên hệ", source: "Website", owner: "Trần Văn Long" },
  { name: "Phan Đức Huy", phone: "0912 345 683", school: "THPT Chuyên Hà Nội - Amsterdam", status: "Đã chuyển đổi", source: "Fanpage Facebook", owner: "Lê Thị Hương" },
  { name: "Nguyễn Khánh Linh", phone: "0912 345 684", school: "THPT Nguyễn Thượng Hiền", status: "Mới", source: "Zalo OA", owner: "Chưa phân công" },
  { name: "Trương Nhật Nam", phone: "0912 345 685", school: "THPT Phan Thành Tài", status: "Không tiềm năng", source: "Website", owner: "Phạm Đức Anh" },
  { name: "Võ Thị Bích Trâm", phone: "0912 345 686", school: "THPT Bình Thủy", status: "Đang liên hệ", source: "Giới thiệu", owner: "Trần Văn Long" },
  { name: "Đinh Công Sơn", phone: "0912 345 687", school: "THPT Trần Hưng Đạo", status: "Mới", source: "Sự kiện trường", owner: "Chưa phân công" },
  { name: "Cao Thị Mỹ Duyên", phone: "0912 345 688", school: "THPT Trần Nguyên Hãn", status: "Cần bổ sung thông tin", source: "Website", owner: "Chưa phân công" },
  { name: "Huỳnh Tấn Phát", phone: "0912 345 689", school: "THPT Nguyễn Chí Thanh", status: "Đang liên hệ", source: "Fanpage Facebook", owner: "Lê Thị Hương" },
  { name: "Mai Thị Kim Ngân", phone: "0912 345 690", school: "THPT Marie Curie", status: "Đã chuyển đổi", source: "Zalo OA", owner: "Phạm Đức Anh" },
  { name: "Lâm Quốc Bảo", phone: "0912 345 691", school: "THPT Ông Ích Khiêm", status: "Mới", source: "Website", owner: "Chưa phân công" },
  { name: "Tô Ngọc Diễm", phone: "0912 345 692", school: "THPT Thới Lai", status: "Không tiềm năng", source: "Giới thiệu", owner: "Trần Văn Long" },
  { name: "Nguyễn Hữu Đạt", phone: "0912 345 693", school: "THPT Nam Trực", status: "Đang liên hệ", source: "Sự kiện trường", owner: "Lê Thị Hương" },
  { name: "Phùng Thị Thanh Thảo", phone: "0912 345 694", school: "THPT Cẩm Phả", status: "Mới", source: "Website", owner: "Chưa phân công" },
];

export const leads: LeadListItem[] = rows.map((row, index) => ({
  ...row,
  id: `lead-${String(index + 1).padStart(3, "0")}`,
  initials: initialsOf(row.name),
}));
