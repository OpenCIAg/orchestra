import fs from 'node:fs';
import path from 'node:path';

const file = path.join(process.cwd(), 'compatibility/primeng-v19.md');
const rows = fs.readFileSync(file, 'utf8').split('\n')
  .map(line => line.match(/^\|\s*([^|]+)\|\s*([^|]+)\|\s*([0-3])\s*\|/))
  .filter(Boolean)
  .map(([, primeNg, equivalent, score]) => ({ primeNg: primeNg.trim(), equivalent: equivalent.trim(), score: Number(score) }));

if (!rows.length) throw new Error(`No compatibility rows found in ${file}`);
const total = rows.reduce((sum, row) => sum + row.score, 0);
const maximum = rows.length * 3;
console.log(`PrimeNG v19 compatibility: ${total}/${maximum} (${(total / maximum * 100).toFixed(1)}%) across ${rows.length} entries`);
for (const score of [0, 1, 2, 3]) {
  console.log(`  score ${score}: ${rows.filter(row => row.score === score).length}`);
}
