"use client";

import { Tab, TabList, TabPanel, Tabs } from "react-aria-components";

import ApplicationCard from "./application-card";
import ContextCards from "./context-cards";
import JourneyTimeline from "./journey-timeline";
import StudentApplicationTab from "./student-application-tab";
import StudentAuditCard from "./student-audit-card";
import StudentDetailsTab from "./student-details-tab";
import StudentDocumentsTab from "./student-documents-tab";
import StudentEngagementTab from "./student-engagement-tab";
import StudentFamilyTab from "./student-family-tab";
import StudentNotesTab from "./student-notes-tab";
import StudentDetailCard from "./student-detail-card";
import type { Student360SectionProps } from "./types";

const tabs = [
  { id: "overview", label: "Tổng quan" },
  { id: "details", label: "Thông tin chi tiết" },
  { id: "application", label: "Nguyện vọng" },
  { id: "engagement", label: "Tương tác" },
  { id: "family", label: "Gia đình" },
  { id: "documents", label: "Tài liệu" },
  { id: "notes", label: "Ghi chú" },
];

const tabClassName = "relative shrink-0 px-1 pb-3 text-sm font-medium text-text-secondary outline-none transition data-[selected]:text-primary-500 after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:scale-x-0 after:bg-primary-500 after:transition-transform data-[selected]:after:scale-x-100 data-[focus-visible]:rounded data-[focus-visible]:ring-2 data-[focus-visible]:ring-primary-500";

export default function StudentTabs({ data }: Student360SectionProps) {
  return <Tabs defaultSelectedKey="overview"><TabList aria-label="Nội dung hồ sơ học sinh" className="flex gap-6 overflow-x-auto border-b border-card-border">{tabs.map((tab) => <Tab key={tab.id} id={tab.id} className={tabClassName}>{tab.label}</Tab>)}</TabList><TabPanel id="overview" className="pt-5 outline-none"><div className="grid min-w-0 items-stretch gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.8fr)]"><div className="flex min-w-0 flex-col gap-5"><JourneyTimeline data={data} /><ContextCards data={data} /><StudentAuditCard /></div><div className="grid min-w-0 content-start gap-5 xl:grid-rows-[minmax(0,1fr)_minmax(0,1fr)]"><StudentDetailCard data={data} /><ApplicationCard data={data} /></div></div></TabPanel><TabPanel id="details" className="pt-5 outline-none"><StudentDetailsTab data={data} /></TabPanel><TabPanel id="application" className="pt-5 outline-none"><StudentApplicationTab data={data} /></TabPanel><TabPanel id="engagement" className="pt-5 outline-none"><StudentEngagementTab data={data} /></TabPanel><TabPanel id="family" className="pt-5 outline-none"><StudentFamilyTab data={data} /></TabPanel><TabPanel id="documents" className="pt-5 outline-none"><StudentDocumentsTab data={data} /></TabPanel><TabPanel id="notes" className="pt-5 outline-none"><StudentNotesTab data={data} /></TabPanel></Tabs>;
}
