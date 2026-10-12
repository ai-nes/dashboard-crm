import type { ReactNode } from "react";

// SSR permission tests need to inspect items inside the normally closed popover.
export function DropdownMenu({ children }: { children: ReactNode }) {
  return <div>{children}</div>;
}
export function DropdownMenuTrigger({
  children,
  "aria-label": label,
  isDisabled,
}: {
  children: ReactNode;
  "aria-label"?: string;
  isDisabled?: boolean;
}) {
  return (
    <button aria-label={label} disabled={isDisabled}>
      {children}
    </button>
  );
}
export function DropdownMenuContent({ children }: { children: ReactNode }) {
  return <div role="menu">{children}</div>;
}
export function DropdownMenuItem({
  children,
  href,
  "aria-label": label,
  isDisabled,
}: {
  children: ReactNode;
  href?: string;
  "aria-label"?: string;
  isDisabled?: boolean;
}) {
  return href ? (
    <a href={href} aria-label={label}>
      {children}
    </a>
  ) : (
    <button aria-label={label} disabled={isDisabled}>
      {children}
    </button>
  );
}
export function DropdownMenuSection({ children }: { children: ReactNode }) {
  return <div>{children}</div>;
}
export function DropdownMenuHeader({ children }: { children: ReactNode }) {
  return <div>{children}</div>;
}
export function DropdownMenuSeparator() {
  return <hr />;
}
