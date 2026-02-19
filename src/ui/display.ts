import * as p from "@clack/prompts";

const isTTY = process.stdout.isTTY ?? false;

export async function withSpinner<T>(
  message: string,
  fn: () => Promise<T>
): Promise<T> {
  if (!isTTY) {
    return fn();
  }

  const s = p.spinner();
  s.start(message);
  try {
    const result = await fn();
    s.stop(message + " done.");
    return result;
  } catch (err) {
    s.stop(message + " failed.");
    throw err;
  }
}
