import * as p from "@clack/prompts";

export class CancelError extends Error {
  constructor() {
    super("Operation cancelled.");
    this.name = "CancelError";
  }
}

export function isCancelError(err: unknown): err is CancelError {
  return err instanceof CancelError;
}

export async function textInput(opts: {
  message: string;
  placeholder?: string;
  defaultValue?: string;
  initialValue?: string;
  required?: boolean;
}): Promise<string> {
  const result = await p.text({
    message: opts.message,
    placeholder: opts.placeholder,
    defaultValue: opts.defaultValue,
    initialValue: opts.initialValue,
    validate: opts.required
      ? (v) => (v.trim().length === 0 ? "This field is required" : undefined)
      : undefined,
  });
  if (p.isCancel(result)) {
    p.cancel("Operation cancelled.");
    throw new CancelError();
  }
  return result;
}

export async function selectInput(opts: {
  message: string;
  options: { value: string; label: string }[];
}): Promise<string> {
  const result = await p.select({
    message: opts.message,
    options: opts.options.map((o) => ({ value: o.value, label: o.label })),
  });
  if (p.isCancel(result)) {
    p.cancel("Operation cancelled.");
    throw new CancelError();
  }
  return result as string;
}

export async function confirmInput(message: string): Promise<boolean> {
  const result = await p.confirm({ message });
  if (p.isCancel(result)) {
    p.cancel("Operation cancelled.");
    throw new CancelError();
  }
  return result;
}

export function intro(title: string): void {
  p.intro(title);
}

export function outro(message: string): void {
  p.outro(message);
}
