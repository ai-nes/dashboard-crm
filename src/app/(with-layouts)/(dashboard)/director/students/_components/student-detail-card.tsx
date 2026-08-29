import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";

import type { Student360SectionProps } from "./types";

export default function StudentDetailCard({ data }: Student360SectionProps) {
  return <Card className="p-5"><CardHeader className="mb-5"><div><CardTitle>Thông tin hồ sơ</CardTitle><p className="mt-1 text-xs leading-5 text-text-tertiary">Nền tảng cá nhân và học tập để chuẩn bị tư vấn.</p></div></CardHeader><div className="grid gap-x-6 gap-y-5 sm:grid-cols-2">{[...data.profile, ...data.academics].map((item) => <div key={item.label}><p className="text-xs text-text-tertiary">{item.label}</p><p className="mt-1 text-sm font-medium text-text-primary">{item.value}</p></div>)}</div></Card>;
}
