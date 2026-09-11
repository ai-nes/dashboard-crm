import type { ReactNode } from "react";

interface StudentCardHeaderProps {
  description: string;
  icon: ReactNode;
  title: string;
  titleBadge?: ReactNode;
  rightAction?: ReactNode;
}

export default function StudentCardHeader({
  description,
  icon,
  title,
  titleBadge,
  rightAction,
}: StudentCardHeaderProps) {
  return (
    <header className="mb-6 flex items-start gap-3">
      <span
        aria-hidden="true"
        className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-background-gray-secondary text-text-secondary"
      >
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <h2 className="text-sm font-semibold text-text-primary">{title}</h2>
          {titleBadge}
        </div>
        <p className="mt-1 text-xs leading-5 text-text-tertiary">
          {description}
        </p>
      </div>
      {rightAction && (
        <div className="flex shrink-0 items-center gap-2">{rightAction}</div>
      )}
    </header>
  );
}
