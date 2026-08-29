import { ArrowRight, Buildings11, Search1 } from "@tailgrids/icons";
import Link from "next/link";

import { Badge } from "@/components/tailgrids/core/badge";
import { Button } from "@/components/tailgrids/core/button";
import { Card } from "@/components/tailgrids/core/card";
import type { SchoolDirectoryRecord } from "@/services/api/schools/types";

interface SchoolDirectoryListProps {
  query: string;
  schools: SchoolDirectoryRecord[];
}

export default function SchoolDirectoryList({ query, schools }: SchoolDirectoryListProps) {
  return (
    <main className="min-w-0 space-y-5 px-2 py-4 pb-8 lg:px-6">
      <header className="rounded-xl border border-card-border bg-card-background p-5 lg:p-6">
        <Badge color="primary">FAIP</Badge>
        <h1 className="mt-3 text-balance text-[28px] leading-8 font-semibold tracking-[-0.4px] text-text-primary">School Intelligence</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">Tìm kiếm một trường THPT để xem tiềm năng tuyển sinh, hiệu quả chuyển đổi và hành động AI đề xuất.</p>

        <form className="mt-5 flex flex-col gap-2 sm:flex-row" action="/director/schools">
          <label className="sr-only" htmlFor="school-query">Tìm theo tên trường, mã trường hoặc khu vực</label>
          <div className="flex h-10 flex-1 items-center gap-2 rounded-lg border border-input-border bg-input-background px-3 focus-within:ring-4 focus-within:ring-button-primary-focus-ring">
            <Search1 size={17} className="shrink-0 text-icon-tertiary" aria-hidden="true" />
            <input id="school-query" name="query" defaultValue={query} placeholder="Tên trường, mã trường, tỉnh/thành hoặc quận/huyện" className="h-full min-w-0 flex-1 bg-transparent text-sm text-text-primary outline-none placeholder:text-text-tertiary" />
          </div>
          <Button type="submit" className="sm:w-auto">Tìm trường</Button>
        </form>
      </header>

      <section aria-label="Kết quả tìm kiếm">
        <div className="mb-3 flex items-center justify-between gap-4"><h2 className="text-sm font-semibold text-text-primary">{query ? `Kết quả cho “${query}”` : "Trường THPT trong directory"}</h2><p className="text-xs text-text-tertiary">Hiển thị tối đa {schools.length} kết quả</p></div>
        {schools.length ? (
          <div className="grid gap-3">
            {schools.map((school) => (
              <Card key={school.id} className="p-4 transition hover:border-button-primary-outline-stroke hover:bg-background-soft-50">
                <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-badge-primary-background text-badge-primary-text" aria-hidden="true"><Buildings11 size={18} /></span>
                    <div className="min-w-0"><h3 className="truncate text-sm font-semibold text-text-primary">{school.name}</h3><p className="mt-1 truncate text-xs text-text-secondary">{school.district}, {school.province} · Mã trường {school.schoolCode}</p>{school.address && <p className="mt-1 truncate text-xs text-text-tertiary">{school.address}</p>}</div>
                  </div>
                  <Link href={`/director/schools/${school.id}`} className="inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-lg bg-button-primary-background px-3.5 text-sm font-medium text-button-primary-text transition hover:bg-button-primary-hover-background focus-visible:outline-4 focus-visible:outline-button-primary-focus-ring">Xem intelligence <ArrowRight size={16} /></Link>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-8 text-center"><h2 className="text-base font-semibold text-text-primary">Không tìm thấy trường phù hợp</h2><p className="mt-2 text-sm text-text-secondary">Hãy thử lại với tên trường, mã trường hoặc địa phương khác.</p></Card>
        )}
      </section>
    </main>
  );
}
