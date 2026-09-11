"use client";

import { useState } from "react";

import type { CrmRuleCondition } from "@/services/api/rules-config";

interface RuleConditionRawEditorProps {
  condition: CrmRuleCondition;
  disabled?: boolean;
  onChange: (condition: CrmRuleCondition) => void;
}

const textAreaClass =
  "min-h-56 w-full resize-y rounded-lg border border-card-border bg-input-background px-3 py-2.5 font-mono text-xs leading-5 text-title-50 outline-none focus:border-input-primary-focus-border focus:ring-4 focus:ring-input-primary-focus-border/20 disabled:cursor-not-allowed disabled:bg-background-gray-secondary";

export function RuleConditionRawEditor({ condition, disabled, onChange }: RuleConditionRawEditorProps) {
  const [text, setText] = useState(() => JSON.stringify(condition, null, 2));
  const [error, setError] = useState<string | null>(null);

  const handleChange = (value: string) => {
    setText(value);
    try {
      const parsed = JSON.parse(value) as CrmRuleCondition;
      setError(null);
      onChange(parsed);
    } catch {
      setError("JSON không hợp lệ — sửa lỗi cú pháp trước khi lưu.");
    }
  };

  return (
    <div className="space-y-2">
      <div className="rounded-lg border border-alert-warning-border bg-alert-warning-background p-3 text-sm text-alert-warning-title">
        Điều kiện này có cấu trúc phức tạp hơn dạng nhóm trực quan hỗ trợ (lồng nhiều cấp, phối hợp cả AND/OR trên cùng một
        nhóm, hoặc so sánh giữa hai fact). Chỉnh sửa trực tiếp JSON bên dưới để không làm mất nghiệp vụ đã cấu hình.
      </div>
      <textarea
        aria-label="JSON condition"
        className={textAreaClass}
        disabled={disabled}
        value={text}
        onChange={(event) => handleChange(event.target.value)}
        spellCheck={false}
      />
      {error ? <p className="text-sm text-alert-danger-title">{error}</p> : null}
    </div>
  );
}
