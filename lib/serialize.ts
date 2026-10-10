export function toPlain<T>(doc: unknown): T {
  return JSON.parse(JSON.stringify(doc)) as T;
}

export function toPlainArray<T>(docs: unknown[]): T[] {
  return docs.map((doc) => toPlain<T>(doc));
}
