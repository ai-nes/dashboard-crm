import type { Metadata } from "next";
import { notFound } from "next/navigation";

import Student360Dashboard from "../_components/student-360-dashboard";
import { getStudent360 } from "@/services/api/students";

export const metadata: Metadata = {
  title: "Hồ sơ học sinh 360°",
  description: "Hồ sơ toàn diện và hành động tuyển sinh tiếp theo cho từng học sinh.",
};

export default async function StudentDetailPage({ params }: { params: Promise<{ studentId: string }> }) {
  const { studentId } = await params;
  const data = await getStudent360(studentId).catch(() => null);

  return <Student360Dashboard studentId={studentId} initialData={data} />;
}
