export const PASSWORD_MIN_LENGTH = 6;
export const PASSWORD_MAX_LENGTH = 128;

export function validatePasswordChange(
  currentPassword: string,
  newPassword: string,
  confirmPassword: string,
): string | null {
  if (!currentPassword) return "Vui lòng nhập mật khẩu hiện tại.";
  if (
    newPassword.length < PASSWORD_MIN_LENGTH ||
    newPassword.length > PASSWORD_MAX_LENGTH
  )
    return `Mật khẩu mới cần có từ ${PASSWORD_MIN_LENGTH} đến ${PASSWORD_MAX_LENGTH} ký tự.`;
  if (newPassword !== confirmPassword) return "Mật khẩu xác nhận không khớp.";
  if (newPassword === currentPassword)
    return "Mật khẩu mới cần khác mật khẩu hiện tại.";
  return null;
}
