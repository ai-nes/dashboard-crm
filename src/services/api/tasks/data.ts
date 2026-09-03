import { studentListData } from "@/services/api/students/data";
import type { StudentTaskType } from "@/services/api/students/types";

import type { TaskManagementItem } from "./types";

export const taskManagementAssignee = "Trần Quốc Bảo";

interface TaskTemplate {
  id: string;
  title: string;
  dueDate: string;
  dueTime: string;
  status: "todo" | "in-progress" | "done";
  priority: "Cao" | "Trung bình" | "Thấp";
  taskType: StudentTaskType;
  notes?: string;
}

const taskTemplates: Record<string, TaskTemplate[]> = {
  "nguyen-minh-an": [
    {
      id: "task-an-scholarship-call",
      title: "Gọi xác nhận phương án học phí với phụ huynh",
      dueDate: "2026-09-03",
      dueTime: "16:00",
      status: "todo",
      priority: "Cao",
      taskType: "call",
      notes: "Hỏi thêm về học bổng theo từng học kỳ.",
    },
    {
      id: "task-an-scholarship-email",
      title: "Gửi hồ sơ học bổng bổ sung",
      dueDate: "2026-09-04",
      dueTime: "10:00",
      status: "in-progress",
      priority: "Trung bình",
      taskType: "email",
    },
  ],
  "tran-ngoc-bao-chau": [
    {
      id: "task-bc-scholarship-plan",
      title: "Gửi lộ trình học bổng cho phụ huynh",
      dueDate: "2026-09-04",
      dueTime: "14:30",
      status: "todo",
      priority: "Cao",
      taskType: "email",
    },
    {
      id: "task-bc-follow-up",
      title: "Theo dõi phản hồi về phương án tài chính",
      dueDate: "2026-09-08",
      dueTime: "09:00",
      status: "todo",
      priority: "Trung bình",
      taskType: "todo",
    },
  ],
  "le-gia-huy": [
    {
      id: "task-gh-document-reminder",
      title: "Nhắc hoàn tất hồ sơ ứng tuyển",
      dueDate: "2026-09-02",
      dueTime: "09:30",
      status: "done",
      priority: "Thấp",
      taskType: "todo",
    },
    {
      id: "task-gh-document-call",
      title: "Gọi hướng dẫn bộ giấy tờ còn thiếu",
      dueDate: "2026-09-11",
      dueTime: "15:00",
      status: "todo",
      priority: "Cao",
      taskType: "call",
    },
  ],
  "pham-khanh-linh": [
    {
      id: "task-kl-campus-tour",
      title: "Mời tham gia campus tour",
      dueDate: "2026-09-05",
      dueTime: "09:30",
      status: "in-progress",
      priority: "Trung bình",
      taskType: "call",
    },
  ],
  "vo-minh-khang": [
    {
      id: "task-mk-major-email",
      title: "Gửi thông tin chuyên ngành thiết kế vi mạch",
      dueDate: "2026-09-09",
      dueTime: "10:00",
      status: "todo",
      priority: "Thấp",
      taskType: "email",
    },
  ],
  "do-ngoc-mai": [
    {
      id: "task-nm-reengage-call",
      title: "Gọi trao đổi về trải nghiệm sinh viên",
      dueDate: "2026-09-03",
      dueTime: "17:30",
      status: "todo",
      priority: "Trung bình",
      taskType: "call",
    },
    {
      id: "task-nm-student-story",
      title: "Chia sẻ câu chuyện sinh viên ngành Ngôn ngữ Anh",
      dueDate: "2026-09-10",
      dueTime: "19:00",
      status: "todo",
      priority: "Thấp",
      taskType: "email",
    },
  ],
  "nguyen-hoang-nam": [
    {
      id: "task-hn-reengage",
      title: "Kích hoạt lại điểm chạm tư vấn",
      dueDate: "2026-09-01",
      dueTime: "18:00",
      status: "todo",
      priority: "Thấp",
      taskType: "todo",
    },
    {
      id: "task-hn-follow-up-call",
      title: "Gọi hỏi thêm nhu cầu ngành học",
      dueDate: "2026-09-06",
      dueTime: "18:30",
      status: "todo",
      priority: "Trung bình",
      taskType: "call",
    },
  ],
  "bui-thanh-ha": [
    {
      id: "task-th-admission-confirmation",
      title: "Theo dõi xác nhận nhập học",
      dueDate: "2026-09-04",
      dueTime: "11:00",
      status: "done",
      priority: "Cao",
      taskType: "todo",
    },
  ],
};

export const taskManagementData: TaskManagementItem[] = studentListData.flatMap((student) =>
  (taskTemplates[student.id] ?? []).map((task) => ({
    ...task,
    assignee: taskManagementAssignee,
    studentId: student.id,
    studentName: student.name,
    studentCode: student.code,
    studentInitials: student.initials,
    studentMajor: student.major,
  })),
);

export function getTaskManagementTasksForStudent(studentCode: string): TaskManagementItem[] {
  return taskManagementData.filter((task) => task.studentCode === studentCode);
}
