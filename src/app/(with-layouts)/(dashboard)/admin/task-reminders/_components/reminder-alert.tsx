import Link from "next/link";

export interface ReminderFailure {
  message: string;
  requestId?: string;
  loginRequired?: boolean;
}

export default function ReminderAlert({
  failure,
}: {
  failure: ReminderFailure;
}) {
  return (
    <div
      role="alert"
      className="rounded-lg border border-error-500/20 bg-badge-error-background p-4 text-sm text-badge-error-text"
    >
      <p>{failure.message}</p>
      {failure.loginRequired ? (
        <Link
          href="/login"
          className="mt-2 inline-block font-medium underline underline-offset-4"
        >
          Đăng nhập lại
        </Link>
      ) : null}
      {failure.requestId ? (
        <p className="mt-2 break-all text-xs">
          Mã yêu cầu: {failure.requestId}
        </p>
      ) : null}
    </div>
  );
}
