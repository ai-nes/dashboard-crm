import type { NbaPackageSeed } from "../types";
import type { FieldSpec } from "./card-types";
import { PackageList, PackageProse } from "./package-section";
import { scrubCopy, scrubList } from "./sanitize";

interface TypedPackageCardProps {
  fields: readonly FieldSpec[];
  seed: NbaPackageSeed | null | undefined;
  /** Copy shown when the seed carries none of the type's fields. */
  emptyHint: string;
}

function stringValue(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function listValue(value: unknown): string[] | undefined {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : undefined;
}

/**
 * Renders the end-user rows for one action type from its {@link FieldSpec} list.
 * Every card component is a thin wrapper over this — the layout is shared,
 * only the field spec differs.
 */
export function TypedPackageCard({
  fields,
  seed,
  emptyHint,
}: TypedPackageCardProps) {
  const data = seed ?? {};

  const hasContent = fields.some((spec) =>
    spec.kind === "prose"
      ? scrubCopy(stringValue(data[spec.key]) ?? "").length > 0
      : scrubList(listValue(data[spec.key])).length > 0,
  );

  if (!hasContent) {
    return <p className="text-sm leading-6 text-text-tertiary">{emptyHint}</p>;
  }

  return (
    <div className="space-y-4">
      {fields.map((spec) =>
        spec.kind === "prose" ? (
          <PackageProse
            key={spec.key}
            label={spec.label}
            value={stringValue(data[spec.key])}
          />
        ) : (
          <PackageList
            key={spec.key}
            label={spec.label}
            values={listValue(data[spec.key])}
          />
        ),
      )}
    </div>
  );
}
