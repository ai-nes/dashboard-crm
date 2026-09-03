import { scrubCopy, scrubList } from "./sanitize";

interface ProseProps {
  label: string;
  value: string | undefined;
}

/** Heading + one paragraph. Renders nothing when the value is empty. */
export function PackageProse({ label, value }: ProseProps) {
  const text = value ? scrubCopy(value) : "";
  if (!text) return null;
  return (
    <div>
      <h4 className="text-xs font-medium text-text-tertiary">{label}</h4>
      <p className="mt-1 text-sm leading-6 whitespace-pre-line text-text-secondary">
        {text}
      </p>
    </div>
  );
}

interface ListProps {
  label: string;
  values: string[] | undefined;
}

/** Heading + bulleted list. Renders nothing when the list is empty. */
export function PackageList({ label, values }: ListProps) {
  const items = scrubList(values);
  if (items.length === 0) return null;
  return (
    <div>
      <h4 className="text-xs font-medium text-text-tertiary">{label}</h4>
      <ul className="mt-1.5 space-y-1.5">
        {items.map((item, index) => (
          <li
            key={`${index}-${item}`}
            className="flex gap-2 text-sm leading-6 text-text-secondary before:mt-2.5 before:size-1 before:shrink-0 before:rounded-full before:bg-text-tertiary"
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
