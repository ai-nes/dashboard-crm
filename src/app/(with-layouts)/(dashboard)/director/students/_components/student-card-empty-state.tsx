import { cn } from "@/utils/cn";

interface StudentCardEmptyStateProps {
  message: string;
  className?: string;
}

export default function StudentCardEmptyState({
  message,
  className,
}: StudentCardEmptyStateProps) {
  return (
    <div
      role="status"
      className={cn(
        "flex flex-col items-center justify-center py-8 text-center",
        className,
      )}
    >
      <div className="relative mb-3 flex size-20 items-center justify-center">
        {/* Subtle base glow & platform */}
        <svg
          viewBox="0 0 100 90"
          className="size-full select-none"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          {/* Isometric base plane */}
          <polygon
            points="50,45 82,62 50,79 18,62"
            className="fill-background-soft-100 dark:fill-background-soft-300/40"
          />
          <polygon
            points="50,48 78,63 50,77 22,63"
            className="fill-card-background"
          />
          {/* Light projection cone from magnifier */}
          <polygon
            points="46,38 72,60 28,60"
            className="fill-primary-500/10 dark:fill-primary-400/10"
          />
          {/* Magnifying Glass rim */}
          <circle
            cx="46"
            cy="32"
            r="16"
            className="stroke-text-tertiary/70"
            strokeWidth="3.5"
          />
          <circle
            cx="46"
            cy="32"
            r="12.5"
            className="fill-background-soft-50 stroke-card-border"
            strokeWidth="1"
          />
          {/* Lens reflection glint */}
          <path
            d="M 40 24 A 12 12 0 0 1 54 28"
            className="stroke-white-100/80 dark:stroke-white-100/40"
            strokeWidth="2"
            strokeLinecap="round"
          />
          {/* Handle */}
          <line
            x1="58"
            y1="44"
            x2="70"
            y2="56"
            className="stroke-text-tertiary"
            strokeWidth="4"
            strokeLinecap="round"
          />
          {/* Small sparkles */}
          <circle cx="28" cy="20" r="1.5" className="fill-text-tertiary/60" />
          <circle cx="68" cy="22" r="1" className="fill-text-tertiary/60" />
          <circle cx="24" cy="38" r="1" className="fill-text-tertiary/40" />
        </svg>
      </div>
      <p className="text-sm font-normal text-text-secondary">{message}</p>
    </div>
  );
}

