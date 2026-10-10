"use client";

import { Plus } from "@tailgrids/icons";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { DeleteRecordDialog } from "@/components/common/delete-record-dialog";
import { useAuth } from "@/components/common/auth/auth-provider";
import { getCrmDoctypePermissions } from "@/components/common/auth/permissions";
import { Badge } from "@/components/tailgrids/core/badge";
import { Button } from "@/components/tailgrids/core/button";
import { Card, CardTitle } from "@/components/tailgrids/core/card";
import {
  createSnippet,
  deleteSnippet,
  listSnippets,
  updateSnippet,
  type SnippetDraft,
  type ListSnippetsParams,
  type ListSnippetsResponse,
  type SnippetRecord,
  type SnippetSharing,
} from "@/services/api/snippets";

import SnippetCreateDialog from "./snippet-create-dialog";
import SnippetList from "./snippet-list";

const SNIPPET_PAGE_SIZE = 5;
const INITIAL_LIST_PARAMS: ListSnippetsParams = {
  page: 1,
  pageSize: SNIPPET_PAGE_SIZE,
  scope: "all",
};

const EMPTY_LIST_RESPONSE: ListSnippetsResponse = {
  snippets: [],
  owners: [],
  total: 0,
  totalAll: 0,
  totalMine: 0,
  page: 1,
  pageSize: SNIPPET_PAGE_SIZE,
  totalPages: 1,
  hasNextPage: false,
};

const createEmptyDraft = (
  sharing: SnippetSharing = "public",
): SnippetDraft => ({
  internalName: "",
  snippetText: "",
  shortcut: "",
  sharing,
});

function getDraftForSnippet(
  snippet: SnippetRecord | null,
  lockedSharing?: SnippetSharing,
): SnippetDraft {
  if (!snippet) return createEmptyDraft(lockedSharing);

  return {
    internalName: snippet.internalName ?? "",
    snippetText: snippet.snippetText ?? "",
    shortcut: snippet.shortcut ?? "",
    sharing: lockedSharing ?? snippet.sharing,
  };
}

function getDuplicateShortcut(
  snippet: SnippetRecord,
  snippets: SnippetRecord[],
) {
  const usedShortcuts = new Set(
    snippets.map((item) => item.shortcut.trim().toLocaleLowerCase()),
  );
  const baseShortcut = `${snippet.shortcut}-copy`;
  let shortcut = baseShortcut;
  let suffix = 2;
  while (usedShortcuts.has(shortcut.toLocaleLowerCase())) {
    shortcut = `${baseShortcut}-${suffix}`;
    suffix += 1;
  }
  return shortcut;
}

