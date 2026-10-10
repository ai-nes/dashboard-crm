import { nestRequest } from "../nest/nest-client";

export interface StudentLanguageCertificate {
  id: string;
  language: string;
  certificate_name: string;
  score_level: string | null;
  issue_date: string | null;
  expiry_date: string | null;
}

export interface CertificateFields {
  certificateName: string;
  scoreLevel: string | null;
  issueDate: string | null;
  expiryDate: string | null;
}

const path = (studentId: string) =>
  `/api/v1/students/${encodeURIComponent(studentId)}/language-certificates`;

export async function getEnglishCertificate(studentId: string) {
  const response = await nestRequest<{
    data: { certificates: StudentLanguageCertificate[] };
  }>(path(studentId));
  return (
    response.data.certificates.find(
      (certificate) => certificate.language === "Tiếng Anh",
    ) ?? null
  );
}

export async function saveEnglishCertificate(
  studentId: string,
  certificateId: string | undefined,
  fields: CertificateFields,
) {
  const response = await nestRequest<{ data: StudentLanguageCertificate }>(
    certificateId
      ? `${path(studentId)}/${encodeURIComponent(certificateId)}`
      : path(studentId),
    {
      method: certificateId ? "PATCH" : "POST",
      body: { language: "Tiếng Anh", ...fields },
    },
  );
  return response.data;
}
