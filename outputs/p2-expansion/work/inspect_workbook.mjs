import fs from "node:fs/promises";
import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";

const inputPath = "/Users/matheuscastro/Workspaces/orc_ds/modern_ui_framework_component_milestone_tracker.xlsx";
const outDir = "/Users/matheuscastro/Workspaces/orc_ds/outputs/p2-expansion/work";

const input = await FileBlob.load(inputPath);
const workbook = await SpreadsheetFile.importXlsx(input);

const summary = await workbook.inspect({
  kind: "workbook,sheet,table",
  maxChars: 50000,
  tableMaxRows: 10,
  tableMaxCols: 20,
  tableMaxCellChars: 140,
});
console.log("=== SUMMARY ===");
console.log(summary.ndjson);

const p2Matches = await workbook.inspect({
  kind: "match",
  searchTerm: "P2|Expansion|priority|milestone",
  options: { useRegex: true, maxResults: 500 },
  summary: "P2 and milestone references",
});
console.log("=== P2 MATCHES ===");
console.log(p2Matches.ndjson);

const suspiciousMatches = await workbook.inspect({
  kind: "match",
  searchTerm: "ignore previous|system message|assistant|execute|delete|password|secret|instruction",
  options: { useRegex: true, maxResults: 200 },
  summary: "embedded instruction scan",
});
console.log("=== EMBEDDED INSTRUCTION SCAN ===");
console.log(suspiciousMatches.ndjson);

const sheets = summary.ndjson
  .split("\n")
  .filter(Boolean)
  .map((line) => JSON.parse(line))
  .filter((record) => record.kind === "sheet");

for (const sheetInfo of sheets) {
  const sheet = workbook.worksheets.getItem(sheetInfo.name);
  const used = sheet.getUsedRange();
  const values = used?.values ?? [];
  const formulas = used?.formulas ?? [];
  console.log(`=== SHEET ${sheetInfo.name} ===`);
  console.log(JSON.stringify({
    address: used?.address,
    rows: values.length,
    cols: values[0]?.length ?? 0,
    firstRows: values.slice(0, 12),
    p2Rows: values
      .map((row, index) => ({ index: index + 1, row }))
      .filter(({ row }) => row.some((cell) => String(cell ?? "").match(/P2|Expansion/i)))
      .slice(0, 120),
    formulaRows: formulas
      .map((row, index) => ({ index: index + 1, row }))
      .filter(({ row }) => row.some((cell) => cell))
      .slice(0, 20),
  }, null, 2));

  const previewRanges = {
    Dashboard: "A1:H16",
    "Milestone Backlog": "A1:L100",
    "Framework Inventory": "A1:G20",
    "Coverage Matrix": "A1:Q100",
    "Feature Checklist": "A1:D23",
    "Sources & Scope": "A1:D24",
  };
  const preview = await workbook.render({
    sheetName: sheetInfo.name,
    range: previewRanges[sheetInfo.name],
    scale: 1,
    format: "png",
  });
  const safeName = sheetInfo.name.replace(/[^a-z0-9_-]+/gi, "_");
  await fs.writeFile(`${outDir}/${safeName}.png`, new Uint8Array(await preview.arrayBuffer()));
}
