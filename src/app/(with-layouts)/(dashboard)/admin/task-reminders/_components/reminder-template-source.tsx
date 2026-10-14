import type { ReactNode } from "react";

export default function ReminderTemplateSource({ value }: { value: string }) {
  const pattern =
    /({{[^{}]*}}|<!--[\s\S]*?-->|<\/?[\w:-]+|"[^"]*"|'[^']*'|[<>/=])/g;
  const parts: ReactNode[] = [];
  let offset = 0;
  for (const match of value.matchAll(pattern)) {
    if (match.index > offset) parts.push(value.slice(offset, match.index));
    const token = match[0];
    const color = token.startsWith("{{")
      ? "text-primary-700 font-semibold"
      : token.startsWith("<!--")
        ? "text-text-tertiary"
        : token.startsWith("<")
          ? "text-badge-info-text"
          : /^["']/.test(token)
            ? "text-badge-success-text"
            : "text-text-tertiary";
    parts.push(
      <span key={match.index} className={color}>
        {token}
      </span>,
    );
    offset = match.index + token.length;
  }
  parts.push(value.slice(offset));
  return (
    <>
      {parts}
      {"\n"}
    </>
  );
}
