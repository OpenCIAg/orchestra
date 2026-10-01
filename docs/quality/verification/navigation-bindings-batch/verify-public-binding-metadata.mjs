import fs from "node:fs";
import path from "node:path";

const distribution = path.resolve(process.argv[2] ?? "dist/orc-ds");
const fesmDirectory = path.join(distribution, "fesm2022");
const expected = [
  ["MenuComponent", "onItemClick"],
  ["PanelMenuComponent", "onNodeSelect"],
  ["PanelMenuComponent", "onNodeExpand"],
  ["PanelMenuComponent", "onNodeCollapse"],
  ["MegaMenuComponent", "onItemClick"],
  ["DataViewComponent", "onChangeLayout"],
  ["SpeedDialComponent", "onVisibleChange"],
  ["OrderListComponent", "onReorder"],
  ["PickListComponent", "onMoveAllToTarget"],
  ["PickListComponent", "onMoveAllToSource"],
  ["TerminalComponent", "onCommand"],
  ["TreeComponent", "onNodeSelect"],
  ["TreeComponent", "onNodeUnselect"],
  ["TreeComponent", "onNodeExpand"],
  ["TreeComponent", "onNodeCollapse"],
  ["TreeTableComponent", "onNodeSelect"],
  ["TreeTableComponent", "onNodeUnselect"],
  ["TimelineComponent", "onItemClick"],
  ["BreadcrumbComponent", "onItemClick"],
  ["SplitButtonComponent", "onClick"],
  ["SplitButtonComponent", "onDropdownClick"],
];

const metadata = [];
for (const file of fs.readdirSync(fesmDirectory)) {
  if (!file.endsWith(".mjs")) continue;
  const source = fs.readFileSync(path.join(fesmDirectory, file), "utf8");
  for (const match of source.matchAll(/outputs:\s*\{([^}]*)\}/g)) {
    const before = source.slice(0, match.index);
    const typeMatches = [...before.matchAll(/type:\s*([A-Za-z_$][\w$]*)/g)];
    const component = typeMatches.at(-1)?.[1];
    if (!component) continue;
    const outputs = Object.fromEntries(
      [...match[1].matchAll(/([A-Za-z_$][\w$]*):\s*"([^"]+)"/g)].map(
        (entry) => [entry[1], entry[2]],
      ),
    );
    metadata.push({ file, component, outputs });
  }
}

const missing = [];
const duplicate = [];
for (const [component, alias] of expected) {
  const matches = metadata.filter(
    (entry) => entry.component === component && entry.outputs[alias] === alias,
  );
  if (matches.length === 0) missing.push({ component, alias });
  if (matches.length > 1)
    duplicate.push({
      component,
      alias,
      files: matches.map((entry) => entry.file),
    });
}

const result = {
  distribution,
  expectedBindings: expected.length,
  registeredBindings: expected.length - missing.length,
  missing,
  duplicate,
  pickListAllTransfer: expected
    .filter(([component]) => component === "PickListComponent")
    .map(([, alias]) => alias),
};
console.log(JSON.stringify(result, null, 2));
if (missing.length || duplicate.length) process.exitCode = 1;
