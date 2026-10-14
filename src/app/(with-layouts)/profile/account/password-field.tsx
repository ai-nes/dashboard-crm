"use client";

import { useState } from "react";
import { Eye, EyeDisabled } from "@tailgrids/icons";
import { Button } from "@/components/tailgrids/core/button";
import { Input } from "@/components/tailgrids/core/input";
import { Label } from "@/components/tailgrids/core/label";
import { TextField } from "@/components/tailgrids/core/text-field";

export default function PasswordField({
  name,
  label,
  disabled,
  minLength,
  maxLength = 128,
  autoComplete,
}: {
  name: string;
  label: string;
  disabled: boolean;
  minLength?: number;
  maxLength?: number;
  autoComplete: "current-password" | "new-password";
}) {
  const [visible, setVisible] = useState(false);
  return (
    <TextField className="w-full gap-2.5" required disabled={disabled}>
      <Label>{label}</Label>
      <div className="relative">
        <Input
          name={name}
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          minLength={minLength}
          maxLength={maxLength}
          required
          className="w-full pr-11"
        />
        <Button
          type="button"
          size="sm"
          iconOnly
          appearance="ghost"
          className="absolute right-1 top-1/2 size-8 -translate-y-1/2 text-text-tertiary"
          aria-label={`${visible ? "Ẩn" : "Hiện"} ${label.toLocaleLowerCase("vi-VN")}`}
          aria-pressed={visible}
          isDisabled={disabled}
          onPress={() => setVisible((current) => !current)}
        >
          {visible ? (
            <EyeDisabled aria-hidden="true" />
          ) : (
            <Eye aria-hidden="true" />
          )}
        </Button>
      </div>
    </TextField>
  );
}
