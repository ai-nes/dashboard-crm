import {
  AdminTableHead,
  AdminTableHeader,
  AdminTableRow,
} from "@/components/common/admin/admin-table";

export default function ProfileOptionsTableHeader() {
  return (
    <AdminTableHeader>
      <AdminTableRow>
        <AdminTableHead scope="col" className="w-1/4 min-w-40">
          Mã
        </AdminTableHead>
        <AdminTableHead scope="col" className="min-w-48">
          Tên hiển thị
        </AdminTableHead>
        <AdminTableHead scope="col" className="w-24">
          Thứ tự
        </AdminTableHead>
        <AdminTableHead scope="col" className="w-40">
          Trạng thái
        </AdminTableHead>
        <AdminTableHead scope="col" className="w-24 text-right">
          Thao tác
        </AdminTableHead>
      </AdminTableRow>
    </AdminTableHeader>
  );
}
