"use client";

import { Search1 } from "@tailgrids/icons";
import type { InputGroupInputProps } from "@/components/tailgrids/core/input-group";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/tailgrids/core/input-group";
import { cn } from "@/utils/cn";

interface AdminSearchInputProps extends Omit<
  InputGroupInputProps,
  "className" | "type"
> {
  className?: string;
  inputClassName?: string;
}

export function AdminSearchInput({
  className,
  inputClassName,
  ...inputProps
}: AdminSearchInputProps) {
  return (
    <InputGroup className={cn("h-9", className)}>
      <InputGroupAddon align="inline-start" className="pr-0 text-icon-tertiary">
        <Search1 size={17} aria-hidden="true" />
      </InputGroupAddon>
      <InputGroupInput
        {...inputProps}
        type="search"
        className={cn("pl-2 text-sm", inputClassName)}
      />
    </InputGroup>
  );
}