export default function SnippestPage({
  canCreate = true,
  lockedSharing,
}: {
  canCreate?: boolean;
  lockedSharing?: SnippetSharing;
} = {}) {
  const { user, isLoading: isAuthLoading } = useAuth();
  const permissions = getCrmDoctypePermissions(user, "CRM Snippet");
  const canReadSnippets = !isAuthLoading && permissions.canRead;
  const canCreateSnippet = canCreate && permissions.canCreate;
  const canUpdateSnippet = permissions.canUpdate;
  const canDeleteSnippet = permissions.canDelete;
  const [snippets, setSnippets] = useState<SnippetRecord[]>([]);
  const [listResponse, setListResponse] =
    useState<ListSnippetsResponse>(EMPTY_LIST_RESPONSE);
  const [listParams, setListParams] =
    useState<ListSnippetsParams>(INITIAL_LIST_PARAMS);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [snippetToEdit, setSnippetToEdit] = useState<SnippetRecord | null>(
    null,
  );
  const [snippetToDelete, setSnippetToDelete] = useState<SnippetRecord | null>(
    null,
  );
  const [isDeleting, setIsDeleting] = useState(false);
  const [draft, setDraft] = useState<SnippetDraft>(createEmptyDraft);
  const requestId = useRef(0);

  const loadSnippets = useCallback(
    async (params: ListSnippetsParams) => {
      if (!canReadSnippets) return;
      const nextRequestId = ++requestId.current;
      setIsLoading(true);
      setLoadError(null);
      try {
        const response = await listSnippets(params);
        if (nextRequestId !== requestId.current) return;
        setSnippets(response.snippets);
        setListResponse(response);
      } catch (error) {
        if (nextRequestId !== requestId.current) return;
        setLoadError(
          error instanceof Error ? error.message : "Không thể tải snippet.",
        );
      } finally {
        if (nextRequestId === requestId.current) setIsLoading(false);
      }
    },
    [canReadSnippets],
  );

  useEffect(() => {
    if (isAuthLoading || !canReadSnippets) return;
    const timer = window.setTimeout(() => {
      void loadSnippets(listParams);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [canReadSnippets, isAuthLoading, listParams, loadSnippets]);

  const openCreateDialog = () => {
    if (!canCreateSnippet) return;
    setSnippetToEdit(null);
    setDraft(createEmptyDraft(lockedSharing));
    setIsDialogOpen(true);
  };

  const openEditDialog = (snippet: SnippetRecord) => {
    if (!canUpdateSnippet || !snippet.canEdit) return;
    setSnippetToEdit(snippet);
    setDraft(getDraftForSnippet(snippet, lockedSharing));
    setIsDialogOpen(true);
  };

  const updateDraft = (field: keyof SnippetDraft, value: string) => {
    setDraft(
      (currentDraft) => ({ ...currentDraft, [field]: value }) as SnippetDraft,
    );
  };

  const handleDialogChange = (open: boolean) => {
    if (
      open &&
      (snippetToEdit
        ? !canUpdateSnippet || !snippetToEdit.canEdit
        : !canCreateSnippet)
    ) {
      return;
    }
    setIsDialogOpen(open);
    if (!open) setSnippetToEdit(null);
  };

  const saveSnippet = async (nextDraft: SnippetDraft) => {
    if (
      snippetToEdit
        ? !canUpdateSnippet || !snippetToEdit.canEdit
        : !canCreateSnippet
    ) {
      return;
    }
    setIsSaving(true);
    const normalizedDraft = lockedSharing
      ? { ...nextDraft, sharing: lockedSharing }
      : nextDraft;
    try {
      if (snippetToEdit) {
        await updateSnippet(
          snippetToEdit.id,
          normalizedDraft,
          snippetToEdit.modifiedAt,
        );
        toast.success("Đã lưu thay đổi snippet.");
      } else {
        await createSnippet(normalizedDraft);
        toast.success("Đã tạo snippet.");
      }
      await loadSnippets(listParams);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Không thể lưu snippet.",
      );
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  const duplicateSnippet = async (snippet: SnippetRecord) => {
    if (!canCreateSnippet) return;
    try {
      await createSnippet({
        internalName: `${snippet.internalName} (Bản sao)`,
        snippetText: snippet.snippetText,
        shortcut: getDuplicateShortcut(snippet, snippets),
        sharing: lockedSharing ?? snippet.sharing,
      });
      toast.success("Đã nhân bản snippet.");
      await loadSnippets(listParams);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Không thể nhân bản snippet.",
      );
    }
  };

  const requestDeleteSnippet = (snippet: SnippetRecord) => {
    if (!canDeleteSnippet || !snippet.canEdit) return;
    setSnippetToDelete(snippet);
  };

  const confirmDeleteSnippet = async () => {
    if (!snippetToDelete) return;
    if (!canDeleteSnippet || !snippetToDelete.canEdit) return;

    setIsDeleting(true);
    try {
      await deleteSnippet(snippetToDelete.id, snippetToDelete.modifiedAt);
      toast.success("Đã xóa snippet.");
      setSnippetToDelete(null);
      await loadSnippets(listParams);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Không thể xóa snippet.",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  if (isAuthLoading) {
    return (
      <main id="main-content" className="min-w-0 p-6">
        <p className="text-sm text-text-tertiary" role="status">
          Đang kiểm tra quyền truy cập snippet…
        </p>
      </main>
    );
  }

  if (!canReadSnippets) {
    return (
      <main id="main-content" className="min-w-0 p-6">
        <Card className="border-warning-200 bg-badge-warning-background p-5 text-badge-warning-text">
          <p className="font-semibold text-base">
            Bạn không có quyền xem snippet.
          </p>
        </Card>
      </main>
    );
  }

  return (
    <main
      id="main-content"
      className="min-w-0 space-y-5 px-2 py-4 pb-8 lg:px-6"
    >
      <Card className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:p-6">
        <div>
          <Badge color="primary">MẪU &amp; NỘI DUNG</Badge>
          <CardTitle level={1} className="mt-4 text-[28px] leading-8">
            Snippet
          </CardTitle>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">
            Quản lý các đoạn nội dung dùng nhanh trong quá trình tư vấn học
            sinh.
          </p>
        </div>
        {canCreateSnippet ? (
          <Button size="sm" className="shrink-0" onPress={openCreateDialog}>
            <Plus size={16} aria-hidden="true" />
            Tạo snippet
          </Button>
        ) : null}
      </Card>

      {loadError ? (
        <Card className="border-button-error-outline-stroke p-6 text-sm text-button-error-outline-text">
          <p>{loadError}</p>
          <button
            type="button"
            className="mt-3 underline"
            onClick={() => void loadSnippets(listParams)}
          >
            Thử lại
          </button>
        </Card>
      ) : (
        <SnippetList
          snippets={snippets}
          listResponse={listResponse}
          listParams={listParams}
          canCreate={canCreateSnippet}
          canUpdate={canUpdateSnippet}
          canDelete={canDeleteSnippet}
          currentUserId={user?.crm_user_id ?? user?.user ?? user?.email}
          isLoading={isLoading}
          onListParamsChange={(nextParams) => {
            setListParams({
              ...nextParams,
              page: nextParams.page ?? 1,
              pageSize: SNIPPET_PAGE_SIZE,
            });
          }}
          onDuplicate={duplicateSnippet}
          onDelete={requestDeleteSnippet}
          onEdit={openEditDialog}
        />
      )}

      {snippetToDelete && canDeleteSnippet && snippetToDelete.canEdit ? (
        <DeleteRecordDialog
          isOpen={Boolean(snippetToDelete)}
          recordType="snippet"
          recordName={snippetToDelete.internalName || snippetToDelete.code}
          isDeleting={isDeleting}
          onOpenChange={(open) => {
            if (!open && !isDeleting) setSnippetToDelete(null);
          }}
          onConfirm={confirmDeleteSnippet}
        />
      ) : null}

      <SnippetCreateDialog
        isOpen={
          isDialogOpen &&
          (snippetToEdit
            ? canUpdateSnippet && snippetToEdit.canEdit
            : canCreateSnippet)
        }
        onOpenChange={handleDialogChange}
        draft={draft}
        ownerName={snippetToEdit?.owner ?? user?.full_name ?? "Bạn"}
        sharingLocked={lockedSharing !== undefined}
        lockedSharing={lockedSharing}
        onDraftChange={updateDraft}
        snippet={snippetToEdit}
        onSave={saveSnippet}
        isSaving={isSaving}
      />
    </main>
  );
}
