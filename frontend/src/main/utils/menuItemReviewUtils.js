import { toast } from "react-toastify";

export function toDateTimeLocalValue(isoString) {
  if (!isoString || typeof isoString !== "string") return "";
  return isoString.length >= 16 ? isoString.slice(0, 16) : isoString;
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
