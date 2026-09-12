import { ArrowRight } from "@tailgrids/icons";
import Link from "next/link";

import AdminPageHeader from "@/components/common/admin/admin-page-header";
import { Card } from "@/components/tailgrids/core/card";

export interface RoleWorkspaceLink {
  label: string;
  description: string;
  href: string;
}

interface RoleWorkspacePageProps {
  code: string;
  title: string;
  description: string;
  links: readonly RoleWorkspaceLink[];
}

/** Shared shell for role workspaces that are being expanded feature by feature. */
export default function RoleWorkspacePage({
  code,
  title,
  description,
  links,
}: RoleWorkspacePageProps) {
  return (
    <main className="min-w-0 space-y-5 px-2 py-4 pb-8 lg:px-6">
      <AdminPageHeader
        section={code}
        title={title}
        description={description}
        metaLabel="Không gian dành cho quản trị viên"
        metaValue="Cấu hình và vận hành tuyển sinh"
      />

      <section
        aria-label="Lối tắt nghiệp vụ"
        className="grid gap-4 md:grid-cols-2 xl:grid-cols-3"
      >
        {links.map((link) => (
          <Card key={link.href} className="flex min-h-36 flex-col">
            <h2 className="text-base font-semibold text-text-primary">
              {link.label}
            </h2>
            <p className="mt-2 flex-1 text-sm leading-6 text-text-secondary">
              {link.description}
            </p>
            <Link
              href={link.href}
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-button-primary-outline-text transition-colors hover:text-button-primary-outline-hover-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
            >
              Mở màn hình <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </Card>
        ))}
      </section>
    </main>
  );
}
