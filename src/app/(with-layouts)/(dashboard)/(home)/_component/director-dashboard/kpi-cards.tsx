import { directorKpis } from "./data";
import DirectorKpiCard from "./kpi-card";

export default function DirectorKpiCards() {
  return (
    <section aria-labelledby="director-kpi-heading">
      <div className="sr-only" id="director-kpi-heading">
        Các chỉ số tuyển sinh chính
      </div>
      <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {directorKpis.slice(0, 5).map((kpi) => (
          <DirectorKpiCard key={kpi.id} kpi={kpi} />
        ))}
      </div>
    </section>
  );
}
