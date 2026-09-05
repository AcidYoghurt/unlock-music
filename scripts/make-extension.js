#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const rootDirectory = path.resolve(scriptDirectory, '..');
const sourceDirectory = path.join(rootDirectory, 'src', 'extension');
const destinationDirectory = path.join(rootDirectory, 'dist');

fs.readdirSync(sourceDirectory).forEach((file) => {
  const sourcePath = path.join(sourceDirectory, file);
  const destinationPath = path.join(destinationDirectory, file);
  fs.copyFileSync(sourcePath, destinationPath);
  console.log(`Copy: ${sourcePath} => ${destinationPath}`);
});

const manifest = JSON.parse(fs.readFileSync(path.join(rootDirectory, 'extension-manifest.json'), 'utf8'));
const packageInfo = JSON.parse(fs.readFileSync(path.join(rootDirectory, 'package.json'), 'utf8'));

let extensionVersion = packageInfo.version;
if (extensionVersion.startsWith('v')) extensionVersion = extensionVersion.slice(1);
if (extensionVersion.includes('-')) extensionVersion = extensionVersion.split('-')[0];
manifest.version = `${extensionVersion}.${packageInfo.ext_build}`;
manifest.version_name = packageInfo.version;

fs.writeFileSync(path.join(destinationDirectory, 'manifest.json'), JSON.stringify(manifest), 'utf8');
console.log('Write: manifest.json');
