"use client";

import { Pencil1, Plus, Trash1 } from "@tailgrids/icons";
import { useCallback, useDeferredValue, useState } from "react";
import { toast } from "sonner";

import { DeleteRecordDialog } from "@/components/common/delete-record-dialog";
import { Button } from "@/components/tailgrids/core/button";
import { Pagination } from "@/components/tailgrids/core/pagination";
import {
  Select,
  SelectContent,
  SelectIndicator,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/tailgrids/core/select";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRoot,
  TableRow,
} from "@/components/tailgrids/core/table";
import {
  TabContent,
  TabList,
  TabRoot,
  TabTrigger,
} from "@/components/tailgrids/core/tabs";
import {
  useDeleteProvinceMutation,
  useDeleteSchoolAreaMutation,
  useDeleteSchoolMutation,
  useDeleteWardMutation,
  useGeographyOptionsQuery,
  useProvincesQuery,
  useSchoolAreasQuery,
  useSchoolsQuery,
  useUpdateSchoolAreaMutation,
  useWardsQuery,
} from "@/hooks/use-reference-catalog-queries";
import type {
  GeographyOptions,
  ProvinceOption,
  SchoolAreaOption,
  SchoolOption,
  WardOption,
} from "@/services/api/reference-catalog";

import { AdmissionCatalogPanel } from "./admission-catalog-panel";
import { CatalogOrderingPanel } from "./catalog-ordering-panel";
import {
  CatalogEmpty,
  CatalogError,
  CatalogLoading,
  CatalogToolbar,
  type StatusFilter,
} from "./reference-catalog-ui";
import { ProvinceEditorDialog } from "./province-editor-dialog";
import { SchoolAreaEditorDialog } from "./school-area-editor-dialog";
import { SchoolEditorDialog } from "./school-editor-dialog";
import { WardEditorDialog } from "./ward-editor-dialog";

const PAGE_SIZE = 8;
type GeoTab = "provinces" | "wards" | "schools" | "areas";

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}

function statusValue(status: StatusFilter): boolean | undefined {
  if (status === "enabled") return true;
  if (status === "disabled") return false;
  return undefined;
}

export function GeographyCatalogManagement({
  canManage,
  enabled,
}: {
  canManage: boolean;
  enabled: boolean;
}) {
  const [activeTab, setActiveTab] = useState<GeoTab>("provinces");
  const [wardPrefill, setWardPrefill] = useState<ProvinceOption | null>(null);
  const optionsQuery = useGeographyOptionsQuery({ enabled });
  const options = optionsQuery.data;
  const openWardForProvince = useCallback((province: ProvinceOption) => {
    setWardPrefill(province);
    setActiveTab("wards");
  }, []);
  const clearWardPrefill = useCallback(() => setWardPrefill(null), []);

  return (
    <TabRoot
      defaultValue="provinces"
      value={activeTab}
      onValueChange={(value) => setActiveTab(value as GeoTab)}
      variant="minimal"
      className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-card-border bg-card-background"
    >
      <TabList className="gap-2 px-4">
        <TabTrigger value="provinces">Tỉnh/thành</TabTrigger>
        <TabTrigger value="wards">Xã/phường</TabTrigger>
        <TabTrigger value="schools">Trường THPT</TabTrigger>
        <TabTrigger value="areas">Khu vực trường</TabTrigger>
      </TabList>
      <TabContent value="provinces" className="min-h-0 flex-1 overflow-hidden p-0">
        {activeTab === "provinces" && (
          <ProvinceCatalogPanel
            canManage={canManage}
            enabled={enabled}
            regions={options?.regions ?? []}
            onCreateWardForProvince={openWardForProvince}
          />
        )}
      </TabContent>
      <TabContent value="wards" className="min-h-0 flex-1 overflow-hidden p-0">
        {activeTab === "wards" && (
          <WardCatalogPanel
            canManage={canManage}
            enabled={enabled}
            options={options}
            initialProvince={wardPrefill}
            onInitialProvinceHandled={clearWardPrefill}
          />
        )}
      </TabContent>
      <TabContent value="schools" className="min-h-0 flex-1 overflow-hidden p-0">
        {activeTab === "schools" && (
          <SchoolCatalogPanel
            canManage={canManage}
            enabled={enabled}
            options={options}
          />
        )}
      </TabContent>
      <TabContent value="areas" className="min-h-0 flex-1 overflow-hidden p-0">
        {activeTab === "areas" && (
          <SchoolAreaCatalogPanel canManage={canManage} enabled={enabled} />
        )}
      </TabContent>
    </TabRoot>
  );
}

