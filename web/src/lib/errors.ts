const uniqueMessages: Record<string, string> = {
  createCompany: "A company with that name already exists",
  updateCompany: "A company with that name already exists",
  createTool: "A tool with that name already exists",
  createBlueprint: "A blueprint with that name already exists",
  createIndustry: "An industry with that name already exists",
  createNiche: "A niche with that name already exists in this industry",
  createProduct: "A product with that name already exists",
  createService: "A service with that name already exists",
};

export function sanitizeError(error: unknown, context: string): string {
  const message = error instanceof Error ? error.message : String(error);

  // Log full error for Sentry to pick up
  console.error(`[${context}]`, error);

  if (message.includes("unique")) {
    return uniqueMessages[context] ?? "A record with that name already exists";
  }
  if (message.includes("foreign key") || message.includes("violates foreign key")) {
    return "A referenced record was not found";
  }
  if (message.includes("null value") || message.includes("not-null")) {
    return "A required field is missing";
  }
  if (message.includes("timeout") || message.includes("ETIMEDOUT")) {
    return "Request timed out. Please try again";
  }

  return "An unexpected error occurred";
}
