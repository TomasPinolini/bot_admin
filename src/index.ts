#!/usr/bin/env node

import { Command } from "commander";
import { registerCompanyCommands } from "./commands/company.js";
import { registerToolCommands } from "./commands/tool.js";
import { registerProjectCommands } from "./commands/project.js";
import { registerImplCommands } from "./commands/impl.js";
import { registerProgressCommands } from "./commands/progress.js";
import { registerBlueprintCommands } from "./commands/blueprint.js";

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

program.parseAsync().catch((err) => {
  console.error(err);
  process.exit(1);
});
