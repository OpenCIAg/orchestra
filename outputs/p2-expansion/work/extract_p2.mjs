import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";

const input = await FileBlob.load("/Users/matheuscastro/Workspaces/orc_ds/modern_ui_framework_component_milestone_tracker.xlsx");
const workbook = await SpreadsheetFile.importXlsx(input);
const backlog = workbook.worksheets.getItem("Milestone Backlog");
const rows = backlog.getRange("A1:L340").values;

const headers = rows[0];
const p2 = rows
  .slice(1)
  .map((row, offset) => ({ excelRow: offset + 2, row }))
  .filter(({ row }) => row[7] === "P2 Expansion" || row[10] === "P2 Expansion");

console.log(JSON.stringify({ headers, count: p2.length, rows: p2 }, null, 2));
