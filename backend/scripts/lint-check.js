// @ts-nocheck
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const rootDir = path.join(__dirname, '..');
const ignoredDirectories = new Set(['node_modules', '.git', 'coverage', 'dist', 'build', 'logs']);

const collectJavaScriptFiles = (directory) => {
  const entries = fs.readdirSync(directory, { withFileTypes: true });
  const files = [];

  entries.forEach((entry) => {
    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      if (!ignoredDirectories.has(entry.name)) {
        files.push(...collectJavaScriptFiles(fullPath));
      }

      return;
    }

    if (entry.isFile() && entry.name.endsWith('.js')) {
      files.push(fullPath);
    }
  });

  return files;
};

const run = () => {
  const files = collectJavaScriptFiles(rootDir);
  let failed = 0;

  files.forEach((file) => {
    const result = spawnSync(process.execPath, ['--check', file], {
      encoding: 'utf8'
    });

    if (result.status !== 0) {
      failed += 1;
      console.error(`[LINT] Failed: ${path.relative(rootDir, file)}`);
      if (result.stderr) {
        console.error(result.stderr.trim());
      }
    }
  });

  if (failed > 0) {
    console.error(`[LINT] ${failed}/${files.length} JavaScript files failed syntax checks`);
    process.exitCode = 1;
    return;
  }

  console.log(`[LINT] ${files.length} JavaScript files passed syntax checks`);
};

run();
