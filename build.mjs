import * as esbuild from 'esbuild';
import { cpSync, mkdirSync, existsSync } from 'fs';

const isWatch = process.argv.includes('--watch');

// Ensure dist directories exist
mkdirSync('dist', { recursive: true });
mkdirSync('dist/popup', { recursive: true });

// Copy static files
cpSync('manifest.json', 'dist/manifest.json');
if (existsSync('icons')) {
  cpSync('icons', 'dist/icons', { recursive: true });
}
if (existsSync('src/popup/popup.html')) {
  cpSync('src/popup/popup.html', 'dist/popup/popup.html');
}

// Content script and popup must be iife (not esm)
const contentBuildOptions = {
  entryPoints: ['src/content.ts', 'src/popup/popup.ts'],
  bundle: true,
  outdir: 'dist',
  outbase: 'src',
  format: 'iife',
  target: 'es2020',
  sourcemap: false,
};

// Background service worker can be esm
const backgroundBuildOptions = {
  entryPoints: ['src/background.ts'],
  bundle: true,
  outdir: 'dist',
  outbase: 'src',
  format: 'esm',
  target: 'es2020',
  sourcemap: false,
};

if (isWatch) {
  const ctx1 = await esbuild.context(contentBuildOptions);
  const ctx2 = await esbuild.context(backgroundBuildOptions);
  await Promise.all([ctx1.watch(), ctx2.watch()]);
  console.log('Watching for changes...');
} else {
  await Promise.all([
    esbuild.build(contentBuildOptions),
    esbuild.build(backgroundBuildOptions),
  ]);
  console.log('Build complete!');
}
