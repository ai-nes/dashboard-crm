import { redirect } from "next/navigation";

interface SchoolDetailAliasPageProps {
  params: Promise<{ id: string }>;
}

export default async function SchoolDetailAliasPage({ params }: SchoolDetailAliasPageProps) {
  const { id } = await params;
  redirect(`/director/schools/${encodeURIComponent(id)}`);
}
