import chalk from "chalk";
import Table from "cli-table3";

export function heading(text: string): void {
  console.log(chalk.bold.cyan(`\n${text}\n`));
}

export function success(text: string): void {
  console.log(chalk.green(`  ${text}`));
}

export function warn(text: string): void {
  console.log(chalk.yellow(`  ${text}`));
}

export function error(text: string): void {
  console.error(chalk.red(`  ${text}`));
}

export function label(key: string, value: string | null | undefined): void {
  console.log(`  ${chalk.gray(key + ":")} ${value ?? "—"}`);
}

export function createTable(headers: string[]): Table.Table {
  return new Table({
    head: headers.map((h) => chalk.cyan(h)),
    style: { head: [], border: [] },
  });
}

export function noResults(entity: string): void {
  warn(`No ${entity} found.`);
}
