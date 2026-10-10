import type { Metadata } from "next";

import Student360Dashboard from "../_components/student-360-dashboard";

export const metadata: Metadata = {
  title: "Hồ sơ học sinh 360°",
  description:
    "Hồ sơ toàn diện và hành động tuyển sinh tiếp theo cho từng học sinh.",
};

export default async function StudentDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ studentId: string }>;
  searchParams: Promise<{ tab?: string; taskId?: string }>;
}) {
  const { studentId } = await params;
  const { tab, taskId } = await searchParams;
  return (
    <Student360Dashboard
      studentId={studentId}
      initialTab={tab}
      initialTaskId={taskId}
    />
  );
}
