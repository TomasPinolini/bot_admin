import { z } from "zod";

export const extractionSchema = z.object({
  company: z.object({
    name: z.string().describe("Company name mentioned in the meeting"),
    confidence: z.number().min(0).max(1),
    contactName: z.string().nullable().describe("Primary contact person"),
    contactEmail: z.string().nullable(),
    website: z.string().nullable(),
    location: z.string().nullable(),
    companySize: z
      .enum(["solo", "small", "medium", "large", "enterprise"])
      .nullable()
      .describe("solo=1, small=2-10, medium=11-50, large=51-200, enterprise=200+"),
    revenueRange: z.string().nullable(),
    currentTechStack: z.array(z.string()).describe("Technologies currently used by the company"),
    socialMedia: z
      .object({
        linkedin: z.string().optional(),
        twitter: z.string().optional(),
        facebook: z.string().optional(),
      })
      .nullable(),
  }),
  industry: z.object({
    name: z.string().describe("Industry the company operates in"),
    confidence: z.number().min(0).max(1),
  }),
  niche: z
    .object({
      name: z.string().describe("Specific niche within the industry"),
      confidence: z.number().min(0).max(1),
    })
    .nullable(),
  products: z.array(
    z.object({
      name: z.string(),
      confidence: z.number().min(0).max(1),
    })
  ),
  services: z.array(
    z.object({
      name: z.string(),
      confidence: z.number().min(0).max(1),
    })
  ),
  stakeholders: z.array(
    z.object({
      name: z.string(),
      role: z.string().nullable(),
      email: z.string().nullable(),
    })
  ),
  budget: z.string().nullable().describe("Mentioned budget or budget range"),
  painPoints: z.array(z.string()).describe("Business problems or challenges mentioned"),
  requirements: z.array(z.string()).describe("Specific technical or business requirements"),
  timeline: z.string().nullable().describe("Project timeline mentioned"),
  urgency: z
    .enum(["low", "medium", "high", "critical"])
    .nullable()
    .describe("Urgency level of the project"),
  followUpItems: z.array(z.string()).describe("Action items or follow-ups mentioned"),
});

export type ExtractionResult = z.infer<typeof extractionSchema>;

export const extractionToolSchema = {
  name: "extract_meeting_data",
  description:
    "Extract structured company, project, and meeting data from a meeting transcript summary. Extract all relevant business information including company details, industry, products/services discussed, stakeholders, pain points, requirements, and follow-up items.",
  input_schema: {
    type: "object" as const,
    properties: {
      company: {
        type: "object" as const,
        properties: {
          name: { type: "string" as const, description: "Company name mentioned in the meeting" },
          confidence: { type: "number" as const, minimum: 0, maximum: 1 },
          contactName: { type: ["string", "null"] as const, description: "Primary contact person" },
          contactEmail: { type: ["string", "null"] as const },
          website: { type: ["string", "null"] as const },
          location: { type: ["string", "null"] as const },
          companySize: {
            type: ["string", "null"] as const,
            enum: ["solo", "small", "medium", "large", "enterprise", null],
            description: "solo=1, small=2-10, medium=11-50, large=51-200, enterprise=200+",
          },
          revenueRange: { type: ["string", "null"] as const },
          currentTechStack: {
            type: "array" as const,
            items: { type: "string" as const },
            description: "Technologies currently used by the company",
          },
          socialMedia: {
            type: ["object", "null"] as const,
            properties: {
              linkedin: { type: "string" as const },
              twitter: { type: "string" as const },
              facebook: { type: "string" as const },
            },
          },
        },
        required: ["name", "confidence", "currentTechStack"],
      },
      industry: {
        type: "object" as const,
        properties: {
          name: { type: "string" as const },
          confidence: { type: "number" as const, minimum: 0, maximum: 1 },
        },
        required: ["name", "confidence"],
      },
      niche: {
        type: ["object", "null"] as const,
        properties: {
          name: { type: "string" as const },
          confidence: { type: "number" as const, minimum: 0, maximum: 1 },
        },
      },
      products: {
        type: "array" as const,
        items: {
          type: "object" as const,
          properties: {
            name: { type: "string" as const },
            confidence: { type: "number" as const, minimum: 0, maximum: 1 },
          },
          required: ["name", "confidence"],
        },
      },
      services: {
        type: "array" as const,
        items: {
          type: "object" as const,
          properties: {
            name: { type: "string" as const },
            confidence: { type: "number" as const, minimum: 0, maximum: 1 },
          },
          required: ["name", "confidence"],
        },
      },
      stakeholders: {
        type: "array" as const,
        items: {
          type: "object" as const,
          properties: {
            name: { type: "string" as const },
            role: { type: ["string", "null"] as const },
            email: { type: ["string", "null"] as const },
          },
          required: ["name"],
        },
      },
      budget: { type: ["string", "null"] as const },
      painPoints: { type: "array" as const, items: { type: "string" as const } },
      requirements: { type: "array" as const, items: { type: "string" as const } },
      timeline: { type: ["string", "null"] as const },
      urgency: {
        type: ["string", "null"] as const,
        enum: ["low", "medium", "high", "critical", null],
      },
      followUpItems: { type: "array" as const, items: { type: "string" as const } },
    },
    required: [
      "company",
      "industry",
      "products",
      "services",
      "stakeholders",
      "painPoints",
      "requirements",
      "followUpItems",
    ],
  },
};

export const SYSTEM_PROMPT = `You are a business analyst assistant. You extract structured data from meeting transcript summaries.

Rules:
- Extract ONLY information explicitly stated or strongly implied in the transcript
- Set confidence to 1.0 for explicitly stated facts, 0.7-0.9 for strongly implied, 0.3-0.6 for loosely implied
- If a field is not mentioned at all, set it to null or empty array
- For company size, infer from context clues (team size mentions, office descriptions, etc.)
- For tech stack, include any technologies, platforms, or tools mentioned
- Pain points should be actual business problems, not generic statements
- Follow-up items should be actionable tasks mentioned during the meeting`;
