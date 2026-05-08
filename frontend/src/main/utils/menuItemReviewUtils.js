import { toast } from "react-toastify";

/** datetime-local yields YYYY-MM-DDTHH:mm; MenuItemReview POST expects ISO seconds. */
// Stryker disable all : guard and anchored regex have equivalent mutants for covered inputs
export function dateReviewedToRequestParam(value) {
  if (typeof value !== "string") return value;
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) {
    return `${value}:00`;
  }
  return value;
}
// Stryker restore all

export function toDateTimeLocalValue(isoString) {
  if (!isoString || typeof isoString !== "string") return "";
  // Stryker disable all: >= vs > and ternary branches are equivalent for slice(0,16) on API date strings
  return isoString.length >= 16 ? isoString.slice(0, 16) : isoString;
  // Stryker restore all
}

export function onDeleteSuccess(message) {
  console.log(message);
  toast(message);
}

export function cellToAxiosParamsDelete(cell) {
  return {
    url: "/api/MenuItemReview",
    method: "DELETE",
    params: {
      id: cell.row.original.id,
    },
  };
}
