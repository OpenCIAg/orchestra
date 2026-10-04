export interface TableCsvColumn {
  key: string;
  header: string;
}

/** Escape one CSV field using the delimiter selected by the table consumer. */
export function escapeTableCsvField(value: unknown, separator: string): string {
  const text = String(value ?? '');
  const needsQuotes =
    text.includes('"') ||
    text.includes('\n') ||
    text.includes('\r') ||
    (separator.length > 0 && text.includes(separator));
  return needsQuotes ? `"${text.replace(/"/g, '""')}"` : text;
}

/**
 * Build the CSV payload. `customHeader` is intentionally a complete, raw
 * header line for compatibility with the existing exportHeader input.
 */
export function buildTableCsv<T>(
  rows: readonly T[],
  columns: readonly TableCsvColumn[],
  separator: string,
  customHeader?: string,
  getValue: (row: T, key: string) => unknown = (row, key) =>
    (row as Record<string, unknown>)[key],
): string {
  const header =
    customHeader ??
    columns
      .map((column) => escapeTableCsvField(column.header, separator))
      .join(separator);

  // There are no meaningful body fields when no columns were configured.
  if (columns.length === 0) return header;

  const body = rows
    .map((row) =>
      columns
        .map((column) =>
          escapeTableCsvField(getValue(row, column.key), separator),
        )
        .join(separator),
    )
    .join('\n');
  return header + (rows.length > 0 ? `\n${body}` : '');
}
