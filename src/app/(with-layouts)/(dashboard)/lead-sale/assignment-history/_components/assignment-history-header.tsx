export default function AssignmentHistoryHeader() {
  return (
    <header>
      <div className="mb-2 flex flex-wrap items-center gap-2 text-xs font-medium text-text-tertiary">
        <span>VẬN HÀNH TUYỂN SINH</span>
        <span aria-hidden="true">/</span>
        <span>LỊCH SỬ PHÂN CÔNG</span>
      </div>
      <h1 className="text-2xl font-semibold tracking-tight text-text-primary sm:text-[28px]">
        Lịch sử phân công
      </h1>
      <p className="mt-2 text-sm leading-6 text-text-secondary">
        Xem kết quả và lý do phân công của từng học sinh.
      </p>
    </header>
  );
}
