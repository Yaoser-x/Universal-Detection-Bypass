import { readFile, readdir, writeFile, mkdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const srcDir = join(repoRoot, 'src');
const distDir = join(repoRoot, 'dist');

// --- Read main.js and extract metadata block ---
const mainSrc = await readFile(join(srcDir, 'main.js'), 'utf8');
const metadataMatch = mainSrc.match(/^\/\/ ==UserScript==[\s\S]*?^\/\/ ==\/UserScript==\r?\n?/m);

if (!metadataMatch) {
    throw new Error('Missing userscript metadata block in src/main.js');
}

const metadata = metadataMatch[0].trimEnd();

// --- Read package.json and validate version ---
const packageJson = JSON.parse(await readFile(join(repoRoot, 'package.json'), 'utf8'));
const userscriptVersion = metadata.match(/^\/\/ @version\s+(.+)$/m)?.[1];

if (packageJson.version !== userscriptVersion) {
    throw new Error(`Version mismatch: package.json=${packageJson.version}, userscript=${userscriptVersion}`);
}

const version = packageJson.version;

// --- Read core modules (sorted for deterministic order) ---
const coreDir = join(srcDir, 'core');
const coreFiles = (await readdir(coreDir)).filter(f => f.endsWith('.js')).sort();
const coreSources = [];
for (const file of coreFiles) {
    const content = await readFile(join(coreDir, file), 'utf8');
    // Replace {{VERSION}} placeholder with actual version
    const replaced = content.replace(/\{\{VERSION\}\}/g, version);
    coreSources.push(`    // ---- core/${file} ----\n${replaced.trimEnd().split('\n').map(l => '    ' + l).join('\n')}`);
}

// --- Read feature modules (sorted for deterministic order) ---
const modulesDir = join(srcDir, 'modules');
const moduleFiles = (await readdir(modulesDir)).filter(f => f.endsWith('.js')).sort();
const moduleSources = [];
for (const file of moduleFiles) {
    const content = await readFile(join(modulesDir, file), 'utf8');
    moduleSources.push(`    // ---- modules/${file} ----\n${content.trimEnd().split('\n').map(l => '    ' + l).join('\n')}`);
}

// --- Assemble final output ---
const output = [
    metadata,
    '',
    '(function () {',
    '    \'use strict\';',
    '',
    ...coreSources,
    '',
    ...moduleSources,
    '',
    '    // ============================================================',
    '    //  Boot',
    '    // ============================================================',
    '',
    `    log(\`v\${CONFIG.version} loading...\`);`,
    '    initAllModules();',
    '    log(\'All modules initialized. Detection bypass active.\');',
    '})();',
    '',
].join('\n');

// --- Write output ---
await mkdir(distDir, { recursive: true });
await writeFile(join(distDir, 'Universal-Detection-Bypass.user.js'), output, 'utf8');

console.log(`Built dist/Universal-Detection-Bypass.user.js v${version}`);
console.log(`  Core modules: ${coreFiles.join(', ')}`);
console.log(`  Feature modules: ${moduleFiles.join(', ')}`);
