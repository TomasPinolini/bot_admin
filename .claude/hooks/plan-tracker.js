// Project Stop hook: After implementation work, require plan.md to be updated.
//
// Detects Edit/Write to src/ or web/src/ files (not docs/, not .claude/).
// If plan.md wasn't also updated in the same session, blocks and instructs
// Claude to mark the relevant user story checkboxes in docs/plan.md.
//
// Works alongside the global implementation-checklist hook — each blocks
// independently and resolves on subsequent passes.

const fs = require("fs");
const path = require("path");

let input = "";
process.stdin.on("data", (chunk) => (input += chunk));
process.stdin.on("end", () => {
  try {
    const data = JSON.parse(input);

    // Already re-evaluated — let it through
    if (data.stop_hook_active) {
      process.exit(0);
      return;
    }

    const transcriptPath = data.transcript_path;
    if (!transcriptPath || !fs.existsSync(transcriptPath)) {
      process.exit(0);
      return;
    }

    const content = fs.readFileSync(transcriptPath, "utf8");
    const lines = content.trim().split("\n");

    let hasImplementation = false;
    let hasPlanUpdate = false;

    // Implementation = Edit/Write on source files (src/, web/src/, drizzle/, trigger/)
    // Plan update = Edit/Write on docs/plan.md
    const implPathPattern = /(?:src[/\\]|web[/\\]src[/\\]|drizzle[/\\]|trigger\.config|package\.json)/i;
    const planPathPattern = /docs[/\\]plan\.md/i;

    for (const line of lines) {
      try {
        const entry = JSON.parse(line);
        const str = JSON.stringify(entry);

        // Only care about Edit/Write with file_path
        if (
          (str.includes('"Edit"') || str.includes('"Write"')) &&
          str.includes("file_path")
        ) {
          // Extract file_path value
          const pathMatch = str.match(/"file_path"\s*:\s*"([^"]+)"/);
          if (pathMatch) {
            const filePath = pathMatch[1];
            if (planPathPattern.test(filePath)) {
              hasPlanUpdate = true;
            }
            if (implPathPattern.test(filePath)) {
              hasImplementation = true;
            }
          }
        }
      } catch {
        // Skip malformed lines
      }
    }

    // Only block if we did implementation work but didn't update the plan
    if (!hasImplementation || hasPlanUpdate) {
      process.exit(0);
      return;
    }

    console.log(
      JSON.stringify({
        decision: "block",
        reason: [
          "Implementation work detected but docs/plan.md was not updated.\n",
          "### Update the Plan",
          "Open docs/plan.md and update the relevant user story checkboxes:",
          "- `[ ]` → `[x]` for completed stories",
          "- Add `(partial)` note for work-in-progress stories",
          "- If a new schema/migration was added, update the Schema Changes section",
          "- If a new page/component was created, update the Web Pages & Components section",
          "\nKeep it minimal — only update what actually changed. Do NOT rewrite unrelated sections.",
        ].join("\n"),
      })
    );
  } catch {
    process.exit(0);
  }
});
