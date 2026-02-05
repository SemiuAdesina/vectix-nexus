export async function safeJson<T>(res: Response): Promise<T> {
  const text = await res.text();
  if (text.trimStart().startsWith('<')) {
    throw new Error('Server returned HTML instead of JSON. On-chain API may not be configured.');
  }
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error('Invalid JSON response from server');
  }
}
