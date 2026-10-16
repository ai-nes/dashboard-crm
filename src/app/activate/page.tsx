import type { Metadata } from "next";
import { ActivateCard } from "./_components/activate-card";

export const metadata: Metadata = {
  title: "Kích hoạt license",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ActivatePage() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-background-gray-secondary_alt_2 px-5 py-10">
      <ActivateCard />
    </main>
  );
}
