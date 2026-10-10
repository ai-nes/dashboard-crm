import { describe, expect, it } from "vitest";
import type { PermissionProfile } from "@/services/api/user-management";
import { permissionProfileUpdate } from "./permission-profile-update";

const profile: PermissionProfile = {
  name: "Sale",
  role: "Sale",
  rowScope: "assigned",
  deleteRequiresOwnership: true,
  isSystemManaged: true,
  applicableDoctypes: ["CRM Lead", "CRM Campus"].map((documentType) => ({
    documentType,
    read: true,
    write: false,
    create: false,
    delete: false,
    export: false,
  })),
};

describe("permissionProfileUpdate", () => {
  it("sends only the changed group so an unrelated group's detail permissions survive", () => {
    const next = {
      ...profile,
      applicableDoctypes: profile.applicableDoctypes.map((row) =>
        row.documentType === "CRM Lead" ? { ...row, write: true } : row,
      ),
    };
    expect(permissionProfileUpdate(profile, next, "grouped")).toMatchObject({
      applicableDoctypes: [{ documentType: "CRM Lead", write: true }],
      replaceApplicableDoctypes: false,
      viewMode: "grouped",
    });
    expect(profile.applicableDoctypes[0].write).toBe(false);
  });

  it.each([{ rowScope: "all" as const }, { deleteRequiresOwnership: false }])(
    "does not rewrite DocTypes when only profile settings change: %j",
    (changes) => {
      expect(
        permissionProfileUpdate(profile, { ...profile, ...changes }, "grouped"),
      ).toMatchObject({
        ...changes,
        applicableDoctypes: [],
        replaceApplicableDoctypes: false,
      });
    },
  );

  it("keeps the detailed mode when editing a single DocType", () => {
    const next = {
      ...profile,
      applicableDoctypes: [
        { ...profile.applicableDoctypes[0], export: true },
        profile.applicableDoctypes[1],
      ],
    };
    expect(permissionProfileUpdate(profile, next, "detailed")).toMatchObject({
      applicableDoctypes: [{ documentType: "CRM Lead", export: true }],
      viewMode: "detailed",
    });
  });
});
