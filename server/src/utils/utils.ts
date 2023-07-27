export const removeEmptyValuesFromObject = (o: Record<string, any>) =>
  Object.entries(o).reduce((a, [k, v]) => (v ? ((a[k] = v), a) : a), {});
