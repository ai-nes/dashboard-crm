"use client";

import { useState, type FormEvent } from "react";

import { Button } from "@/components/tailgrids/core/button";
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogFooter,
  DialogTitle,
} from "@/components/tailgrids/core/dialog";
import { Input } from "@/components/tailgrids/core/input";
import { Backdrop } from "@/components/tailgrids/core/overlay";
import { Combobox, ComboboxItem } from "@/components/tailgrids/core/combobox";

interface CreateTeamDialogProps {
  initialName?: string;
  title: string;
  description: string;
  fieldLabel: string;
  placeholder: string;
  submitLabel: string;
  campusOptions?: { id: string; label: string }[];
  initialCampusId?: string;
  onClose: () => void;
  onSubmit: (name: string, campusId?: string) => void;
}

export default function CreateTeamDialog({
  initialName = "",
  title,
  description,
  fieldLabel,
  placeholder,
  submitLabel,
  campusOptions = [],
  initialCampusId,
  onClose,
  onSubmit,
}: CreateTeamDialogProps) {
  const [name, setName] = useState(initialName);
  const [campusId, setCampusId] = useState<string | null>(
    initialCampusId ?? null,
  );
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim()) {
      setError("Vui lòng nhập tên.");
      return;
    }
    if (campusOptions.length > 0 && !campusId) {
      setError("Vui lòng chọn cơ sở.");
      return;
    }
    onSubmit(name.trim(), campusId ?? undefined);
  };

  return (
    <Backdrop isOpen onOpenChange={(isOpen) => !isOpen && onClose()}>
      <Dialog aria-label={title} className="max-w-100 p-0">
        <form onSubmit={handleSubmit}>
          <div className="border-b border-card-border px-5 py-4">
            <DialogTitle className="text-base font-semibold text-text-primary">
              {title}
            </DialogTitle>
            <p className="mt-1 text-xs leading-5 text-text-tertiary">
              {description}
            </p>
          </div>

          <DialogBody className="space-y-3 px-5 py-4">
            <label className="block space-y-1">
              <span className="text-xs font-medium text-input-label-text">
                {fieldLabel}
              </span>
              <Input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder={placeholder}
                className="h-9 w-full px-3 py-2 text-sm"
                autoFocus
              />
            </label>
            {campusOptions.length > 0 && (
              <label className="block space-y-1">
                <span className="text-xs font-medium text-input-label-text">
                  Cơ sở
                </span>
                <Combobox
                  value={campusId}
                  onChange={(key) => setCampusId(key ? String(key) : null)}
                  aria-label="Chọn cơ sở"
                  placeholder="Chọn cơ sở hoạt động..."
                >
                  {campusOptions.map((campus) => (
                    <ComboboxItem
                      key={campus.id}
                      id={campus.id}
                      textValue={campus.label}
                    >
                      {campus.label}
                    </ComboboxItem>
                  ))}
                </Combobox>
              </label>
            )}
            {error && <p className="text-xs text-badge-error-text">{error}</p>}
          </DialogBody>

          <DialogFooter className="border-t border-card-border px-5 py-3">
            <DialogClose appearance="outline" size="sm" type="button">
              Hủy
            </DialogClose>
            <Button type="submit" size="sm">
              {submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </Dialog>
    </Backdrop>
  );
}
