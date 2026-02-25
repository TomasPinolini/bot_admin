const TRIGGER_API_URL = "https://api.trigger.dev/api/v1";

export async function triggerTask(taskId: string, payload: unknown) {
  const secretKey = process.env.TRIGGER_SECRET_KEY;
  if (!secretKey) {
    throw new Error("TRIGGER_SECRET_KEY environment variable is not set");
  }

  const response = await fetch(`${TRIGGER_API_URL}/tasks/${taskId}/trigger`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${secretKey}`,
    },
    body: JSON.stringify({ payload }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Trigger.dev API error: ${response.status} ${text}`);
  }

  return response.json();
}
