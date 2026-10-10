import { readFileSync, writeFileSync, existsSync } from 'node:fs';

// Mantém a entrada da raiz igual ao aplicativo original publicado em dist/.
const root = new URL('../', import.meta.url);
const source = readFileSync(new URL('dist/index.html', root), 'utf8');
const entry = source.replace(/\b(href|src)="\.\/([^"\s]+)"/g, '$1="./dist/$2"');
const target = new URL('index.html', root);

if (process.argv.includes('--check')) {
  if (!existsSync(target) || readFileSync(target, 'utf8') !== entry || !existsSync(new URL('.nojekyll', root))) {
    console.error('Execute npm run pages para atualizar a entrada da raiz.');
    process.exitCode = 1;
  } else {
    console.log('Entrada da raiz conferida com o aplicativo original.');
  }
} else {
  writeFileSync(target, entry);
  writeFileSync(new URL('.nojekyll', root), '');
  console.log('Entrada da raiz pronta.');
}
