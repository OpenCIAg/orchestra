import "@angular/compiler";
import { appendFileSync } from "node:fs";
import { Component, ViewChild, enableProdMode } from "@angular/core";
import { bootstrapApplication } from "@angular/platform-browser";
import {
  provideServerRendering,
  renderApplication,
} from "@angular/platform-server";
import { provideRouter } from "@angular/router";

enableProdMode();

const encoded = process.argv[2];
if (!encoded) throw new Error("Missing encoded component fixture.");
const component = JSON.parse(
  Buffer.from(encoded, "base64url").toString("utf8"),
);
const packageName = process.env.ORC_SSR_PACKAGE ?? "@ciag/orchestra";
const requiredValues = {
  ariaLabel: "SSR action",
  item: { id: "ssr-navigation-item", label: "SSR item", href: "/" },
  fileData: {
    id: "ssr-file",
    name: "ssr.txt",
    type: "text/plain",
    size: 3,
    progress: 0,
    status: "pending",
  },
  toast: {
    id: "ssr-toast",
    type: "info",
    title: "SSR notification",
    message: "Rendered on the server",
    duration: 0,
    dismissible: true,
    showIcon: true,
    position: "top-right",
    pauseOnHover: true,
    createdAt: 0,
  },
};
const diagnostics = [];
const progressPath = process.env.ORC_SSR_PROGRESS;
function progress(update) {
  if (!progressPath) return;
  appendFileSync(progressPath, `${JSON.stringify(update)}\n`);
}
const originalWarn = console.warn;
const originalError = console.error;
console.warn = (...args) =>
  diagnostics.push({ level: "warn", text: args.map(String).join(" ") });
console.error = (...args) =>
  diagnostics.push({ level: "error", text: args.map(String).join(" ") });

function emit(result) {
  console.warn = originalWarn;
  console.error = originalError;
  console.log(`SSR_RESULT ${JSON.stringify({ ...result, diagnostics })}`);
}

function fixtureAttributes() {
  const unknown = component.required.filter(
    (name) => !(name in requiredValues),
  );
  if (unknown.length) {
    throw new Error(
      `No SSR fixture value is registered for required input(s): ${unknown.join(", ")}.`,
    );
  }
  return component.required
    .map((name) =>
      name === "ariaLabel" ? ' ariaLabel="SSR action"' : ` [${name}]="${name}"`,
    )
    .join("");
}

let type;
try {
  const module = await import(`${packageName}/${component.entry}`);
  type = module[component.name];
  if (!type) throw new Error(`Export is missing from ${component.entry}`);
  progress({ phase: "import", imported: true });
} catch (error) {
  emit({
    status: "failed",
    phase: "import",
    imported: false,
    error: String(error?.stack || error),
  });
  process.exitCode = 1;
}

if (type) {
  let attributes;
  try {
    attributes = fixtureAttributes();
  } catch (error) {
    emit({
      status: "failed",
      phase: "fixture",
      imported: true,
      instantiated: false,
      matchedSelector: false,
      defaultLifecycle: false,
      error: String(error?.stack || error),
    });
    throw error;
  }
  const template = `<section data-ssr-component="${component.name}"><${component.selector}${attributes ?? ""}>SSR fixture</${component.selector}></section>`;
  class Host {
    item = requiredValues.item;
    fileData = requiredValues.fileData;
    toast = requiredValues.toast;
  }
  Component({
    selector: "ssr-host",
    standalone: true,
    imports: [type],
    template,
  })(Host);
  ViewChild(type)(Host.prototype, "componentInstance");
  let instantiated = false;
  let matchedSelector = false;
  try {
    const html = await renderApplication(
      async (context) => {
        const appRef = await bootstrapApplication(
          Host,
          {
            providers: [provideServerRendering(), provideRouter([])],
          },
          context,
        );
        const root = appRef.components[0]?.location.nativeElement;
        const element = root?.querySelector(component.selector);
        matchedSelector = !!element;
        const instance = appRef.components[0]?.instance.componentInstance;
        instantiated = instance instanceof type;
        progress({
          phase: "instantiated",
          imported: true,
          instantiated,
          matchedSelector,
        });
        if (!matchedSelector || !instantiated) {
          throw new Error(
            `Angular did not create ${component.name} for selector ${component.selector}.`,
          );
        }
        progress({
          phase: "render-start",
          imported: true,
          instantiated: true,
          matchedSelector: true,
        });
        return appRef;
      },
      { document: "<ssr-host></ssr-host>", url: "/" },
    );
    if (!html.includes(`data-ssr-component="${component.name}"`)) {
      throw new Error("Rendered HTML omitted the fixture marker.");
    }
    emit({
      status: "rendered",
      phase: "render",
      imported: true,
      instantiated,
      matchedSelector,
      defaultLifecycle: true,
      htmlLength: html.length,
    });
    progress({
      phase: "rendered",
      imported: true,
      instantiated: true,
      matchedSelector: true,
      defaultLifecycle: true,
    });
  } catch (error) {
    emit({
      status: "failed",
      phase: "render",
      imported: true,
      instantiated,
      matchedSelector,
      defaultLifecycle: false,
      error: String(error?.stack || error),
    });
    process.exitCode = 1;
  }
}
