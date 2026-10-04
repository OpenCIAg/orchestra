type SerializationResult = string | undefined;

const token = (kind: string, value: string): string =>
  `${kind}${value.length}:${value}`;

function isPlainObject(value: object): boolean {
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function serializeSelectionValue(
  value: unknown,
  ancestors: Map<object, string>,
  path: string,
): SerializationResult {
  if (value === undefined) return token('undefined', '');
  if (value === null) return token('null', '');

  switch (typeof value) {
    case 'string':
      return token('string', value);
    case 'boolean':
      return token('boolean', value ? 'true' : 'false');
    case 'number':
      if (Number.isNaN(value)) return token('number', 'NaN');
      if (Object.is(value, -0)) return token('number', '-0');
      if (value === Infinity) return token('number', 'Infinity');
      if (value === -Infinity) return token('number', '-Infinity');
      return token('number', String(value));
    case 'bigint':
      return token('bigint', String(value));
    case 'symbol':
    case 'function':
      return undefined;
  }

  if (value instanceof Date) {
    const timestamp = value.getTime();
    return token(
      'date',
      Number.isNaN(timestamp) ? 'invalid' : String(timestamp),
    );
  }

  if (!Array.isArray(value) && !isPlainObject(value)) return undefined;
  // Symbol-keyed records are outside the structural contract. Retain their
  // identity rather than silently treating them as an empty plain object.
  if (Object.getOwnPropertySymbols(value).length > 0) return undefined;

  const reference = ancestors.get(value);
  if (reference !== undefined) return token('reference', reference);
  ancestors.set(value, path);

  try {
    if (Array.isArray(value)) {
      let result = token('array-length', String(value.length)) + '[';
      for (let index = 0; index < value.length; index += 1) {
        if (!Object.prototype.hasOwnProperty.call(value, index)) {
          result += token('hole', '');
          continue;
        }
        const child = serializeSelectionValue(
          value[index],
          ancestors,
          `${path}${token('array-index', String(index))}`,
        );
        if (child === undefined) return undefined;
        result += child;
      }
      return result + ']';
    }

    const keys = Object.keys(value).sort();
    let result = '{';
    for (const key of keys) {
      const child = serializeSelectionValue(
        (value as Record<string, unknown>)[key],
        ancestors,
        `${path}${token('object-key', key)}`,
      );
      if (child === undefined) return undefined;
      result += token('key', key) + child;
    }
    return result + '}';
  } finally {
    // Only ancestors become references. Shared acyclic values are serialized
    // independently, so sharing does not change deep value equality.
    ancestors.delete(value);
  }
}

/**
 * Produce a deterministic structural key for supported deep selection values.
 * Unsupported objects retain identity, matching equals-mode's documented
 * object fallback while keeping cyclic arrays and plain objects safe.
 */
export function tableDeepSelectionKey(value: unknown): unknown {
  try {
    const serialized = serializeSelectionValue(value, new Map(), 'root');
    return serialized === undefined ? value : `deep:${serialized}`;
  } catch {
    return value;
  }
}
