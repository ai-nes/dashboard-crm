import type { Metadata } from "next";

import Student360Dashboard from "../_components/student-360-dashboard";
import { shouldLoadInitialStudentInteractions } from "../_components/student-detail-tab-state";
import {
  getStudent360,
  getStudentChatwootInteractions,
  getStudentInteractions,
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
  const data = await getStudent360(studentId).catch(() => null);
  const leadId = data?.student.id || studentId;
  const canonicalStudentId = data?.student.studentId || leadId;
  const shouldLoadInteractions = shouldLoadInitialStudentInteractions(
    tab,
    taskId,
  );
  const [chatwootInteractions, interactions] = shouldLoadInteractions
    ? await Promise.all([
        getStudentChatwootInteractions(canonicalStudentId).catch(() => null),
        getStudentInteractions(canonicalStudentId).catch(() => null),
      ])
    : [null, null];

  return (
    <Student360Dashboard
      studentId={leadId}
      initialData={data}
      initialChatwootInteractions={chatwootInteractions}
      initialStudentInteractions={interactions}
      initialTab={tab}
      initialTaskId={taskId}
    />
  );
}
