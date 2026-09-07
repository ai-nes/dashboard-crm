import OverviewFact from "./overview-fact";

interface SmallTeamStatsProps {
  total: number;
  sale: number;
  ctvSale: number;
}

export default function SmallTeamStats({
  total,
  sale,
  ctvSale,
}: SmallTeamStatsProps) {
  return (
    <section
      className="grid gap-3 sm:grid-cols-3"
      aria-label="Thống kê thành viên"
    >
      <OverviewFact label="Tổng thành viên" value={total} kind="members" />
      <OverviewFact label="Nhân viên kinh doanh" value={sale} kind="sale" />
      <OverviewFact
        label="Cộng tác viên"
        value={ctvSale}
        kind="collaborators"
      />
    </section>
  );
}
