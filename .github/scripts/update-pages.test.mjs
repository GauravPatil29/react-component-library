import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const script = fileURLToPath(new URL('./update-pages.mjs', import.meta.url));

function fixture(t) {
  const root = mkdtempSync(join(tmpdir(), 'storybook-workflow-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const write = (path, value = 'content') => {
    const full = join(root, path);
    mkdirSync(join(full, '..'), { recursive: true });
    writeFileSync(full, value);
  };
  write('pages-state/.git', 'worktree marker');
  write('pages-state/index.html', 'production');
  write('pages-state/pr-1/index.html', 'preview one');
  write('pages-state/old.js');
  write('incoming-storybook/index.html', 'new storybook');
  return {
    write,
    run(mode, number = '') {
      return spawnSync(process.execPath, [script], {
        cwd: root,
        encoding: 'utf8',
        env: { ...process.env, PUBLISH_MODE: mode, PR_NUMBER: number },
      });
    },
    read(path) {
      return readFileSync(join(root, path), 'utf8');
    },
    exists(path) {
      return existsSync(join(root, path));
    },
  };
}

test('production refresh preserves previews and git metadata', (t) => {
  const f = fixture(t);
  const result = f.run('production');
  assert.equal(result.status, 0, result.stderr);
  assert.equal(f.read('pages-site/index.html'), 'new storybook');
  assert.equal(f.read('pages-site/pr-1/index.html'), 'preview one');
  assert.equal(f.read('pages-state/.git'), 'worktree marker');
  assert.equal(f.exists('pages-state/old.js'), false);
  assert.equal(f.exists('pages-site/.git'), false);
});

test('preview replaces only its own directory', (t) => {
  const f = fixture(t);
  f.write('pages-state/pr-2/stale.js');
  const result = f.run('preview', '2');
  assert.equal(result.status, 0, result.stderr);
  assert.equal(f.read('pages-site/index.html'), 'production');
  assert.equal(f.read('pages-site/pr-1/index.html'), 'preview one');
  assert.equal(f.read('pages-site/pr-2/index.html'), 'new storybook');
  assert.equal(f.exists('pages-state/pr-2/stale.js'), false);
});

test('closing a PR removes only its preview', (t) => {
  const f = fixture(t);
  const result = f.run('remove', '1');
  assert.equal(result.status, 0, result.stderr);
  assert.equal(f.exists('pages-site/pr-1'), false);
  assert.equal(f.read('pages-site/index.html'), 'production');
});

test('rejects invalid PR destinations before changing state', (t) => {
  const f = fixture(t);
  assert.notEqual(f.run('preview', '../outside').status, 0);
  assert.equal(f.read('pages-state/index.html'), 'production');
});

test('rejects hidden artifact files', (t) => {
  const f = fixture(t);
  f.write('incoming-storybook/.git/config');
  assert.notEqual(f.run('preview', '2').status, 0);
  assert.equal(f.exists('pages-state/pr-2'), false);
});

test('rejects production artifacts that overwrite a preview', (t) => {
  const f = fixture(t);
  f.write('incoming-storybook/pr-1/index.html', 'overwrite');
  assert.notEqual(f.run('production').status, 0);
  assert.equal(f.read('pages-state/pr-1/index.html'), 'preview one');
});
