"use client";

import { Children, isValidElement, useEffect, useRef, useState, type ReactNode, type SelectHTMLAttributes } from "react";

import { DropdownField, type DropdownOption } from "./dropdown-field";

type OptionProps = {
  value?: string | number;
  label?: string;
  disabled?: boolean;
  children?: ReactNode;
};

function optionText(children: ReactNode): string {
  return Children.toArray(children).map((child) =>
    isValidElement<OptionProps>(child) ? optionText(child.props.children) : String(child),
  ).join("");
}

function getOptions(children: ReactNode, disabled = false): DropdownOption[] {
  return Children.toArray(children).flatMap((child): DropdownOption[] => {
    if (!isValidElement<OptionProps>(child)) return [];
    if (child.type === "option") {
      const label = child.props.label ?? optionText(child.props.children);
      return [{ id: String(child.props.value ?? label), label, isDisabled: disabled || child.props.disabled }];
    }
    return getOptions(child.props.children, disabled || Boolean(child.props.disabled));
  });
}

/** Keeps native form semantics while using the shared scrolling dropdown for presentation. */
export function InfiniteSelectInput({
  children,
  className,
  value,
  defaultValue,
  onChange,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  const nativeRef = useRef<HTMLSelectElement>(null);
  const options = getOptions(children);
  const defaultSelection = String(defaultValue ?? options.find((option) => !option.isDisabled)?.id ?? "");
  const [uncontrolledValue, setUncontrolledValue] = useState(() =>
    defaultSelection,
  );
  const selectedValue = value === undefined ? uncontrolledValue : String(value);
  const ariaLabel = props["aria-label"] ?? props.name ?? "Chọn giá trị";

  useEffect(() => {
    const select = nativeRef.current;
    const form = select?.form;
    const onReset = () => {
      if (value === undefined) {
        setUncontrolledValue(defaultSelection);
      }
    };
    form?.addEventListener("reset", onReset);
    return () => form?.removeEventListener("reset", onReset);
  }, [value, defaultSelection]);

  return (
    <span className="relative block min-w-0">
      <DropdownField
        id={props.id}
        ariaLabel={ariaLabel}
        ariaDescribedBy={props["aria-describedby"]}
        isDisabled={props.disabled}
        isRequired={props.required}
        isInvalid={props["aria-invalid"] === true || props["aria-invalid"] === "true"}
        options={options}
        value={selectedValue}
        triggerClassName={className}
        onChange={(nextValue) => {
          const select = nativeRef.current;
          if (!select) return;
          select.value = nextValue ?? "";
          select.dispatchEvent(new Event("change", { bubbles: true }));
        }}
      />
      <select
        {...props}
        id={undefined}
        ref={nativeRef}
        className="sr-only"
        aria-hidden="true"
        tabIndex={-1}
        value={value}
        defaultValue={defaultValue}
        onChange={(event) => {
          if (value === undefined) setUncontrolledValue(event.target.value);
          onChange?.(event);
        }}
      >
        {children}
      </select>
    </span>
  );
}
