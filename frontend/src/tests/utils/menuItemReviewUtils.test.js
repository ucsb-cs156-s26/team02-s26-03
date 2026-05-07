import { toDateTimeLocalValue } from "main/utils/menuItemReviewUtils";

describe("toDateTimeLocalValue", () => {
  test("truncates ISO strings to datetime-local width", () => {
    expect(toDateTimeLocalValue("2022-04-20T00:00:00")).toBe(
      "2022-04-20T00:00",
    );
  });

  test("returns shorter strings unchanged", () => {
    expect(toDateTimeLocalValue("2022-06-01T00")).toBe("2022-06-01T00");
  });

  test("returns empty for nullish or non-string", () => {
    expect(toDateTimeLocalValue("")).toBe("");
    expect(toDateTimeLocalValue(undefined)).toBe("");
    expect(toDateTimeLocalValue(null)).toBe("");
    expect(toDateTimeLocalValue(7)).toBe("");
  });
});
