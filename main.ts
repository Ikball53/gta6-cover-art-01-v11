// Vice Coast Cover Studio — entry handoff program for gta6-cover-art-01.
// Copies the static app and its screenshots into the output folder, then
// writes the dossier the scorer rebuilds and compares byte for byte.
// Deterministic by design: the same repository always writes the same bytes.
import { cpSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-app.ts';

const here = dirname(fileURLToPath(import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

function stageTree(name: string): void {
  const from = join(here, name);
  const into = join(outDir, name);
  rmSync(into, { recursive: true, force: true });
  cpSync(from, into, { recursive: true });
}

mkdirSync(outDir, { recursive: true });
stageTree('app');
stageTree('screenshots');

const dossierBytes = buildDossier(outDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
});
writeFileSync(join(outDir, 'dossier.json'), dossierBytes);
console.log('vice-coast dossier written to ' + outDir);
