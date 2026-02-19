import { Command } from "commander";
import * as service from "../services/progress.service.js";
import { projectPhaseEnum } from "../types/common.js";
import { textInput, selectInput } from "../ui/prompts.js";
import { withSpinner } from "../ui/display.js";
import {
  heading,
  success,
  label,
  createTable,
  noResults,
} from "../utils/format.js";
import { formatDateTime } from "../utils/date.js";

export function registerProgressCommands(program: Command) {
  const cmd = program
    .command("progress")
    .description("Track project progress");

  // ── log ────────────────────────────────────────────────
  cmd
    .command("log")
    .description("Log a progress entry")
    .option("--project <id>", "Project ID")
    .option("--phase <phase>", "Phase (discovery, design, build, test, deploy, handoff)")
    .option("--note <note>", "Note")
    .option("--by <name>", "Logged by")
    .action(async (opts) => {
      const projectId =
        opts.project ||
        (await textInput({ message: "Project ID", required: true }));
      const phase =
        opts.phase ||
        (await selectInput({
          message: "Phase",
          options: projectPhaseEnum.options.map((v) => ({
            value: v,
            label: v,
          })),
        }));
      const note =
        opts.note ?? (await textInput({ message: "Note (optional)" }));
      const loggedBy =
        opts.by ?? (await textInput({ message: "Logged by (optional)" }));

      const log = await withSpinner("Logging progress", () =>
        service.createProgressLog({
          projectId,
          phase,
          note: note || undefined,
          loggedBy: loggedBy || undefined,
        })
      );

      success(`Progress logged: ${log.phase} — ${log.note || "(no note)"}`);
    });

  // ── timeline ───────────────────────────────────────────
  cmd
    .command("timeline <projectId>")
    .description("View progress timeline for a project")
    .action(async (projectId: string) => {
      const logs = await withSpinner("Loading timeline", () =>
        service.getTimeline(projectId)
      );

      if (logs.length === 0) return noResults("progress logs");

      heading("Progress Timeline");
      const table = createTable([
        "Date",
        "Phase",
        "Status",
        "Note",
        "By",
      ]);
      for (const l of logs) {
        table.push([
          formatDateTime(l.loggedAt),
          l.phase,
          l.status,
          l.note ?? "—",
          l.loggedBy ?? "—",
        ]);
      }
      console.log(table.toString());
    });
}
