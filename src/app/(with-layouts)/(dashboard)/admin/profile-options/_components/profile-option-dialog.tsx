"use client";

import { Dialog } from "@/components/tailgrids/core/dialog";
import { Backdrop } from "@/components/tailgrids/core/overlay";
import type {
  ProfileOption,
  ProfileOptionInput,
  ProfileOptionType,
} from "@/services/api/profile-options";
import ProfileOptionForm from "./profile-option-form";

export default function ProfileOptionDialog({
  type,
  initial,
  busy,
  onSave,
  onClose,
}: {
  type: ProfileOptionType;
  initial: ProfileOption | null;
  busy: boolean;
  onSave: (input: ProfileOptionInput) => void;
  onClose: () => void;
}) {
  return (
    <Backdrop
      isOpen
      isDismissable={!busy}
      isKeyboardDismissDisabled={busy}
      onOpenChange={(open) => {
        if (!open && !busy) onClose();
      }}
    >
      <Dialog
        showCloseButton={!busy}
        className="max-h-[calc(100dvh-2rem)] overflow-y-auto"
      >
        <ProfileOptionForm
          type={type}
          initial={initial}
          busy={busy}
          onSave={onSave}
          onCancel={onClose}
        />
      </Dialog>
    </Backdrop>
  );
}
