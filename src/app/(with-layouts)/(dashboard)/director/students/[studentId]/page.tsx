import type { Metadata } from "next";
import { notFound } from "next/navigation";

import Student360Dashboard from "../_components/student-360-dashboard";
import { getStudent360 } from "@/services/api/students";

export const metadata: Metadata = {
  title: "Student 360° | AI-NES Admission Intelligence",
  description: "Hồ sơ toàn diện và hành động tuyển sinh tiếp theo cho từng học sinh.",
};

export default async function StudentDetailPage({ params }: { params: Promise<{ studentId: string }> }) {
  const { studentId } = await params;
  if (studentId !== "nguyen-minh-an") notFound();
  const data = await getStudent360();
  return <Student360Dashboard data={data} />;
}
