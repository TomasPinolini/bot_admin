#!/usr/bin/env node

import { Command } from "commander";
import { registerCompanyCommands } from "./commands/company.js";
import { registerToolCommands } from "./commands/tool.js";
import { registerProjectCommands } from "./commands/project.js";
import { registerImplCommands } from "./commands/impl.js";
import { registerProgressCommands } from "./commands/progress.js";
import { registerBlueprintCommands } from "./commands/blueprint.js";
import { registerIndustryCommands } from "./commands/industry.js";
import { registerNicheCommands } from "./commands/niche.js";
import { registerProductCommands } from "./commands/product.js";
import { registerServiceCommands } from "./commands/service.js";
import { closeDb } from "./db/index.js";

const hasArgs = process.argv.length > 2;

if (!hasArgs) {
  // Interactive menu mode
  const { startMenu } = await import("./menu/index.js");
  startMenu().catch(async (err) => {
    console.error(err);
    await closeDb();
    process.exit(1);
  });
} else {
  // Flag-based CLI mode
  const program = new Command();

  program
    .name("bot")
    .description("Bot Admin — manage AI chatbot implementations, clients, and blueprints")
    .version("0.1.0");

  registerCompanyCommands(program);
  registerToolCommands(program);
  registerProjectCommands(program);
  registerImplCommands(program);
  registerProgressCommands(program);
  registerBlueprintCommands(program);
  registerIndustryCommands(program);
  registerNicheCommands(program);
  registerProductCommands(program);
  registerServiceCommands(program);

  program
    .parseAsync()
    .then(() => closeDb())
    .catch(async (err) => {
      console.error(err);
      await closeDb();
      process.exit(1);
    });
}
