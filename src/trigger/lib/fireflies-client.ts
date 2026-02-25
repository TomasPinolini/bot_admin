const FIREFLIES_ENDPOINT = "https://api.fireflies.ai/graphql";

export interface FirefliesTranscript {
  id: string;
  title: string;
  date: number; // Unix timestamp in ms
  duration: number; // seconds
  participants: string[];
  summary: { overview: string } | null;
}

const TRANSCRIPTS_QUERY = `
  query RecentTranscripts($dateGte: DateTime) {
    transcripts(date_gte: $dateGte) {
      id
      title
      date
      duration
      participants
      summary {
        overview
      }
    }
  }
`;

export async function getRecentTranscripts(
  sinceDate: Date
): Promise<FirefliesTranscript[]> {
  const apiKey = process.env.FIREFLIES_API_KEY;
  if (!apiKey) {
    throw new Error("FIREFLIES_API_KEY environment variable is not set");
  }

  const response = await fetch(FIREFLIES_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      query: TRANSCRIPTS_QUERY,
      variables: { dateGte: sinceDate.toISOString() },
    }),
  });

  if (!response.ok) {
    throw new Error(
      `Fireflies API error: ${response.status} ${response.statusText}`
    );
  }

  const json = (await response.json()) as {
    data?: { transcripts: FirefliesTranscript[] };
    errors?: Array<{ message: string }>;
  };

  if (json.errors?.length) {
    throw new Error(
      `Fireflies GraphQL error: ${json.errors.map((e) => e.message).join(", ")}`
    );
  }

  return json.data?.transcripts ?? [];
}
