import { NotFoundPage } from "@/app/not-found";

interface LeadNotFoundStateProps {
  backHref: string;
}

export default function LeadNotFoundState({
  backHref,
}: LeadNotFoundStateProps) {
  return (
    <NotFoundPage
      title="Không tìm thấy Lead!"
      description={
        <>
          <p>Lead có thể đã bị xóa hoặc mã Lead không đúng.</p>
          <p>Hãy quay lại danh sách Lead để tiếp tục.</p>
        </>
      }
      actionHref={backHref}
      actionLabel="Về danh sách Lead"
    />
  );
}
