// Normalización de IDs de MongoDB/Backend
export const extractId = (value: any): string => {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (value._id) return value._id;
  if (value.id) return value.id;
  if (value.$oid) return value.$oid;
  return "";
};

// Parseo seguro de fechas (ISO a YYYY-MM-DD)
export const safeParseDate = (iso: string) => {
  if (!iso) return "";
  return new Date(iso).toISOString().split("T")[0];
};

// Parseo seguro de hora (ISO a HH:MM)
export const safeParseTime = (iso: string) => {
  if (!iso) return "";
  return new Date(iso).toTimeString().slice(0, 5);
};