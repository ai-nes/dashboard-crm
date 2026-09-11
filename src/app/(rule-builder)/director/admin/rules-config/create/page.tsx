import type { Metadata } from "next";

import RuleBuilderPage from "@/components/rules/rule-builder-page";

export const metadata: Metadata = {
  title: "Tạo Rule",
  description: "Tạo CRM Rule trong Version bản nháp đang chọn.",
};

export const dynamic = "force-dynamic";

export default async function AdminRuleCreatePage({
  searchParams,
}: {
  searchParams: Promise<{ version?: string; group?: string }>;
}) {
  const { version = "", group = "" } = await searchParams;
  const backHref = version ? `/director/admin/rules-config?version=${encodeURIComponent(version)}` : "/director/admin/rules-config";

  return <RuleBuilderPage mode="create" versionName={version} initialRuleGroup={group} backHref={backHref} />;
}
