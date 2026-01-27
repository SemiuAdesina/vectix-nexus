export function getParam(req: { params: Record<string, string | string[]> }, key: string): string {
  const value = req.params[key];
  return Array.isArray(value) ? value[0] : value;
}
