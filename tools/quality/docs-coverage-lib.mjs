/**
 * Docs coverage model shared by the CI gate (check-docs-coverage.mjs).
 *
 * A documentation "family" is the unit the docs app publishes per route:
 * the canonical component directory (button, card, progress) or, for the
 * p2 monolith files, the first selector token of the declaration. Every
 * inventoried component class belongs to exactly one family, and every
 * family needs a catalog entry plus a resolvable documentation route.
 */

/** Catalog ids that intentionally duplicate another family's entry. */
export const CATALOG_ID_FAMILY_ALIASES = {
  // FileUploaderComponent answers for both selectors; both routes stay.
  'file-upload': 'file-uploader',
};

/**
 * Declarations that share a directory with another public family.
 * Keyed by declaration name so future moves are caught by the gate.
 */
const DECLARATION_FAMILY_OVERRIDES = new Map([
  ['PopoverComponent', 'popover'],
  // Addon is documented as part of the input-group family page.
  ['InputGroupAddonComponent', 'input-group'],
]);

const kebabCase = (value) =>
  value
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();

export function deriveFamilyId(declaration) {
  const overridden = DECLARATION_FAMILY_OVERRIDES.get(declaration.name);
  if (overridden) return overridden;
  const firstSelector = (declaration.selector ?? '').split(',')[0].trim();
  if (declaration.file.startsWith('projects/orc-ds/p2/')) {
    if (!firstSelector) {
      throw new Error(
        `p2 declaration ${declaration.name} has no selector to derive a family id from`,
      );
    }
    return kebabCase(firstSelector.replace(/^orc-/, ''));
  }
  // Canonical components are grouped by their root library directory:
  // sub-components (card-header, file-item, otp-slot...) join the family.
  const segments = declaration.file.split('/');
  const libraryRoot = segments.indexOf('orc-ds');
  return segments[libraryRoot + 1];
}

export function buildFamilyIndex(declarations) {
  const index = new Map();
  for (const declaration of declarations) {
    const family = deriveFamilyId(declaration);
    const members = index.get(family) ?? [];
    members.push(declaration.name);
    index.set(family, members);
  }
  for (const [family, members] of index) index.set(family, members.sort());
  return index;
}

const routeComponentId = (route) =>
  typeof route === 'string'
    ? route.match(/^\/components\/([^/?#]+)/)?.[1]
    : undefined;

export function evaluateCoverage({ declarations, catalogEntries, routePaths }) {
  const familyIndex = buildFamilyIndex(declarations);
  const routes = new Set(routePaths);
  const genericFallback = routes.has('components/:componentId');
  const seen = new Map();
  const duplicateCatalogIds = [];
  for (const entry of catalogEntries) {
    if (seen.has(entry.id)) duplicateCatalogIds.push(entry.id);
    seen.set(entry.id, entry);
  }

  const missingCatalog = [...familyIndex.keys()]
    .filter(
      (family) =>
        !catalogEntries.some((entry) => {
          if (entry.id === family) return true;
          return CATALOG_ID_FAMILY_ALIASES[entry.id] === family;
        }),
    )
    .sort();

  const catalogIdsWithoutFamily = catalogEntries
    .map((entry) => entry.id)
    .filter((id) => !familyIndex.has(id) && !(id in CATALOG_ID_FAMILY_ALIASES))
    .sort();

  const unresolvedRoutes = catalogEntries
    .filter((entry) => {
      const id = routeComponentId(entry.route);
      if (!id) return true;
      return !routes.has(`components/${id}`) && !genericFallback;
    })
    .map((entry) => ({ id: entry.id, route: entry.route }));

  const documentedFamilies = new Set(
    catalogEntries.map((entry) =>
      entry.id in CATALOG_ID_FAMILY_ALIASES
        ? CATALOG_ID_FAMILY_ALIASES[entry.id]
        : entry.id,
    ),
  );
  const coveredComponents = [...familyIndex].reduce(
    (total, [family, members]) =>
      total + (documentedFamilies.has(family) ? members.length : 0),
    0,
  );

  return {
    families: [...familyIndex.keys()].sort(),
    familyIndex,
    missingCatalog,
    duplicateCatalogIds,
    catalogIdsWithoutFamily,
    unresolvedRoutes,
    totalComponents: declarations.length,
    coveredComponents,
  };
}
