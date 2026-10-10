"use client";

import { useState } from "react";
import { Button } from "@/components/tailgrids/core/button";
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/tailgrids/core/dialog";
import { Backdrop } from "@/components/tailgrids/core/overlay";
import {
  Select,
  SelectContent,
  SelectIndicator,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/tailgrids/core/select";
import type { RoutingTeamOption } from "./lead-routing-team-settings";

type Props = {
  options: RoutingTeamOption[];
  isSaving: boolean;
  onAdd: (team: RoutingTeamOption) => void;
  onClose: () => void;
};

export default function LeadRoutingProvinceDialog({
  options,
  isSaving,
  onAdd,
  onClose,
}: Props) {
  const [province, setProvince] = useState("");
  const [teamId, setTeamId] = useState("");
  const provinces = [
    ...new Map(
      options.map((team) => [team.province, team.provinceLabel]),
    ).entries(),
  ];
  const teams = options.filter((team) => team.province === province);
  const selectedTeam = teams.find((team) => team.id === teamId);

  return (
    <Backdrop
      isOpen
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <Dialog aria-label="Thêm tỉnh" className="max-w-lg p-0">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            if (!isSaving && selectedTeam) onAdd(selectedTeam);
          }}
        >
          <DialogHeader className="border-b border-card-border px-5 py-5 pr-12">
            <DialogTitle>Thêm tỉnh</DialogTitle>
          </DialogHeader>
          <DialogBody className="space-y-4 px-5 py-5">
            <Select
              value={provinces.some(([id]) => id === province) ? province : ""}
              placeholder="Chọn tỉnh/thành phố"
              isDisabled={isSaving}
              onChange={(value) => {
                setProvince(value ? String(value) : "");
                setTeamId("");
              }}
            >
              <SelectLabel>Tỉnh/thành phố</SelectLabel>
              <SelectTrigger>
                <SelectValue />
                <SelectIndicator />
              </SelectTrigger>
              <SelectContent>
                {provinces.map(([id, label]) => (
                  <SelectItem key={id} id={id} textValue={label}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={selectedTeam?.id ?? ""}
              placeholder="Chọn team"
              isDisabled={isSaving || !teams.length}
              onChange={(value) => setTeamId(value ? String(value) : "")}
            >
              <SelectLabel>Team nhận Lead</SelectLabel>
              <SelectTrigger>
                <SelectValue />
                <SelectIndicator />
              </SelectTrigger>
              <SelectContent>
                {teams.map((team) => (
                  <SelectItem key={team.id} id={team.id} textValue={team.label}>
                    {team.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </DialogBody>
          <DialogFooter className="border-t border-card-border px-5 py-4">
            <DialogClose appearance="outline" size="sm">
              Hủy
            </DialogClose>
            <Button
              type="submit"
              size="sm"
              isDisabled={isSaving || !selectedTeam}
            >
              Thêm
            </Button>
          </DialogFooter>
        </form>
      </Dialog>
    </Backdrop>
  );
}
