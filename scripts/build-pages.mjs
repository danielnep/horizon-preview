import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// A mesma interface publicada em dist/ também precisa de uma entrada na raiz
// quando o GitHub Pages publica a branch main a partir de /(root).
const root = new URL('../', import.meta.url);
const source = readFileSync(new URL('dist/index.html', root), 'utf8');
const entry = source.replace(/\b(href|src)="\.\/([^"\s]+)"/g, '$1="./dist/$2"');
const target = new URL('index.html', root);

if (process.argv.includes('--check')) {
  let actual = '';
  try { actual = readFileSync(target, 'utf8'); } catch {}
  if (actual !== entry) {
    console.error('A entrada do GitHub Pages está desatualizada. Execute npm run pages.');
    process.exitCode = 1;
  } else {
    console.log('Entrada do GitHub Pages corresponde ao aplicativo em dist/.');
  }
} else {
  writeFileSync(target, entry);
  writeFileSync(new URL('.nojekyll', root), '');
  console.log('Aplicativo pronto para o GitHub Pages: ' + fileURLToPath(target));
}
