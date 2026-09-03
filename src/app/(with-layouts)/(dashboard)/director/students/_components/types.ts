import type { Student360Data, StudentNoteItem } from "@/services/api/students/types";

export interface Student360SectionProps {
  data: Student360Data;
}

export interface StudentNoteRecord extends StudentNoteItem {
  id: string;
}
