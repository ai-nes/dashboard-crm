"use client";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Pencil1 } from "@tailgrids/icons";
import StudentAcademicResultEditRow from "./student-academic-result-edit-row";
import StudentAcademicResultDelete from "./student-academic-result-delete";
import { Button } from "@/components/tailgrids/core/button";
import { Card } from "@/components/tailgrids/core/card";
import {
  TableRoot,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/tailgrids/core/table";
import {
  getStudentAcademicResults,
  type StudentAcademicResult,
} from "@/services/api/student-academic-results";

export default function StudentAcademicResults({
  studentId,
  canRead,
  canEdit = false,
  canDelete = false,
}: {
  studentId: string;
  canRead: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
}) {
  return canRead ? (
    <AcademicResults
      studentId={studentId}
      canEdit={canEdit}
      canDelete={canDelete}
    />
  ) : null;
}
function AcademicResults({
  studentId,
  canEdit,
  canDelete,
}: {
  studentId: string;
  canEdit: boolean;
  canDelete: boolean;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const query = useQuery({
    queryKey: ["student-academic-results", studentId],
    queryFn: () => getStudentAcademicResults(studentId),
    enabled: Boolean(studentId.trim()),
  });
  return (
    <Card className="min-w-0 p-0">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-card-border px-5 py-4">
        <h3 className="text-base font-semibold text-text-primary">
          Học bạ THPT
        </h3>
        <div className="flex flex-wrap gap-2">
          {canEdit && !query.isPending && !query.isError && (
            <Button
              size="sm"
              appearance="outline"
              isDisabled={Boolean(editingId)}
              onPress={() => setEditingId("new")}
            >
              Thêm năm học
            </Button>
          )}
          {canEdit && Boolean(query.data?.length) && (
            <Button
              size="sm"
              appearance="outline"
              onPress={() => setEditingId(query.data![0].id)}
              isDisabled={Boolean(editingId)}
            >
              <Pencil1 />
              Chỉnh sửa
            </Button>
          )}
        </div>
      </div>
      {query.isPending ? (
        <p className="p-5 text-sm text-text-secondary">Đang tải học bạ…</p>
      ) : query.isError ? (
        <div className="p-5">
          <p role="alert" className="text-sm text-text-secondary">
            Không thể tải học bạ.
          </p>
          <Button
            size="sm"
            appearance="outline"
            className="mt-3"
            onPress={() => query.refetch()}
          >
            Thử lại
          </Button>
        </div>
      ) : (
        <StudentAcademicResultsTable
          results={query.data ?? []}
          studentId={studentId}
          canEdit={canEdit}
          canDelete={canDelete}
          editingId={editingId}
          onEdit={setEditingId}
        />
      )}
    </Card>
  );
}
export function StudentAcademicResultsTable({
  results,
  studentId,
  canEdit = false,
  canDelete = false,
  editingId,
  onEdit,
}: {
  results: StudentAcademicResult[];
  studentId?: string;
  canEdit?: boolean;
  canDelete?: boolean;
  editingId?: string | null;
  onEdit?: (id: string | null) => void;
}) {
  if (!results.length && !(canEdit && editingId === "new"))
    return (
      <p className="p-5 text-sm text-text-secondary">
        Chưa có kết quả học tập THPT.
      </p>
    );
  return (
    <TableRoot fullBleed aria-label="Học bạ theo năm học">
      <TableHeader>
        <TableRow>
          <TableHead>Năm học</TableHead>
          <TableHead>Lớp</TableHead>
          <TableHead>Điểm trung bình</TableHead>
          <TableHead>Học lực</TableHead>
          {(canEdit || canDelete) && (
            <TableHead>
              <span className="sr-only">Thao tác</span>
            </TableHead>
          )}
        </TableRow>
      </TableHeader>
      <TableBody>
        {canEdit && studentId && editingId === "new" && (
          <StudentAcademicResultEditRow
            key="new"
            studentId={studentId}
            result={{
              id: "new",
              school_year: "",
              grade: null,
              academic_rank: null,
              gpa: null,
            }}
            isNew
            onClose={() => onEdit?.(null)}
          />
        )}
        {[...results]
          .sort((a, b) => a.school_year.localeCompare(b.school_year))
          .map((result) =>
            canEdit && studentId && editingId === result.id ? (
              <StudentAcademicResultEditRow
                key={result.id}
                studentId={studentId}
                result={result}
                onClose={() => onEdit?.(null)}
              />
            ) : (
              <TableRow key={result.id}>
                <TableCell>{result.school_year}</TableCell>
                <TableCell>{result.grade ?? "—"}</TableCell>
                <TableCell className="tabular-nums">
                  {result.gpa?.toLocaleString("vi-VN", {
                    maximumFractionDigits: 2,
                  }) ?? "—"}
                </TableCell>
                <TableCell>{result.academic_rank ?? "—"}</TableCell>
                {(canEdit || canDelete) && (
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {canEdit && (
                        <Button
                          size="sm"
                          appearance="ghost"
                          aria-label={`Chỉnh sửa năm học ${result.school_year}`}
                          isDisabled={Boolean(editingId)}
                          onPress={() => onEdit?.(result.id)}
                        >
                          <Pencil1 />
                        </Button>
                      )}
                      {canDelete && studentId && (
                        <StudentAcademicResultDelete
                          studentId={studentId}
                          result={result}
                          disabled={Boolean(editingId)}
                        />
                      )}
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ),
          )}
      </TableBody>
    </TableRoot>
  );
}
