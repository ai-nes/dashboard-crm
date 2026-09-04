import type { Metadata } from "next";

import Student360Dashboard from "../_components/student-360-dashboard";
import {
  getStudent360,
  getStudentChatwootInteractions,
} from "@/services/api/students";

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
  const [data, chatwootInteractions] = await Promise.all([
    getStudent360(studentId).catch(() => null),
    getStudentChatwootInteractions(studentId).catch(() => null),
  ]);

  return (
    <Student360Dashboard
      studentId={studentId}
      initialData={data}
      initialChatwootInteractions={chatwootInteractions}
      initialTab={tab}
      initialTaskId={taskId}
    />
  );
}
