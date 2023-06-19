export const QRzeros = (num: number) => String(num).padStart(5, "0");

export function convertIntObj(obj: Partial<Record<string, string | number>>) {
  const res = {};
  for (const key in obj) {
    if (
      key === "description" ||
      key === "additional_information" ||
      key === "model" ||
      key === "serial_number"
    ) {
      res[key] = obj[key];
      continue;
    }
    res[key] = {};
    const parsed = parseInt(obj[key].toString(), 10);
    res[key] = isNaN(parsed) ? obj[key] : parsed;
  }
  return res;
}

export const removeBasepathFromPathname = (path: string | null) =>
  path.replace("/inventory", "/");
