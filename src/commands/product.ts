import { Command } from "commander";
import * as service from "../services/product.service.js";
import { textInput, isCancelError } from "../ui/prompts.js";
import { withSpinner } from "../ui/display.js";
import { heading, label, createTable, noResults, error } from "../utils/format.js";
import { formatDate } from "../utils/date.js";

export function registerProductCommands(program: Command) {
  const cmd = program.command("product").description("Manage products");

  // ── add ────────────────────────────────────────────────
  cmd
    .command("add")
    .description("Add a new product")
    .option("--name <name>", "Product name")
    .option("--description <desc>", "Description")
    .action(async (opts) => {
      try {
        const interactive = !opts.name;

        const name =
          opts.name || (await textInput({ message: "Product name", required: true }));
        const description = interactive
          ? (opts.description ?? (await textInput({ message: "Description (optional)" })))
          : opts.description;

        const product = await withSpinner("Creating product", () =>
          service.createProduct({
            name,
            description: description || undefined,
          })
        );

        heading("Product Created");
        label("ID", product.id);
        label("Name", product.name);
        if (product.description) label("Description", product.description);
      } catch (err) {
        if (isCancelError(err)) process.exit(0);
        throw err;
      }
    });

  // ── list ───────────────────────────────────────────────
  cmd
    .command("list")
    .description("List products")
    .option("--search <term>", "Search by name or description")
    .action(async (opts) => {
      const items = await withSpinner("Loading products", () =>
        service.listProducts({ search: opts.search })
      );

      if (items.length === 0) return noResults("products");

      heading("Products");
      const table = createTable(["ID", "Name", "Description", "Created"]);
      for (const p of items) {
        table.push([p.id, p.name, p.description ?? "—", formatDate(p.createdAt)]);
      }
      console.log(table.toString());
    });

  // ── show ───────────────────────────────────────────────
  cmd
    .command("show <id>")
    .description("Show product details")
    .action(async (id: string) => {
      const product = await withSpinner("Loading product", () =>
        service.getProduct(id)
      );

      if (!product) return error(`Product not found: ${id}`);

      heading(product.name);
      label("ID", product.id);
      label("Description", product.description);
      label("Created", formatDate(product.createdAt));
    });
}