function ProvinceCatalogPanel({
  canManage,
  enabled,
  regions,
  onCreateWardForProvince,
}: {
  canManage: boolean;
  enabled: boolean;
  regions: GeographyOptions["regions"];
  onCreateWardForProvince: (province: ProvinceOption) => void;
}) {
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [page, setPage] = useState(1);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorKey, setEditorKey] = useState(0);
  const [selected, setSelected] = useState<ProvinceOption | null>(null);
  const [toDelete, setToDelete] = useState<ProvinceOption | null>(null);
  const query = useProvincesQuery({
    search: deferredSearch,
    start: (page - 1) * PAGE_SIZE,
    pageLength: PAGE_SIZE,
    enabled,
  });
  const deleteMutation = useDeleteProvinceMutation();
  const rows = query.data?.provinces ?? [];
  const total = query.data?.total ?? rows.length;

  const openCreate = () => {
    setSelected(null);
    setEditorKey((current) => current + 1);
    setEditorOpen(true);
  };
  const openEdit = (record: ProvinceOption) => {
    setSelected(record);
    setEditorKey((current) => current + 1);
    setEditorOpen(true);
  };
  const confirmDelete = async () => {
    if (!toDelete) return;
    try {
      await deleteMutation.mutateAsync({
        name: toDelete.id,
        expectedModified: toDelete.modified,
      });
      toast.success(`Đã xóa ${toDelete.name}.`);
      setToDelete(null);
      setPage(1);
    } catch (error) {
      toast.error(errorMessage(error, "Không thể xóa tỉnh/thành."));
    }
  };

  return (
    <>
      <AdmissionCatalogPanel
        title="Tỉnh/thành"
        description="Danh mục địa bàn cấp tỉnh dùng trong hồ sơ và dữ liệu trường."
        showHeader={false}
        count={total}
        countLabel="tỉnh/thành"
        canManage={canManage}
        createLabel="Thêm tỉnh/thành"
        onCreate={openCreate}
        isBusy={query.isPending || deleteMutation.isPending}
        className="h-full rounded-none border-0 shadow-none"
      >
        <CatalogToolbar
          search={search}
          onSearchChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
          searchPlaceholder="Tìm mã hoặc tên tỉnh/thành"
          searchLabel="Tìm tỉnh/thành"
          actions={canManage ? (
            <Button size="sm" onPress={openCreate}>
              <Plus size={16} aria-hidden="true" />
              Thêm tỉnh/thành
            </Button>
          ) : undefined}
        />
        {query.isPending ? (
          <CatalogLoading label="Đang tải tỉnh/thành..." />
        ) : query.error ? (
          <CatalogError
            message={errorMessage(query.error, "Không thể tải tỉnh/thành.")}
            onRetry={() => void query.refetch()}
          />
        ) : rows.length === 0 ? (
          <CatalogEmpty
            title={search.trim() ? "Không tìm thấy tỉnh/thành" : "Chưa có tỉnh/thành"}
            description={search.trim() ? "Thử đổi từ khóa tìm kiếm." : "Tạo tỉnh/thành đầu tiên để bắt đầu."}
            action={!search.trim() && canManage ? openCreate : undefined}
            actionLabel="Thêm tỉnh/thành"
          />
        ) : (
          <TableRoot fullBleed className="w-full min-w-[720px] border-0">
            <TableHeader className="bg-background-gray-secondary/35">
              <TableRow>
                <TableHead>Mã</TableHead>
                <TableHead>Tên tỉnh/thành</TableHead>
                <TableHead>Vùng miền</TableHead>
                <TableHead>Loại</TableHead>
                <TableHead className="w-24 text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id} className="group hover:bg-background-gray-secondary/30">
                  <TableCell className="align-top font-mono text-xs font-bold tracking-wide text-text-secondary">
                    {row.code}
                  </TableCell>
                  <TableCell className="align-top font-medium text-text-primary">{row.name}</TableCell>
                  <TableCell className="align-top text-sm text-text-secondary">
                    {row.regionName || "Chưa phân vùng"}
                  </TableCell>
                  <TableCell className="align-top text-sm text-text-secondary">
                    {row.cityType === "Centrally Controlled City" ? "Thành phố trực thuộc Trung ương" : "Tỉnh"}
                  </TableCell>
                  <TableCell className="align-top">
                    <CatalogActions
                      canManage={canManage}
                      recordName={row.name}
                      onEdit={() => openEdit(row)}
                      onDelete={() => setToDelete(row)}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </TableRoot>
        )}
        <CatalogPagination
          currentPage={page}
          total={total}
          isFetching={query.isFetching}
          onPageChange={setPage}
        />
      </AdmissionCatalogPanel>
      <ProvinceEditorDialog
        key={`province-${editorKey}`}
        isOpen={editorOpen}
        record={selected}
        regions={regions}
        onCreated={onCreateWardForProvince}
        onOpenChange={(open) => {
          setEditorOpen(open);
          if (!open) setSelected(null);
        }}
      />
      <DeleteRecordDialog
        isOpen={Boolean(toDelete)}
        recordType="tỉnh/thành"
        recordName={toDelete?.name ?? ""}
        isDeleting={deleteMutation.isPending}
        onOpenChange={(open) => {
          if (!open && !deleteMutation.isPending) setToDelete(null);
        }}
        onConfirm={confirmDelete}
      >
        <p className="text-sm text-text-secondary">
          Chỉ bản ghi chưa được liên kết với dữ liệu khác mới có thể xóa.
        </p>
      </DeleteRecordDialog>
    </>
  );
}

