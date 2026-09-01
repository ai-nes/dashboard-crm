import { Card } from "@/components/tailgrids/core/card";

interface SchoolFieldActivityApiFallbackProps {
  error: string;
}

export default function SchoolFieldActivityApiFallback({ error }: SchoolFieldActivityApiFallbackProps) {
  return (
    <main className="min-w-0 px-2 py-4 lg:px-6" id="main-content">
      <Card className="p-6">
        <h1 className="text-lg font-semibold text-text-primary">Không thể tải hoạt động trường & thực địa</h1>
        <p className="mt-2 text-sm leading-6 text-text-secondary">{error}</p>
      </Card>
    </main>
  );
}
