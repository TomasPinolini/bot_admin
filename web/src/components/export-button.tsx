"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface ExportButtonProps {
  data: Record<string, unknown>[];
  filename: string;
}

export function ExportButton({ data, filename }: ExportButtonProps) {
  function handleExport() {
    if (data.length === 0) return;
    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(","),
      ...data.map((row) =>
        headers
          .map((h) => {
            const val = row[h] ?? "";
            const str = String(val);
            return str.includes(",") || str.includes('"') || str.includes("\n")
              ? `"${str.replace(/"/g, '""')}"`
              : str;
          })
          .join(",")
      ),
    ];
    const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Button variant="secondary" icon={<Download size={14} />} onClick={handleExport}>
      Export
    </Button>
  );
}
