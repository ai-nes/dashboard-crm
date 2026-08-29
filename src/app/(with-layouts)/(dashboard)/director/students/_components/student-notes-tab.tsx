"use client";

import { Message1, Plus } from "@tailgrids/icons";
import { toast } from "sonner";

import { Badge } from "@/components/tailgrids/core/badge";
import { Button } from "@/components/tailgrids/core/button";
import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";

import { notes } from "./student-tab-data";
import type { Student360SectionProps } from "./types";

export default function StudentNotesTab({ data }: Student360SectionProps) {
  return <div className="grid items-stretch gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.65fr)]"><Card className="h-full p-5"><CardHeader className="mb-5"><div><CardTitle>Ghi chú tư vấn</CardTitle><p className="mt-1 text-xs leading-5 text-text-tertiary">Thông tin nội bộ giúp đội tuyển sinh tiếp tục đúng ngữ cảnh.</p></div><Button size="sm" onPress={() => toast.success("Đã tạo ghi chú mới trong bản mô phỏng.")}><Plus size={16} />Thêm ghi chú</Button></CardHeader><ol className="space-y-4">{notes.map((note) => <li key={`${note.author}-${note.date}`} className="flex gap-3"><span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-badge-primary-background text-badge-primary-text" aria-hidden="true"><Message1 size={16} /></span><div className="min-w-0 flex-1 rounded-lg border border-card-border p-4"><div className="flex flex-wrap items-center justify-between gap-2"><p className="text-sm font-semibold text-text-primary">{note.author}</p><span className="text-xs text-text-tertiary">{note.date}</span></div><p className="mt-2 text-sm leading-6 text-text-secondary">{note.content}</p></div></li>)}</ol></Card><Card className="h-full p-5"><CardHeader className="mb-5"><div><CardTitle>Nhắc việc tiếp theo</CardTitle><p className="mt-1 text-xs leading-5 text-text-tertiary">Các việc cần giữ trong tầm nhìn.</p></div><Badge color="warning">3 việc</Badge></CardHeader><ul className="space-y-3"><li className="rounded-lg bg-badge-primary-background p-4"><p className="text-sm font-semibold text-text-primary">Gọi cho bố</p><p className="mt-1 text-xs leading-5 text-text-secondary">Thứ Năm · 16:00–18:00 · {data.student.counselor}</p></li><li className="rounded-lg border border-card-border p-4"><p className="text-sm font-semibold text-text-primary">Gửi bảng học phí</p><p className="mt-1 text-xs leading-5 text-text-secondary">Trước cuộc gọi tiếp theo · Kèm phương án học bổng 30%</p></li><li className="rounded-lg border border-card-border p-4"><p className="text-sm font-semibold text-text-primary">Theo dõi mở hồ sơ</p><p className="mt-1 text-xs leading-5 text-text-secondary">Sau 48 giờ nếu chưa có tài liệu mới</p></li></ul></Card></div>;
}
