import { toast } from "react-toastify";

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
