/** Non-administrators cannot activate; they keep their session and wait. */
export function NotAdminNotice() {
  return (
    <p className="mt-4 text-center text-sm leading-6 text-text-secondary">
      Hệ thống tạm thời chưa sử dụng được vì chưa có license hợp lệ. Vui lòng
      liên hệ quản trị viên. Bạn không cần đăng nhập lại: CRM sẽ tự mở khi
      license được kích hoạt.
    </p>
  );
}
