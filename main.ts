import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { DossierError, buildDossier, type DossierCaps } from './vendor/makefun-game.ts';

const CAPS: DossierCaps = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
};

function run(): void {
  const repoRoot = resolve(import.meta.dirname);
  const outDir = resolve(process.env.MAKEFUN_OUTPUT_DIR || '/output');
  const srcGame = join(repoRoot, 'game');
  const srcShots = join(repoRoot, 'screenshots');

  if (!existsSync(srcGame) || !existsSync(srcShots)) {
    throw new Error('Expected game/ and screenshots/ directories in repository root');
  }

  mkdirSync(outDir, { recursive: true });
  const dstGame = join(outDir, 'game');
  const dstShots = join(outDir, 'screenshots');
  rmSync(dstGame, { recursive: true, force: true });
  rmSync(dstShots, { recursive: true, force: true });

  cpSync(srcGame, dstGame, { recursive: true, force: true });
  cpSync(srcShots, dstShots, { recursive: true, force: true });

  try {
    const dossierBytes = buildDossier(outDir, CAPS);
    writeFileSync(join(outDir, 'dossier.json'), dossierBytes);
  } catch (err) {
    if (err instanceof DossierError) {
      console.error(`Dossier build failed (${err.limit ?? 'input'}): ${err.message}`);
    }
    throw err;
  }
}

run();
