import {
  CheckCircle1,
  ClockThree,
  InfoTriangle,
  Sparkle,
  TrendUp2,
} from "@tailgrids/icons";

export const visual360Sections = [
  {
    id: "signals",
    label: "Tín hiệu tư vấn",
    description: "Những tín hiệu giúp định hướng cuộc tư vấn tiếp theo.",
    icon: Sparkle,
  },
  {
    id: "interactions",
    label: "Tương tác gần đây",
    description:
      "Các điểm chạm và thay đổi gần đây trong hành trình tuyển sinh.",
    icon: ClockThree,
  },
  {
    id: "potential",
    label: "Điểm tiềm năng",
    description: "Mức độ sẵn sàng của hồ sơ và các thành phần điểm.",
    icon: TrendUp2,
  },
  {
    id: "challenges",
    label: "Rào cản tuyển sinh",
    description: "Những băn khoăn cần làm rõ để hỗ trợ học sinh.",
    icon: InfoTriangle,
  },
  {
    id: "positives",
    label: "Tín hiệu thuận lợi",
    description: "Điểm mạnh, cơ hội và khuyến nghị từ hồ sơ.",
    icon: CheckCircle1,
  },
] as const;

export type Visual360SectionId = (typeof visual360Sections)[number]["id"];
