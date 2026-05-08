import {
  toDateTimeLocalValue,
  onDeleteSuccess,
  cellToAxiosParamsDelete,
} from "main/utils/menuItemReviewUtils";
import mockConsole from "tests/testutils/mockConsole";

const mockToast = vi.fn();
vi.mock("react-toastify", async (importOriginal) => {
  const originalModule = await importOriginal();
  return {
    ...originalModule,
    toast: vi.fn((x) => mockToast(x)),
  };
});

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

describe("menuItemReview delete helpers", () => {
  describe("onDeleteSuccess", () => {
    test("puts the message on console.log and in a toast", () => {
      const restoreConsole = mockConsole();

      onDeleteSuccess("abc");

      expect(mockToast).toHaveBeenCalledWith("abc");
      expect(console.log).toHaveBeenCalled();
      const message = console.log.mock.calls[0][0];
      expect(message).toMatch("abc");

      restoreConsole();
    });
  });

  describe("cellToAxiosParamsDelete", () => {
    test("returns the correct params", () => {
      const cell = { row: { original: { id: 17 } } };

      const result = cellToAxiosParamsDelete(cell);

      expect(result).toEqual({
        url: "/api/MenuItemReview",
        method: "DELETE",
        params: { id: 17 },
      });
    });
  });
});
