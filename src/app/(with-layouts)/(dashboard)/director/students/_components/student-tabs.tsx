"use client";

import { Tab, TabList, TabPanel, Tabs } from "react-aria-components";

import { Card } from "@/components/tailgrids/core/card";
import ApplicationCard from "./application-card";
import ContextCards from "./context-cards";
import JourneyTimeline from "./journey-timeline";
import StudentDetailCard from "./student-detail-card";
import type { Student360SectionProps } from "./types";

const tabs = ["Tổng quan", "Thông tin chi tiết", "Nguyện vọng", "Tương tác", "Gia đình", "Tài liệu", "Ghi chú"];

const tabClassName = "relative shrink-0 px-1 pb-3 text-sm font-medium text-text-secondary outline-none transition data-[selected]:text-primary-500 after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:scale-x-0 after:bg-primary-500 after:transition-transform data-[selected]:after:scale-x-100 data-[focus-visible]:rounded data-[focus-visible]:ring-2 data-[focus-visible]:ring-primary-500";

export default function StudentTabs({ data }: Student360SectionProps) {
  return <Tabs defaultSelectedKey="overview"><TabList aria-label="Nội dung hồ sơ học sinh" className="flex gap-6 overflow-x-auto border-b border-card-border">{tabs.map((label, index) => <Tab key={label} id={index === 0 ? "overview" : `tab-${index}`} className={tabClassName}>{label}</Tab>)}</TabList><TabPanel id="overview" className="pt-5 outline-none"><div className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.8fr)]"><div className="min-w-0 space-y-5"><JourneyTimeline data={data} /><ContextCards data={data} /></div><div className="min-w-0 space-y-5"><StudentDetailCard data={data} /><ApplicationCard data={data} /></div></div></TabPanel>{tabs.slice(1).map((label, index) => <TabPanel key={label} id={`tab-${index + 1}`} className="pt-5 outline-none"><Card className="p-5"><h2 className="text-lg font-semibold text-text-primary">{label}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">Thông tin chuyên sâu sẽ được hiển thị theo ngữ cảnh, giúp tư vấn viên tập trung vào quyết định hiện tại mà không quá tải dữ liệu.</p></Card></TabPanel>)}</Tabs>;
}
