import type { Metadata } from "next";

import RuleBuilderPage from "@/components/rules/rule-builder-page";

export const metadata: Metadata = {
  title: "Chỉnh sửa Rule",
  description: "Chỉnh sửa điều kiện và thông tin CRM Rule.",
};

export const dynamic = "force-dynamic";

export default async function AdminRuleEditPage({
  params,
  searchParams,
}: {
  params: Promise<{ ruleName: string }>;
  searchParams: Promise<{ version?: string }>;
}) {
  const { ruleName } = await params;
  const { version = "" } = await searchParams;
  const backHref = version ? `/director/admin/rules-config?version=${encodeURIComponent(version)}` : "/director/admin/rules-config";

  return <RuleBuilderPage mode="edit" ruleName={ruleName} versionName={version} backHref={backHref} />;
}
