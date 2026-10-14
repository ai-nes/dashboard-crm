"use client";

import { useDeferredValue, useState, type FormEvent } from "react";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { DropdownField } from "@/components/common/dropdown-field";
import { Button } from "@/components/tailgrids/core/button";
import {
  Dialog,
  DialogBody,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/tailgrids/core/dialog";
import { Backdrop } from "@/components/tailgrids/core/overlay";
import { CAMPAIGN_STATUS_LABEL } from "@/services/api/campaigns";
import {
  addStudentCampaign,
  getStudentCampaignOptions,
} from "@/services/api/student-campaigns";
import { formatDialogError } from "@/utils/dialog-error";
import { studentsKeys } from "@/hooks/use-students-queries";
import { DatePickerField } from "@/components/common/date-picker-field";
import { TimePickerField } from "@/components/common/time-picker-field";
import { getLocalTimeZone, now, parseDateTime } from "@internationalized/date";

export default function StudentAddCampaignDialog({
  studentId,
  studentName,
  onOpenChange,
}: {
  studentId: string;
  studentName?: string;
  onOpenChange: (open: boolean) => void;
}) {
  const [campaignId, setCampaignId] = useState<string | null>(null);
  const [selectedLabel, setSelectedLabel] = useState<string>();
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [registrationTime, setRegistrationTime] = useState(() => {
    const current = now(getLocalTimeZone()).toString();
    return { date: current.slice(0, 10), time: current.slice(11, 16) };
  });
  const deferredSearch = useDeferredValue(search.trim());
  const queryClient = useQueryClient();
  const options = useInfiniteQuery({
    queryKey: ["student-campaign-options", studentId, deferredSearch],
    queryFn: ({ pageParam, signal }) =>
      getStudentCampaignOptions(studentId, deferredSearch, pageParam, signal),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.meta.hasNextPage ? lastPage.meta.page + 1 : undefined,
    retry: false,
  });
  const mutation = useMutation({
    mutationFn: (input: { campaignId: string; registeredAt: string }) =>
      addStudentCampaign(studentId, input.campaignId, input.registeredAt),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["student-campaigns", studentId],
        }),
        queryClient.invalidateQueries({
          queryKey: ["student-campaign-options", studentId],
        }),
        queryClient.invalidateQueries({ queryKey: ["campaign-intelligence"] }),
        queryClient.invalidateQueries({
          queryKey: studentsKeys.student360(studentId),
        }),
        queryClient.invalidateQueries({
          queryKey: studentsKeys.directorStudentsRoot,
        }),
        queryClient.invalidateQueries({
          queryKey: studentsKeys.assignedStudentsRoot,
        }),
      ]);
      toast.success("Đã thêm chiến dịch cho học sinh.");
      onOpenChange(false);
    },
  });
  const campaignOptions = (options.data?.pages ?? []).flatMap((page) =>
    page.data.map((campaign) => ({
      id: campaign.id,
      label: campaign.stableCode
        ? `${campaign.stableCode} · ${campaign.title}`
        : campaign.title,
      description: CAMPAIGN_STATUS_LABEL[campaign.status],
    })),
  );
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!campaignId || mutation.isPending) return;
    setError(null);
    if (!registrationTime.date || !registrationTime.time) {
      setError("Vui lòng nhập đầy đủ ngày và giờ đăng ký.");
      return;
    }
    try {
      const registeredAt = parseDateTime(
        `${registrationTime.date}T${registrationTime.time}`,
      )
        .toDate(getLocalTimeZone())
        .toISOString();
      await mutation.mutateAsync({ campaignId, registeredAt });
    } catch (cause) {
      setError(formatDialogError(cause, "Không thể thêm chiến dịch."));
    }
  };

  return (
    <Backdrop
      isOpen
      isDismissable={!mutation.isPending}
      isKeyboardDismissDisabled={mutation.isPending}
      onOpenChange={(open) => {
        if (!mutation.isPending) onOpenChange(open);
      }}
    >
      <Dialog
        aria-label="Thêm chiến dịch cho học sinh"
        showCloseButton={!mutation.isPending}
      >
        <form onSubmit={handleSubmit}>
          <DialogHeader className="pr-8">
            <DialogTitle>Thêm chiến dịch</DialogTitle>
            <DialogDescription>
              {studentName
                ? `Ghi nhận ${studentName} tham gia chiến dịch.`
                : "Ghi nhận học sinh tham gia chiến dịch."}
            </DialogDescription>
          </DialogHeader>
          <DialogBody className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-text-primary">
                Chiến dịch <span className="text-error-500">*</span>
              </p>
              <DropdownField
                ariaLabel="Chiến dịch"
                value={campaignId}
                selectedLabel={selectedLabel}
                onChange={(id) => {
                  setCampaignId(id);
                  setSelectedLabel(
                    campaignOptions.find((option) => option.id === id)?.label,
                  );
                }}
                options={campaignOptions}
                isSearchable
                filterOptions={false}
                onSearchChange={setSearch}
                placeholder="Chọn chiến dịch"
                searchPlaceholder="Tìm tên hoặc mã chiến dịch…"
                isDisabled={mutation.isPending}
                isLoading={options.isPending}
                isError={options.isError}
                errorMessage="Không thể tải chiến dịch."
                emptyMessage="Không còn chiến dịch phù hợp để thêm."
                pagination={{
                  hasMore: options.hasNextPage,
                  isLoading: options.isFetching,
                  isError: options.isFetchNextPageError,
                  loadMore: () => options.fetchNextPage(),
                }}
              />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-text-primary">
                Thời gian đăng ký <span className="text-error-500">*</span>
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <p className="text-xs text-text-secondary">Ngày</p>
                  <DatePickerField
                    ariaLabel="Ngày đăng ký chiến dịch"
                    value={registrationTime.date}
                    onChange={(date) =>
                      setRegistrationTime((current) => ({ ...current, date }))
                    }
                    disabled={mutation.isPending}
                    required
                    className="h-10 px-3 py-2 text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <p className="text-xs text-text-secondary">Giờ</p>
                  <TimePickerField
                    ariaLabel="Giờ đăng ký chiến dịch"
                    value={registrationTime.time}
                    onChange={(time) =>
                      setRegistrationTime((current) => ({ ...current, time }))
                    }
                    disabled={mutation.isPending}
                    className="h-10 px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <p className="text-xs text-text-secondary">
                Có thể nhập ngày và giờ bằng bàn phím. Thời gian theo múi giờ
                của thiết bị.
              </p>
            </div>
            <p className="text-sm text-text-secondary">
              Chọn chiến dịch đang diễn ra hoặc đã đóng. Các chiến dịch đã tham
              gia sẽ không xuất hiện trong danh sách.
            </p>
            {options.isError && (
              <Button
                size="sm"
                appearance="outline"
                onPress={() => {
                  void options.refetch();
                }}
              >
                Tải lại danh sách
              </Button>
            )}
            {error && (
              <p role="alert" className="text-sm text-error-500">
                {error}
              </p>
            )}
          </DialogBody>
          <DialogFooter>
            <Button
              type="button"
              appearance="outline"
              isDisabled={mutation.isPending}
              onPress={() => onOpenChange(false)}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              isDisabled={
                !campaignId ||
                !registrationTime.date ||
                !registrationTime.time ||
                mutation.isPending
              }
            >
              {mutation.isPending ? "Đang thêm…" : "Thêm chiến dịch"}
            </Button>
          </DialogFooter>
        </form>
      </Dialog>
    </Backdrop>
  );
}
