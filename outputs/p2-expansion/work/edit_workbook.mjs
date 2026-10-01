import fs from "node:fs/promises";
import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";

const inputPath = "/Users/matheuscastro/Workspaces/orc_ds/modern_ui_framework_component_milestone_tracker.xlsx";
const outputDir = "/Users/matheuscastro/Workspaces/orc_ds/outputs/p2-expansion";
const outputPath = `${outputDir}/modern_ui_framework_component_milestone_tracker.xlsx`;
const workDir = `${outputDir}/work`;

const p2Components = [
  ["Button Group", "button-group"],
  ["Calendar", "calendar"],
  ["Code", "code"],
  ["Combobox", "combobox"],
  ["Dropdown", "dropdown"],
  ["File Upload", "file-upload"],
  ["Grid", "grid"],
  ["Kbd", "kbd"],
  ["Link", "link"],
  ["Menubar", "menubar"],
  ["OTP Input", "otp-input"],
  ["Progress Bar", "progress"],
  ["Progress Circle", "progress"],
  ["Splitter", "splitter"],
  ["Tag", "tag"],
  ["Typography", "typography"],
  ["Aspect Ratio", "aspect-ratio"],
  ["Container", "container"],
  ["Floating Action Button", "floating-action-button"],
  ["Hover Card", "hover-card"],
  ["Portal", "portal"],
  ["Radio", "radio"],
  ["Segmented Control", "segmented-control"],
  ["Separator", "separator"],
  ["Stack", "stack"],
  ["Visually Hidden", "visually-hidden"],
  ["Box", "box"],
  ["Close Button", "close-button"],
  ["Context Menu", "context-menu"],
  ["Data Table", "data-table"],
  ["Date Input", "date-input"],
  ["Empty State", "empty-state"],
  ["Flex", "flex"],
  ["Input Group", "input-group"],
  ["Listbox", "listbox"],
  ["Multi Select", "multi-select"],
  ["Space", "space"],
  ["Speed Dial", "speed-dial"],
  ["Tags Input", "tags-input"],
  ["Text", "text"],
  ["Tree Select", "tree-select"],
  ["Virtual Scroller", "virtual-scroller"],
];

const input = await FileBlob.load(inputPath);
const workbook = await SpreadsheetFile.importXlsx(input);
const backlog = workbook.worksheets.getItem("Milestone Backlog");
const dashboard = workbook.worksheets.getItem("Dashboard");

const p2Statuses = p2Components.map(() => ["Implemented"]);
const p2Notes = p2Components.map(([, packageName]) => [
  `Implemented in @ciag/orchestra/${packageName}`,
]);

// Preserve the existing tracker layout and formatting by changing only the P2
// status/notes cells and adding two dashboard metrics in the existing blank rows.
backlog.getRange("I50:I91").values = p2Statuses;
backlog.getRange("L50:L91").values = p2Notes;

dashboard.getRange("A10:B11").values = [
  ["P2 implemented", null],
  ["P2 remaining", null],
];
dashboard.getRange("B10").formulas = [[
  '=COUNTIF(\'Milestone Backlog\'!$I$2:$I$340,"Implemented")',
]];
dashboard.getRange("B11").formulas = [[
  '=COUNTIF(\'Milestone Backlog\'!$H$2:$H$340,"P2 Expansion")-COUNTIF(\'Milestone Backlog\'!$I$2:$I$340,"Implemented")',
]];

const verification = await workbook.inspect({
  kind: "table",
  range: "Milestone Backlog!A48:L93",
  include: "values,formulas",
  tableMaxRows: 50,
  tableMaxCols: 12,
  tableMaxCellChars: 180,
});
await fs.mkdir(workDir, { recursive: true });
await fs.writeFile(`${workDir}/p2-verification.ndjson`, verification.ndjson);

const dashboardVerification = await workbook.inspect({
  kind: "table",
  range: "Dashboard!A5:B11",
  include: "values,formulas",
  tableMaxRows: 10,
  tableMaxCols: 2,
  tableMaxCellChars: 180,
});
await fs.writeFile(`${workDir}/dashboard-verification.ndjson`, dashboardVerification.ndjson);

const formulaErrors = await workbook.inspect({
  kind: "match",
  searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A",
  options: { useRegex: true, maxResults: 300 },
  summary: "formula error scan after P2 update",
});
await fs.writeFile(`${workDir}/formula-errors.ndjson`, formulaErrors.ndjson);

const renderRanges = {
  Dashboard: "A1:H16",
  "Milestone Backlog": "A1:L100",
  "Framework Inventory": "A1:G20",
  "Coverage Matrix": "A1:Q100",
  "Feature Checklist": "A1:D23",
  "Sources & Scope": "A1:D24",
};

for (const [sheetName, range] of Object.entries(renderRanges)) {
  const preview = await workbook.render({
    sheetName,
    range,
    scale: 1,
    format: "png",
  });
  const safeName = sheetName.replace(/[^a-z0-9_-]+/gi, "_");
  await fs.writeFile(
    `${workDir}/final_${safeName}.png`,
    new Uint8Array(await preview.arrayBuffer()),
  );
}

await fs.mkdir(outputDir, { recursive: true });
const output = await SpreadsheetFile.exportXlsx(workbook);
await output.save(outputPath);

console.log(JSON.stringify({
  outputPath,
  p2RowCount: p2Components.length,
  formulaErrors: formulaErrors.ndjson,
  verification: verification.ndjson,
  dashboardVerification: dashboardVerification.ndjson,
}, null, 2));
