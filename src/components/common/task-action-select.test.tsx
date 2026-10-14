import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { TaskActionSelect } from "./task-action-select";

vi.mock("@/components/common/dropdown-field", () => ({
  DropdownField: ({
    contentClassName,
    options,
    renderOption,
  }: {
    contentClassName: string;
    options: Array<{ id: string }>;
    renderOption: (option: {
      id: string;
      label: string;
      description: string;
    }) => React.ReactNode;
  }) => (
    <ul className={contentClassName}>
      {options.map((option) => (
        <li key={option.id}>{renderOption(option as never)}</li>
      ))}
    </ul>
  ),
}));

describe("TaskActionSelect long option labels", () => {
  it("wraps full option names inside narrow menus", () => {
    const html = renderToStaticMarkup(
      <TaskActionSelect
        value="SEND_OBJECTION_CONTENT"
        onChange={() => undefined}
      />,
    );

    expect(html).toContain("Gửi thông tin giải đáp băn khoăn");
    expect(html).toContain("whitespace-normal");
    expect(html).toContain("break-words");
    expect(html).toContain("w-[min(360px,calc(100vw-2rem))]");
  });
});
