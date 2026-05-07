export function toDateTimeLocalValue(isoString) {
  if (!isoString || typeof isoString !== "string") return "";
  return isoString.length >= 16 ? isoString.slice(0, 16) : isoString;
}
