import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import CampaignDetailRecordTabs from "./campaign-detail-record-tabs";

describe("campaign detail record tabs", () => {
  it("hides record tabs without their corresponding read permissions", () => {
    const html = renderToStaticMarkup(
      <CampaignDetailRecordTabs
        selectedKey="students"
        canReadLeads={false}
        canReadStudents
        onSelectionChange={() => undefined}
      />,
    );

    expect(html).not.toContain(">Lead<");
    expect(html).toContain("Học sinh");
  });
});
