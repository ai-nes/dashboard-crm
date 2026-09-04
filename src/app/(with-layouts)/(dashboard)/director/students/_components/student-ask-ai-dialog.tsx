"use client";

import { Close, Sparkle } from "@tailgrids/icons";
import { useState } from "react";
import { Button } from "@/components/tailgrids/core/button";
import type { Student360Data } from "@/services/api/students/types";

interface StudentAskAIDialogProps {
  isOpen: boolean;
  onClose: () => void;
  data: Student360Data;
}

const suggestedQuestions = [
  "Mối quan tâm lớn nhất của học sinh và gia đình lúc này là gì?",
  "Điểm chạm hoặc kịch bản cuộc gọi tiếp theo nên tập trung vào đâu?",
  "Khả năng nhập học của học sinh này được đánh giá thế nào?",
  "Có rào cản nào về học phí hay phương thức xét tuyển không?",
];

export default function StudentAskAIDialog({
  isOpen,
  onClose,
  data,
}: StudentAskAIDialogProps) {
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [isThinking, setIsThinking] = useState(false);

  if (!isOpen) return null;

  const handleAsk = (questionText: string) => {
    setQuery(questionText);
    setIsThinking(true);
    setAnswer(null);

    setTimeout(() => {
      setIsThinking(false);
      if (questionText.includes("quan tâm") || questionText.includes("lớn nhất")) {
        setAnswer(
          `Dựa trên dữ liệu trao đổi gần nhất, gia đình và ${data.student.name} quan tâm nhiều nhất đến: ${data.parentProfile.concerns.join(", ") || "Chương trình đào tạo và học bổng"}. Phụ huynh mong muốn nhận thông tin rõ ràng về mức ưu đãi và thời hạn nộp hồ sơ trước ngày 15 tới.`,
        );
      } else if (questionText.includes("kịch bản") || questionText.includes("cuộc gọi")) {
        setAnswer(
          `Gợi ý kịch bản cho tư vấn viên: 1) Chào hỏi và cập nhật cuộc trao đổi ngày hôm qua. 2) Cung cấp thông tin chi tiết về ngành ${data.student.major} theo nguyện vọng của học sinh. 3) Giới thiệu chính sách học bổng và hẹn lịch gửi bản thảo hồ sơ.`,
        );
      } else if (questionText.includes("nhập học") || questionText.includes("đánh giá")) {
        setAnswer(
          `Học sinh có điểm tín hiệu ưu tiên là ${data.insight.signalScore}/100 với điểm tiềm năng ở mức cao. Xác suất nhập học ước tính đạt ${Math.round(data.insight.probability * 100)}%. Đề xuất tư vấn viên giữ nhịp chăm sóc trong 48 giờ tới.`,
        );
      } else {
        setAnswer(
          `Phân tích hồ sơ cho ${data.student.name}: Học sinh thuộc nhóm "${data.classification.combination || "Phù hợp cao"}", đang ở giai đoạn ${data.student.grade}. Khuyến nghị: ${data.insight.recommendation || "Tiếp tục duy trì liên hệ qua kênh cuộc gọi vào khung giờ 16:00 đến 18:00."}`,
        );
      }
    }, 650);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="ask-ai-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-xl rounded-2xl border border-card-border bg-card-background p-6 shadow-2xl transition-all">
        <div className="flex items-center justify-between border-b border-card-border pb-4">
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg bg-primary-500/10 text-primary-600 dark:text-primary-400">
              <Sparkle size={16} aria-hidden="true" />
            </span>
            <div>
              <h2 id="ask-ai-title" className="text-base font-semibold text-text-primary">
                Hỏi đáp AI về {data.student.name}
              </h2>
              <p className="text-xs text-text-tertiary">
                Hỏi bất kỳ điều gì về lịch sử tương tác, mối quan tâm hoặc hành động tiếp theo
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-text-tertiary transition-colors hover:bg-background-soft-100 hover:text-text-primary"
            aria-label="Đóng"
          >
            <Close size={16} aria-hidden="true" />
          </button>
        </div>

        {/* Suggested questions */}
        <div className="mt-4">
          <p className="text-xs font-semibold text-text-secondary">Câu hỏi gợi ý nhanh:</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {suggestedQuestions.map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleAsk(q)}
                className="cursor-pointer rounded-full border border-card-border bg-background-soft-50 px-3 py-1.5 text-left text-xs font-medium text-text-secondary transition-colors hover:border-primary-500 hover:bg-primary-50 hover:text-primary-700 dark:hover:bg-primary-950/40 dark:hover:text-primary-300"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Question input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (query.trim()) handleAsk(query.trim());
          }}
          className="mt-4 flex gap-2"
        >
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Nhập câu hỏi cho AI..."
            className="flex-1 rounded-xl border border-card-border bg-background-soft-50 px-3.5 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:border-primary-500 focus:outline-hidden"
          />
          <Button
            type="submit"
            size="sm"
            isDisabled={!query.trim() || isThinking}
            className="rounded-xl shrink-0"
          >
            {isThinking ? "Đang xử lý..." : "Hỏi AI"}
          </Button>
        </form>

        {/* Answer section */}
        {(isThinking || answer) && (
          <div className="mt-4 rounded-xl border border-card-border bg-background-soft-50/70 p-4">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-primary-600 dark:text-primary-400">
              <Sparkle size={13} aria-hidden="true" />
              <span>Phân tích từ AI-NES:</span>
            </div>
            {isThinking ? (
              <p className="mt-2 text-xs text-text-tertiary animate-pulse">
                Đang đối chiếu dữ liệu hồ sơ và tổng hợp câu trả lời...
              </p>
            ) : (
              <p className="mt-2 text-sm leading-relaxed text-text-primary text-pretty">
                {answer}
              </p>
            )}
          </div>
        )}

        <div className="mt-5 flex justify-end">
          <Button appearance="outline" size="sm" onPress={onClose} className="rounded-xl">
            Đóng
          </Button>
        </div>
      </div>
    </div>
  );
}

