export interface FilteredTreeNode<T> {
  node: T;
  level: number;
}

interface NestedTreeNode<T> {
  children?: T[];
}

/** Filter tree data without coupling search to the component's expansion state. */
export function filterTreeNodes<T extends NestedTreeNode<T>>(
  roots: T[],
  query: string,
  fields: string | string[] | undefined,
  mode: string,
  locale?: string,
): FilteredTreeNode<T>[] {
  const term = normalize(query.trim(), locale);
  if (!term) return [];

  const searchFields = normalizeFields(fields);
  const strict = mode === 'strict';
  const result: FilteredTreeNode<T>[] = [];

  const includeSubtree = (node: T, level: number): void => {
    result.push({ node, level });
    for (const child of node.children ?? []) includeSubtree(child, level + 1);
  };

  const visit = (nodes: T[], level: number): boolean => {
    let anyMatch = false;
    for (const node of nodes) {
      const matches = searchFields.some((field) =>
        valuesAtPath(node, field).some((value) =>
          normalize(value, locale).includes(term),
        ),
      );
      if (matches && !strict) {
        includeSubtree(node, level);
        anyMatch = true;
        continue;
      }

      const start = result.length;
      const descendantMatches = visit(node.children ?? [], level + 1);
      if (matches || descendantMatches) {
        result.splice(start, 0, { node, level });
        anyMatch = true;
      }
    }
    return anyMatch;
  };

  visit(roots, 1);
  return result;
}

function normalizeFields(fields: string | string[] | undefined): string[] {
  const values = Array.isArray(fields) ? fields : (fields ?? '').split(',');
  const result = values.map((field) => field.trim()).filter(Boolean);
  return result.length ? result : ['label'];
}

function valuesAtPath(node: unknown, path: string): Array<string | number> {
  let value = node;
  for (const segment of path.split('.')) {
    if (value === null || typeof value !== 'object') return [];
    value = (value as Record<string, unknown>)[segment];
  }
  const values = Array.isArray(value) ? value : [value];
  return values.flatMap((item) =>
    typeof item === 'string' || typeof item === 'number' ? [item] : [],
  );
}

function normalize(value: string | number, locale?: string): string {
  try {
    return String(value).toLocaleLowerCase(locale);
  } catch {
    return String(value).toLowerCase();
  }
}
