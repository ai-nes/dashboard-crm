import "server-only";

import { student360Data, studentListData } from "./data";

export async function getStudent360(studentId = "nguyen-minh-an") {
  const student = studentListData.find((item) => item.id === studentId);

  if (!student) return null;

  return {
    ...student360Data,
    student: {
      ...student360Data.student,
      initials: student.initials,
      name: student.name,
      code: student.code,
      school: `${student.school}, ${student.province}`,
      major: student.major,
      province: student.province,
      counselor: student.owner,
    },
    insight: {
      ...student360Data.insight,
      summary: student360Data.insight.summary.replace("Minh An", student.name),
      probability: student.score,
      scoreDelta: student.scoreDelta,
      baseline: Math.max(35, student.score - Math.max(student.scoreDelta, 0) - 28),
      confidence: student.score >= 70 ? 76 : 68,
    },
  };
}
