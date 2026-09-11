import RulesConfigAdminPage from "../_components/rules-config-admin-page";

export default async function RuleVersionDetailPage({ params }: { params: Promise<{ versionName: string }> }) {
  const { versionName } = await params;
  return <RulesConfigAdminPage versionName={decodeURIComponent(versionName)} />;
}
