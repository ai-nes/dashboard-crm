"use client";

import { Input } from "@/components/tailgrids/core/input";
import { Label } from "@/components/tailgrids/core/label";
import { TextField } from "@/components/tailgrids/core/text-field";

interface FormTextFieldProps {
  label: string;
  name: string;
  type?: "text" | "email" | "password";
  placeholder?: string;
  autoComplete?: string;
  disabled?: boolean;
  autoFocus?: boolean;
}

/** Labelled input used by the activation form. */
export function FormTextField({
  label,
  name,
  type = "text",
  placeholder,
  autoComplete,
  disabled,
  autoFocus,
}: FormTextFieldProps) {
  return (
    <TextField
      name={name}
      type={type}
      required
      disabled={disabled}
      autoComplete={autoComplete}
      autoFocus={autoFocus}
      className="w-full flex-col gap-1.5"
    >
      <Label className="text-sm font-medium text-input-label-text">
        {label}
      </Label>
      <Input placeholder={placeholder} className="w-full px-3 py-2.5 text-sm" />
    </TextField>
  );
}
