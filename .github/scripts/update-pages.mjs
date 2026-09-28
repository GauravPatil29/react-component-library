import {
  cpSync,
  existsSync,
  lstatSync,
  mkdirSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { resolve, join } from 'node:path';

const root = resolve('pages-state');
const incoming = resolve('incoming-storybook');
const output = resolve('pages-site');
const mode = process.env.PUBLISH_MODE;
const number = process.env.PR_NUMBER;

if (!['production', 'preview', 'remove'].includes(mode)) throw new Error('Invalid publish mode');
if (mode !== 'production' && !/^[1-9]\d*$/.test(number ?? '')) throw new Error('Invalid PR number');
if (!existsSync(root)) throw new Error('Missing site state directory');

// PR artifacts are static data. Reject links and hidden paths before copying any files.
function validate(directory) {
  for (const name of readdirSync(directory)) {
    const path = join(directory, name);
    const stat = lstatSync(path);
    if (name.startsWith('.') || stat.isSymbolicLink())
      throw new Error(`Unsafe artifact entry: ${name}`);
    if (stat.isDirectory()) validate(path);
    else if (!stat.isFile()) throw new Error(`Unsupported artifact entry: ${name}`);
  }
}

if (mode !== 'remove') {
  validate(incoming);
  if (!existsSync(join(incoming, 'index.html'))) throw new Error('Storybook index.html is missing');
}

if (mode === 'production') {
  // Reserve preview paths so a production update cannot delete or overwrite previews.
  if (readdirSync(incoming).some((name) => /^pr-\d+$/.test(name)))
    throw new Error('Reserved preview path');
  for (const name of readdirSync(root)) {
    if (name === '.git' || /^pr-\d+$/.test(name)) continue;
    rmSync(join(root, name), { recursive: true, force: true });
  }
  cpSync(incoming, root, { recursive: true });
} else {
  const destination = join(root, `pr-${number}`);
  rmSync(destination, { recursive: true, force: true });
  if (mode === 'preview') cpSync(incoming, destination, { recursive: true });
}

writeFileSync(join(root, '.nojekyll'), '');
if (!existsSync(join(root, 'index.html'))) {
  writeFileSync(
    join(root, 'index.html'),
    '<!doctype html><title>Storybook</title><h1>Production Storybook has not been deployed yet.</h1>',
  );
}
mkdirSync(output, { recursive: true });
for (const name of readdirSync(root)) {
  if (name === '.git') continue;
  cpSync(join(root, name), join(output, name), { recursive: true });
}
