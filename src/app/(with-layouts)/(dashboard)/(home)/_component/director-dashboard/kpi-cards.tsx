import { directorKpis } from "./data";
import DirectorKpiCard from "./kpi-card";

export default function DirectorKpiCards() {
  return (
    <section aria-labelledby="director-kpi-heading">
      <div className="sr-only" id="director-kpi-heading">
        Chỉ số điều hành tuyển sinh
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {directorKpis.map((kpi) => (
          <DirectorKpiCard key={kpi.id} kpi={kpi} />
        ))}
      </div>
    </section>
  );
}

