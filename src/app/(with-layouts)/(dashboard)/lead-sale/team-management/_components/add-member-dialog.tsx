"use client";

import { useState, type FormEvent } from "react";

import { Button } from "@/components/tailgrids/core/button";
import { Combobox, ComboboxItem } from "@/components/tailgrids/core/combobox";
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogFooter,
  DialogTitle,
} from "@/components/tailgrids/core/dialog";
import { Backdrop } from "@/components/tailgrids/core/overlay";

import { teamMemberRoleLabel } from "./mappings";
import type { TeamMember } from "./types";

interface AddMemberDialogProps {
  teamName: string;
  candidates: TeamMember[];
  onClose: () => void;
  onSubmit: (memberId: string) => void;
}

export default function AddMemberDialog({
  teamName,
  candidates,
  onClose,
  onSubmit,
}: AddMemberDialogProps) {
  const [memberId, setMemberId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!memberId) {
      setError("Vui lòng chọn một thành viên.");
      return;
    }
    onSubmit(memberId);
  };

  return (
    <Backdrop isOpen onOpenChange={(isOpen) => !isOpen && onClose()}>
      <Dialog
        aria-label={`Thêm thành viên vào ${teamName}`}
        className="max-w-100 p-0"
      >
        <form onSubmit={handleSubmit}>
          <div className="border-b border-card-border px-5 py-4">
            <DialogTitle className="text-base font-semibold text-text-primary">
              Thêm thành viên
            </DialogTitle>
            <p className="mt-1 text-xs leading-5 text-text-tertiary">
              Chọn một thành viên chưa thuộc team nào để thêm vào {teamName}.
            </p>
          </div>

          <DialogBody className="space-y-3 px-5 py-4">
            {candidates.length === 0 ? (
              <p className="text-sm text-text-tertiary">
                Không còn thành viên nào chưa được phân công.
              </p>
            ) : (
              <label className="block space-y-1">
                <span className="text-xs font-medium text-input-label-text">
                  Thành viên
                </span>
                <Combobox
                  value={memberId}
                  onChange={(key) => setMemberId(key ? String(key) : null)}
                  aria-label="Chọn thành viên"
                  placeholder="Tìm theo tên..."
                >
                  {candidates.map((member) => (
                    <ComboboxItem
                      key={member.id}
                      id={member.id}
                      textValue={member.name}
                    >
                      {member.name}
                      <span className="ml-1 text-xs text-text-tertiary">
                        ({teamMemberRoleLabel[member.role]})
                      </span>
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
            <Button
              type="submit"
              size="sm"
              isDisabled={candidates.length === 0}
            >
              Thêm vào team
            </Button>
          </DialogFooter>
        </form>
      </Dialog>
    </Backdrop>
  );
}
