"use client";

import { useId, useState, type ReactNode } from "react";
import { Eye, EyeDisabled } from "@tailgrids/icons";
import { Input, type InputProps } from "@/components/tailgrids/core/input";
import { Button } from "@/components/tailgrids/core/button";
import { cn } from "@/utils/cn";

interface ReminderFieldProps extends Omit<InputProps, "id" | "className"> {
  label: string;
  description?: ReactNode;
  error?: string;
  appearance?: "default" | "inline";
}

export default function ReminderField({
  label,
  description,
  error,
  appearance = "default",
  ...props
}: ReminderFieldProps) {
  const id = useId();
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = props.type === "password";
  return (
    <div className="min-w-0 space-y-1">
      <label htmlFor={id} className="block text-xs text-text-tertiary">
        {label}
        {props.required ? (
          <span className="text-badge-error-text"> *</span>
        ) : null}
      </label>
      <div className={cn("relative", appearance === "inline" && "-ml-2")}>
        <Input
          {...props}
          type={isPassword && showPassword ? "text" : props.type}
          id={id}
          className={cn(
            "h-10 w-full px-3 py-0 text-sm text-text-primary placeholder:text-text-secondary",
            appearance === "inline" &&
              "h-8 rounded-md border-transparent bg-transparent px-2 font-medium hover:border-card-border focus:border-primary-500 focus:bg-card-background focus:ring-2 focus:ring-primary-500/15",
            error && "border-input-error-focus-border bg-card-background",
            isPassword && "pr-10",
          )}
          state={error ? "error" : "default"}
          aria-invalid={Boolean(error)}
          aria-describedby={
            [description ? `${id}-description` : "", error ? `${id}-error` : ""]
              .filter(Boolean)
              .join(" ") || undefined
          }
        />
        {isPassword ? (
          <Button
            type="button"
            appearance="ghost"
            iconOnly
            size="sm"
            className="absolute top-0 right-1 text-text-tertiary focus:ring-0 data-[focused=true]:ring-0"
            aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
            aria-pressed={showPassword}
            aria-controls={id}
            isDisabled={props.disabled}
            onPress={() => setShowPassword((visible) => !visible)}
          >
            {showPassword ? (
              <EyeDisabled aria-hidden="true" />
            ) : (
              <Eye aria-hidden="true" />
            )}
          </Button>
        ) : null}
      </div>
      {description ? (
        <p
          id={`${id}-description`}
          className="text-xs leading-5 text-text-secondary"
        >
          {description}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} role="alert" className="text-sm text-input-error">
          {error}
        </p>
      ) : null}
    </div>
  );
}
