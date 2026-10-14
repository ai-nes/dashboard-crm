"use client";

import { useProfileOptions } from "@/hooks/use-profile-options";
import type { ProfileOptionType } from "@/services/api/profile-options";
import { Combobox, ComboboxItem } from "@/components/tailgrids/core/combobox";
import { Button } from "@/components/tailgrids/core/button";
import { DropdownField } from "./dropdown-field";
import { profileOptionItems } from "./profile-option-items";

export function ProfileOptionField({
  type,
  label,
  value,
  onChange,
  isDisabled = false,
}: {
  type: ProfileOptionType;
  label: string;
  value: string;
  onChange: (value: string) => void;
  isDisabled?: boolean;
}) {
  const query = useProfileOptions(type);
  const items = profileOptionItems(query.data ?? [], value);
  return (
    <div className="min-w-0">
      <dt className="text-xs text-text-tertiary">{label}</dt>
      {type === "idIssuedPlace" ? (
        <Combobox
          className="mt-1.5"
          aria-label={label}
          allowsCustomValue
          inputValue={value}
          onInputChange={onChange}
          value={value || null}
          onChange={(key) => {
            if (key !== null) onChange(String(key));
          }}
          isDisabled={isDisabled}
          placeholder="Chọn hoặc nhập theo giấy tờ"
        >
          {items
            .filter((item) => item.id)
            .map((item) => (
              <ComboboxItem key={item.id} id={item.id} textValue={item.label}>
                {item.label}
              </ComboboxItem>
            ))}
        </Combobox>
      ) : (
        <DropdownField
          className="mt-1.5"
          ariaLabel={label}
          isSearchable
          options={items}
          value={value}
          selectedLabel={value || "Chưa nhập"}
          onChange={(next) => onChange(next ?? "")}
          isDisabled={isDisabled || !query.canRead}
          isLoading={query.isLoading}
          isError={query.isError}
          errorMessage="Chưa tải được danh mục. Hãy thử lại."
          placeholder={`Chọn ${label.toLocaleLowerCase("vi-VN")}`}
        />
      )}
      {query.isError && (
        <div role="alert" className="mt-1 text-xs text-error-500">
          Chưa tải được danh mục.{" "}
          <Button
            size="xs"
            appearance="ghost"
            onPress={() => void query.refetch()}
          >
            Thử lại
          </Button>
        </div>
      )}
      {!query.canRead && (
        <p className="mt-1 text-xs text-text-tertiary">
          Tài khoản chưa có quyền đọc danh mục.
        </p>
      )}
    </div>
  );
}
