"use client";

import { Plus } from "@tailgrids/icons";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/tailgrids/core/badge";
import { Button } from "@/components/tailgrids/core/button";
import { Card, CardTitle } from "@/components/tailgrids/core/card";
import { getCurrentUser, type CurrentUser } from "@/services/api/auth";
import {
  createSnippet,
  deleteSnippet,
  listSnippets,
  updateSnippet,
  type SnippetDraft,
  type SnippetRecord,
} from "@/services/api/snippets";

import SnippetCreateDialog from "./snippet-create-dialog";
import SnippetList from "./snippet-list";

const createEmptyDraft = (): SnippetDraft => ({
  name: "",
  content: "",
  sharing: "public",
});

function getDraftForSnippet(snippet: SnippetRecord | null): SnippetDraft {
  if (!snippet) return createEmptyDraft();

  return {
    name: snippet.name,
    content: snippet.content,
    sharing: snippet.sharing,
  };
}

export default function SnippestPage() {
  const [snippets, setSnippets] = useState<SnippetRecord[]>([]);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [snippetToEdit, setSnippetToEdit] = useState<SnippetRecord | null>(
    null,
  );
  const [draft, setDraft] = useState<SnippetDraft>(createEmptyDraft);

  const loadSnippets = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const [response, user] = await Promise.all([
        listSnippets(),
        getCurrentUser(),
      ]);
      setSnippets(response.snippets);
      setCurrentUser(user);
    } catch (error) {
      setLoadError(
        error instanceof Error ? error.message : "Không thể tải snippet.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadSnippets();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [loadSnippets]);

  const openCreateDialog = () => {
    setSnippetToEdit(null);
    setDraft(createEmptyDraft());
    setIsDialogOpen(true);
  };

  const openEditDialog = (snippet: SnippetRecord) => {
    setSnippetToEdit(snippet);
    setDraft(getDraftForSnippet(snippet));
    setIsDialogOpen(true);
  };

  const updateDraft = (field: keyof SnippetDraft, value: string) => {
    setDraft(
      (currentDraft) => ({ ...currentDraft, [field]: value }) as SnippetDraft,
    );
  };

  const handleDialogChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) setSnippetToEdit(null);
  };

  const saveSnippet = async (nextDraft: SnippetDraft) => {
    setIsSaving(true);
    try {
      if (snippetToEdit) {
        await updateSnippet(
          snippetToEdit.id,
          nextDraft,
          snippetToEdit.modifiedAt,
        );
        toast.success("Đã lưu thay đổi snippet.");
      } else {
        await createSnippet(nextDraft);
        toast.success("Đã tạo snippet.");
      }
      await loadSnippets();
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
    try {
      await createSnippet({
        name: `${snippet.name} (Bản sao)`,
        content: snippet.content,
        sharing: snippet.sharing,
      });
      toast.success("Đã nhân bản snippet.");
      await loadSnippets();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Không thể nhân bản snippet.",
      );
    }
  };

  const removeSnippet = async (snippet: SnippetRecord) => {
    if (!window.confirm(`Xóa snippet “${snippet.name}”?`)) return;
    try {
      await deleteSnippet(snippet.id, snippet.modifiedAt);
      toast.success("Đã xóa snippet.");
      await loadSnippets();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Không thể xóa snippet.",
      );
    }
  };

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
        <Button size="sm" className="shrink-0" onPress={openCreateDialog}>
          <Plus size={16} aria-hidden="true" />
          Tạo snippet
        </Button>
      </Card>

      {loadError ? (
        <Card className="border-button-error-outline-stroke p-6 text-sm text-button-error-outline-text">
          <p>{loadError}</p>
          <button
            type="button"
            className="mt-3 underline"
            onClick={() => void loadSnippets()}
          >
            Thử lại
          </button>
        </Card>
      ) : (
        <SnippetList
          snippets={snippets}
          currentUserId={currentUser?.user ?? currentUser?.email}
          isLoading={isLoading}
          onDuplicate={duplicateSnippet}
          onDelete={removeSnippet}
          onEdit={openEditDialog}
        />
      )}

      <SnippetCreateDialog
        isOpen={isDialogOpen}
        onOpenChange={handleDialogChange}
        draft={draft}
        ownerName={snippetToEdit?.owner ?? currentUser?.full_name ?? "Bạn"}
        onDraftChange={updateDraft}
        snippet={snippetToEdit}
        onSave={saveSnippet}
        isSaving={isSaving}
      />
    </main>
  );
}
