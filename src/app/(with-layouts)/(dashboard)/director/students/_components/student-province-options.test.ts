import { describe, expect, it } from "vitest";

import { getSouthernProvinceOptions } from "./student-province-options";

describe("getSouthernProvinceOptions", () => {
  it("keeps only the seven southern priority provinces", () => {
    const options = getSouthernProvinceOptions([
      { value: "An Giang", label: "An Giang" },
      { value: "Tay Ninh", label: "Tây Ninh" },
      { value: "TP. Hồ Chí Minh", label: "TP. Hồ Chí Minh" },
      { value: "Đồng Nai", label: "Đồng Nai" },
      { value: "Khánh Hoà", label: "Khánh Hoà" },
      { value: "Đắk Lắk", label: "Đắk Lắk" },
      { value: "Lâm Đồng", label: "Lâm Đồng" },
      { value: "Đồng Tháp", label: "Đồng Tháp" },
      { value: "Hà Nội", label: "Hà Nội" },
    ]);

    expect(options.map((option) => option.label)).toEqual([
      "Khánh Hoà",
      "Đắk Lắk",
      "Lâm Đồng",
      "TP. Hồ Chí Minh",
      "Đồng Nai",
      "Đồng Tháp",
      "Tây Ninh",
    ]);
  });

  it("deduplicates Hồ Chí Minh labels returned by the CRM options API", () => {
    const options = getSouthernProvinceOptions([
      { value: "Hồ Chí Minh", label: "Hồ Chí Minh" },
      { value: "Hồ Chí Minh City", label: "Hồ Chí Minh City" },
    ]);

    expect(options).toHaveLength(1);
    expect(options[0]?.label).toBe("Hồ Chí Minh");
  });
});
