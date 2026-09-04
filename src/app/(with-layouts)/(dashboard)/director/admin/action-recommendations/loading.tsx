export default function ActionRecommendationsLoading() {
  return (
    <main className="space-y-6 px-2 py-4 lg:px-6" aria-busy="true" aria-label="Đang tải giao diện quản trị">
      <div className="h-28 animate-pulse rounded-xl bg-background-gray-secondary" />
      <div className="h-[32rem] animate-pulse rounded-xl bg-background-gray-secondary" />
    </main>
  );
}