function WardCatalogPanel({
  canManage,
  enabled,
  options,
  initialProvince,
  onInitialProvinceHandled,
}: {
  canManage: boolean;
  enabled: boolean;
  options?: GeographyOptions;
  initialProvince: ProvinceOption | null;
  onInitialProvinceHandled: () => void;
}) {
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [province, setProvince] = useState(initialProvince?.id ?? "all");
  const [page, setPage] = useState(1);
  const [editorOpen, setEditorOpen] = useState(Boolean(initialProvince));
  const [editorKey, setEditorKey] = useState(0);
  const [editorInitialProvince, setEditorInitialProvince] = useState<string | undefined>(initialProvince?.id);
  const [editorProvince, setEditorProvince] = useState<ProvinceOption | null>(initialProvince);
  const [selected, setSelected] = useState<WardOption | null>(null);
  const [toDelete, setToDelete] = useState<WardOption | null>(null);
  const query = useWardsQuery({
    search: deferredSearch,
    province: province === "all" ? undefined : province,
    start: (page - 1) * PAGE_SIZE,
    pageLength: PAGE_SIZE,
    enabled,
  });
  const deleteMutation = useDeleteWardMutation();
  const rows = query.data?.wards ?? [];
  const total = query.data?.total ?? rows.length;
  const availableProvinces = options?.provinces ?? [];
  const dialogProvinces = editorProvince && !availableProvinces.some((item) => item.id === editorProvince.id)
    ? [editorProvince, ...availableProvinces]
    : availableProvinces;
  const openEditor = useCallback((record: WardOption | null, preferredProvince?: string) => {
    setSelected(record);
    setEditorInitialProvince(preferredProvince);
    setEditorKey((current) => current + 1);
    setEditorOpen(true);
  }, []);
  const confirmDelete = async () => {
    if (!toDelete) return;
    try {
      await deleteMutation.mutateAsync({ name: toDelete.id, expectedModified: toDelete.modified });
      toast.success(`Đã xóa ${toDelete.name}.`);
      setToDelete(null);
      setPage(1);
    } catch (error) {
      toast.error(errorMessage(error, "Không thể xóa xã/phường."));
    }
  };

  return (
    <>
      <AdmissionCatalogPanel
        title="Xã/phường"
        description="Danh mục xã, phường và thị trấn liên kết trực tiếp với tỉnh/thành."
        showHeader={false}
        count={total}
        countLabel="xã/phường"
        canManage={canManage}
        createLabel="Thêm xã/phường"
        onCreate={() => openEditor(null, province === "all" ? undefined : province)}
        isBusy={query.isPending || deleteMutation.isPending}
        className="h-full rounded-none border-0 shadow-none"
      >
        <CatalogToolbar
          search={search}
          onSearchChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
          searchPlaceholder="Tìm mã hoặc tên xã/phường"
          searchLabel="Tìm xã/phường"
          actions={canManage ? (
            <Button size="sm" onPress={() => openEditor(null, province === "all" ? undefined : province)}>
              <Plus size={16} aria-hidden="true" />
              Thêm xã/phường
            </Button>
          ) : undefined}
        >
          <Select
            value={province}
            onChange={(value) => {
              setProvince(String(value));
              setPage(1);
            }}
            aria-label="Lọc xã/phường theo tỉnh/thành"
            className="w-full gap-0 sm:w-56"
          >
            <SelectTrigger size="sm" className="w-full justify-between">
              <SelectValue />
              <SelectIndicator />
            </SelectTrigger>
            <SelectContent className="min-w-(--trigger-width)">
              <SelectItem id="all">Tất cả tỉnh/thành</SelectItem>
              {(options?.provinces ?? []).map((item) => (
                <SelectItem key={item.id} id={item.id}>{item.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CatalogToolbar>
        {query.isPending ? (
          <CatalogLoading label="Đang tải xã/phường..." />
        ) : query.error ? (
          <CatalogError message={errorMessage(query.error, "Không thể tải xã/phường.")} onRetry={() => void query.refetch()} />
        ) : rows.length === 0 ? (
          <CatalogEmpty
            title={search.trim() || province !== "all" ? "Không tìm thấy xã/phường" : "Chưa có xã/phường"}
            description={search.trim() || province !== "all" ? "Thử đổi bộ lọc hoặc từ khóa." : "Tạo xã/phường đầu tiên cho một tỉnh/thành."}
            action={!search.trim() && canManage ? () => openEditor(null, province === "all" ? undefined : province) : undefined}
            actionLabel="Thêm xã/phường"
          />
        ) : (
          <TableRoot fullBleed className="w-full min-w-[760px] border-0">
            <TableHeader className="bg-background-gray-secondary/35">
              <TableRow>
                <TableHead>Mã</TableHead>
                <TableHead>Tên xã/phường</TableHead>
                <TableHead>Loại</TableHead>
                <TableHead>Tỉnh/thành</TableHead>
                <TableHead className="w-24 text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id} className="group hover:bg-background-gray-secondary/30">
                  <TableCell className="align-top font-mono text-xs font-bold tracking-wide text-text-secondary">{row.code}</TableCell>
                  <TableCell className="align-top font-medium text-text-primary">{row.name}</TableCell>
                  <TableCell className="align-top text-sm text-text-secondary">{row.wardType === "Commune" ? "Xã" : row.wardType === "Township" ? "Thị trấn" : "Phường"}</TableCell>
                  <TableCell className="align-top text-sm text-text-secondary">{row.provinceName || "Chưa xác định"}</TableCell>
                  <TableCell className="align-top">
                    <CatalogActions canManage={canManage} recordName={row.name} onEdit={() => openEditor(row)} onDelete={() => setToDelete(row)} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </TableRoot>
        )}
        <CatalogPagination currentPage={page} total={total} isFetching={query.isFetching} onPageChange={setPage} />
      </AdmissionCatalogPanel>
      <WardEditorDialog
        key={`ward-${editorKey}`}
        isOpen={editorOpen}
        record={selected}
        provinces={dialogProvinces}
        initialProvince={editorInitialProvince}
        onOpenChange={(open) => {
          setEditorOpen(open);
          if (!open) {
            setSelected(null);
            setEditorInitialProvince(undefined);
            setEditorProvince(null);
            onInitialProvinceHandled();
          }
        }}
      />
      <DeleteRecordDialog
        isOpen={Boolean(toDelete)}
        recordType="xã/phường"
        recordName={toDelete?.name ?? ""}
        isDeleting={deleteMutation.isPending}
        onOpenChange={(open) => {
          if (!open && !deleteMutation.isPending) setToDelete(null);
        }}
        onConfirm={confirmDelete}
      />
    </>
  );
}

function SchoolCatalogPanel({
  canManage,
  enabled,
  options,
}: {
  canManage: boolean;
  enabled: boolean;
  options?: GeographyOptions;
}) {
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [province, setProvince] = useState("all");
  const [area, setArea] = useState("all");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [page, setPage] = useState(1);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorKey, setEditorKey] = useState(0);
  const [selected, setSelected] = useState<SchoolOption | null>(null);
  const [toDelete, setToDelete] = useState<SchoolOption | null>(null);
  const query = useSchoolsQuery({
    search: deferredSearch,
    province: province === "all" ? undefined : province,
    schoolArea: area === "all" ? undefined : area,
    isActive: statusValue(status),
    start: (page - 1) * PAGE_SIZE,
    pageLength: PAGE_SIZE,
    enabled,
  });
  const deleteMutation = useDeleteSchoolMutation();
  const rows = query.data?.schools ?? [];
  const total = query.data?.total ?? rows.length;
  const openEditor = (record: SchoolOption | null) => {
    setSelected(record);
    setEditorKey((current) => current + 1);
    setEditorOpen(true);
  };
  const confirmDelete = async () => {
    if (!toDelete) return;
    try {
      await deleteMutation.mutateAsync({ name: toDelete.id, expectedModified: toDelete.modified });
      toast.success(`Đã xóa ${toDelete.name}.`);
      setToDelete(null);
      setPage(1);
    } catch (error) {
      toast.error(errorMessage(error, "Không thể xóa trường học."));
    }
  };

  return (
    <>
      <AdmissionCatalogPanel
        title="Trường THPT"
        description="Danh bạ trường trung học phổ thông phục vụ dữ liệu tuyển sinh và hoạt động trường."
        showHeader={false}
        count={total}
        countLabel="trường"
        canManage={canManage}
        createLabel="Thêm trường"
        onCreate={() => openEditor(null)}
        isBusy={query.isPending || deleteMutation.isPending}
        className="h-full rounded-none border-0 shadow-none"
      >
        <CatalogToolbar
          search={search}
          onSearchChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
          searchPlaceholder="Tìm mã hoặc tên trường"
          searchLabel="Tìm trường THPT"
          status={status}
          onStatusChange={(value) => {
            setStatus(value);
            setPage(1);
          }}
          statusLabelText="Lọc trạng thái trường"
          actions={canManage ? (
            <Button size="sm" onPress={() => openEditor(null)}>
              <Plus size={16} aria-hidden="true" />
              Thêm trường
            </Button>
          ) : undefined}
        >
          <Select
            value={province}
            onChange={(value) => {
              setProvince(String(value));
              setPage(1);
            }}
            aria-label="Lọc trường theo tỉnh/thành"
            className="w-full gap-0 sm:w-56"
          >
            <SelectTrigger size="sm" className="w-full justify-between"><SelectValue /><SelectIndicator /></SelectTrigger>
            <SelectContent className="min-w-(--trigger-width)">
              <SelectItem id="all">Tất cả tỉnh/thành</SelectItem>
              {(options?.provinces ?? []).map((item) => <SelectItem key={item.id} id={item.id}>{item.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select
            value={area}
            onChange={(value) => {
              setArea(String(value));
              setPage(1);
            }}
            aria-label="Lọc trường theo khu vực"
            className="w-full gap-0 sm:w-48"
          >
            <SelectTrigger size="sm" className="w-full justify-between"><SelectValue /><SelectIndicator /></SelectTrigger>
            <SelectContent className="min-w-(--trigger-width)">
              <SelectItem id="all">Tất cả khu vực</SelectItem>
              {(options?.schoolAreas ?? []).map((item) => <SelectItem key={item.id} id={item.id}>{item.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </CatalogToolbar>
        {query.isPending ? (
          <CatalogLoading label="Đang tải trường học..." />
        ) : query.error ? (
          <CatalogError message={errorMessage(query.error, "Không thể tải trường học.")} onRetry={() => void query.refetch()} />
        ) : rows.length === 0 ? (
          <CatalogEmpty
            title={search.trim() || province !== "all" || area !== "all" || status !== "all" ? "Không tìm thấy trường phù hợp" : "Chưa có trường học"}
            description={search.trim() || province !== "all" || area !== "all" || status !== "all" ? "Thử đổi bộ lọc hoặc từ khóa." : "Tạo trường đầu tiên để hoàn thiện danh bạ."}
            action={!search.trim() && province === "all" && area === "all" && status === "all" && canManage ? () => openEditor(null) : undefined}
            actionLabel="Thêm trường"
          />
        ) : (
          <TableRoot fullBleed className="w-full min-w-[1100px] border-0">
            <TableHeader className="bg-background-gray-secondary/35">
              <TableRow>
                <TableHead>Mã</TableHead>
                <TableHead>Tên trường</TableHead>
                <TableHead>Tỉnh/thành</TableHead>
                <TableHead>Xã/phường</TableHead>
                <TableHead>Khu vực</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="w-24 text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id} className="group hover:bg-background-gray-secondary/30">
                  <TableCell className="align-top font-mono text-xs font-bold tracking-wide text-text-secondary">{row.code}</TableCell>
                  <TableCell className="max-w-[18rem] align-top font-medium text-text-primary">{row.name}</TableCell>
                  <TableCell className="align-top text-sm text-text-secondary">{row.provinceName || row.province}</TableCell>
                  <TableCell className="align-top text-sm text-text-secondary">{row.wardName || row.ward}</TableCell>
                  <TableCell className="align-top text-sm text-text-secondary">{row.schoolAreaName || "Chưa phân khu vực"}</TableCell>
                  <TableCell className="align-top text-sm text-text-secondary">{row.isActive ? "Đang dùng" : "Đã tắt"}</TableCell>
                  <TableCell className="align-top"><CatalogActions canManage={canManage} recordName={row.name} onEdit={() => openEditor(row)} onDelete={() => setToDelete(row)} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </TableRoot>
        )}
        <CatalogPagination currentPage={page} total={total} isFetching={query.isFetching} onPageChange={setPage} />
      </AdmissionCatalogPanel>
      <SchoolEditorDialog
        key={`school-${editorKey}`}
        isOpen={editorOpen}
        record={selected}
        provinces={options?.provinces ?? []}
        wards={options?.wards ?? []}
        schoolAreas={options?.schoolAreas ?? []}
        schoolTypes={options?.schoolTypes ?? []}
        onOpenChange={(open) => {
          setEditorOpen(open);
          if (!open) setSelected(null);
        }}
      />
      <DeleteRecordDialog
        isOpen={Boolean(toDelete)}
        recordType="trường học"
        recordName={toDelete?.name ?? ""}
        isDeleting={deleteMutation.isPending}
        onOpenChange={(open) => {
          if (!open && !deleteMutation.isPending) setToDelete(null);
        }}
        onConfirm={confirmDelete}
      />
    </>
  );
}

function SchoolAreaCatalogPanel({
  canManage,
  enabled,
}: {
  canManage: boolean;
  enabled: boolean;
}) {
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [status, setStatus] = useState<StatusFilter>("all");
  const [page, setPage] = useState(1);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorKey, setEditorKey] = useState(0);
  const [selected, setSelected] = useState<SchoolAreaOption | null>(null);
  const [toDelete, setToDelete] = useState<SchoolAreaOption | null>(null);
  const [isOrdering, setIsOrdering] = useState(false);
  const query = useSchoolAreasQuery({
    search: deferredSearch,
    includeDisabled: true,
    enabled: statusValue(status),
    queryEnabled: enabled,
    start: (page - 1) * PAGE_SIZE,
    pageLength: PAGE_SIZE,
  });
  const orderingQuery = useSchoolAreasQuery({
    includeDisabled: true,
    queryEnabled: enabled && isOrdering,
    start: 0,
    pageLength: 100,
  });
  const deleteMutation = useDeleteSchoolAreaMutation();
  const updateMutation = useUpdateSchoolAreaMutation();
  const rows = query.data?.schoolAreas ?? [];
  const total = query.data?.total ?? rows.length;
  const orderingRows = orderingQuery.data?.schoolAreas ?? [];
  const openEditor = (record: SchoolAreaOption | null) => {
    setSelected(record);
    setEditorKey((current) => current + 1);
    setEditorOpen(true);
  };
  const confirmDelete = async () => {
    if (!toDelete) return;
    try {
      await deleteMutation.mutateAsync({ name: toDelete.id, expectedModified: toDelete.modified });
      toast.success(`Đã xóa ${toDelete.name}.`);
      setToDelete(null);
      setPage(1);
    } catch (error) {
      toast.error(errorMessage(error, "Không thể xóa khu vực trường."));
    }
  };
  const saveOrder = async (items: readonly { id: string }[]) => {
    const recordsById = new Map(orderingRows.map((row) => [row.id, row]));
    try {
      await Promise.all(
        items.map((item, index) => {
          const record = recordsById.get(item.id);
          if (!record) return Promise.resolve();
          return updateMutation.mutateAsync({
            name: record.id,
            data: { sort_order: index + 1 },
            expectedModified: record.modified,
          });
        }),
      );
      toast.success("Đã cập nhật thứ tự khu vực trường.");
      setIsOrdering(false);
    } catch (error) {
      toast.error(errorMessage(error, "Không thể cập nhật thứ tự khu vực."));
    }
  };

  return (
    <>
      <AdmissionCatalogPanel
        title="Khu vực trường"
        description="Danh mục KV1, KV2, KV2 nông thôn và KV3 dùng cho phân loại tuyển sinh."
        showHeader={false}
        count={total}
        countLabel="khu vực"
        canManage={canManage}
        createLabel="Thêm khu vực"
        onCreate={() => openEditor(null)}
        isBusy={query.isPending || deleteMutation.isPending || updateMutation.isPending}
        className="h-full rounded-none border-0 shadow-none"
      >
        <CatalogToolbar
          search={search}
          onSearchChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
          searchPlaceholder="Tìm mã hoặc tên khu vực"
          searchLabel="Tìm khu vực trường"
          status={status}
          onStatusChange={(value) => {
            setStatus(value);
            setPage(1);
          }}
          statusLabelText="Lọc trạng thái khu vực"
          actions={canManage && !isOrdering ? (
            <Button size="sm" onPress={() => openEditor(null)}>
              <Plus size={16} aria-hidden="true" />
              Thêm khu vực
            </Button>
          ) : undefined}
        >
          {canManage && !isOrdering && (
            <Button
              size="sm"
              appearance="outline"
              isDisabled={Boolean(search.trim()) || status !== "all"}
              onPress={() => setIsOrdering(true)}
            >
              Sắp xếp
            </Button>
          )}
        </CatalogToolbar>
        {isOrdering ? (
          orderingQuery.isPending ? (
            <CatalogLoading label="Đang tải danh sách để sắp xếp..." />
          ) : orderingQuery.error ? (
            <CatalogError
              message={errorMessage(orderingQuery.error, "Không thể tải danh sách sắp xếp.")}
              onRetry={() => void orderingQuery.refetch()}
            />
          ) : (
            <CatalogOrderingPanel
              title="khu vực trường"
              items={orderingRows.map((row) => ({
                id: row.id,
                code: row.code,
                label: row.name,
                description: row.description,
              }))}
              isSaving={updateMutation.isPending}
              onCancel={() => setIsOrdering(false)}
              onSave={saveOrder}
            />
          )
        ) : query.isPending ? (
          <CatalogLoading label="Đang tải khu vực trường..." />
        ) : query.error ? (
          <CatalogError message={errorMessage(query.error, "Không thể tải khu vực trường.")} onRetry={() => void query.refetch()} />
        ) : rows.length === 0 ? (
          <CatalogEmpty
            title={search.trim() || status !== "all" ? "Không tìm thấy khu vực" : "Chưa có khu vực trường"}
            description={search.trim() || status !== "all" ? "Thử đổi bộ lọc hoặc từ khóa." : "Tạo khu vực đầu tiên để phân loại trường."}
            action={!search.trim() && status === "all" && canManage ? () => openEditor(null) : undefined}
            actionLabel="Thêm khu vực"
          />
        ) : (
          <TableRoot fullBleed className="w-full min-w-[760px] border-0">
            <TableHeader className="bg-background-gray-secondary/35">
              <TableRow>
                <TableHead>Mã</TableHead>
                <TableHead>Tên khu vực</TableHead>
                <TableHead>Mô tả</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="w-24 text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id} className="group hover:bg-background-gray-secondary/30">
                  <TableCell className="align-top font-mono text-xs font-bold tracking-wide text-text-secondary">{row.code}</TableCell>
                  <TableCell className="align-top font-medium text-text-primary">{row.name}</TableCell>
                  <TableCell className="max-w-[26rem] align-top text-sm text-text-secondary"><span className="line-clamp-2">{row.description || "Chưa có mô tả"}</span></TableCell>
                  <TableCell className="align-top text-sm text-text-secondary">{row.enabled ? "Đang dùng" : "Đã tắt"}</TableCell>
                  <TableCell className="align-top"><CatalogActions canManage={canManage} recordName={row.name} onEdit={() => openEditor(row)} onDelete={() => setToDelete(row)} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </TableRoot>
        )}
        {!isOrdering && (
          <CatalogPagination currentPage={page} total={total} isFetching={query.isFetching} onPageChange={setPage} />
        )}
      </AdmissionCatalogPanel>
      <SchoolAreaEditorDialog
        key={`area-${editorKey}`}
        isOpen={editorOpen}
        record={selected}
        onOpenChange={(open) => {
          setEditorOpen(open);
          if (!open) setSelected(null);
        }}
      />
      <DeleteRecordDialog
        isOpen={Boolean(toDelete)}
        recordType="khu vực trường"
        recordName={toDelete?.name ?? ""}
        isDeleting={deleteMutation.isPending}
        onOpenChange={(open) => {
          if (!open && !deleteMutation.isPending) setToDelete(null);
        }}
        onConfirm={confirmDelete}
      />
    </>
  );
}

function CatalogActions({
  canManage,
  recordName,
  onEdit,
  onDelete,
}: {
  canManage: boolean;
  recordName: string;
  onEdit: () => void;
  onDelete: () => void;
}) {
  if (!canManage) return null;
  return (
    <div className="flex justify-end gap-1">
      <Button aria-label={`Sửa ${recordName}`} iconOnly size="sm" appearance="ghost" onPress={onEdit}>
        <Pencil1 size={16} aria-hidden="true" />
      </Button>
      <Button aria-label={`Xóa ${recordName}`} iconOnly size="sm" appearance="ghost" variant="danger" onPress={onDelete}>
        <Trash1 size={16} aria-hidden="true" />
      </Button>
    </div>
  );
}

function CatalogPagination({
  currentPage,
  total,
  isFetching,
  onPageChange,
}: {
  currentPage: number;
  total: number;
  isFetching: boolean;
  onPageChange: (page: number) => void;
}) {
  if (total <= PAGE_SIZE) return null;
  return (
    <div className="border-t border-card-border px-4 py-3 sm:px-5">
      <Pagination
        currentPage={currentPage}
        totalPages={Math.ceil(total / PAGE_SIZE)}
        onPageChange={onPageChange}
        variant="compact"
        align="end"
        isDisabled={isFetching}
      />
    </div>
  );
}
