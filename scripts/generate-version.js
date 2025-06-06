#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

try {
  // Get the current commit hash
  const commitHash = execSync('git rev-parse --short HEAD', { encoding: 'utf-8' }).trim();
  
  // Get the current timestamp
  const buildTime = new Date().toISOString();
  
  // Get the current branch
  let branch = 'unknown';
  try {
    branch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf-8' }).trim();
  } catch (e) {
    console.warn('Could not get git branch:', e.message);
  }
  
  // Create version object
  const version = {
    commitHash,
    branch,
    buildTime,
    shortHash: commitHash.substring(0, 7)
  };
  
  // Ensure src directory exists
  const srcDir = path.join(__dirname, '../src');
  if (!fs.existsSync(srcDir)) {
    fs.mkdirSync(srcDir, { recursive: true });
  }
  
  // Write version file
  const versionPath = path.join(srcDir, 'version.ts');
  const versionContent = `// Auto-generated version file
// Do not edit manually

export const version = ${JSON.stringify(version, null, 2)};

export default version;
`;
  
  fs.writeFileSync(versionPath, versionContent);
  
  console.log(`✅ Version file generated: ${commitHash} (${branch})`);
  console.log(`📁 Saved to: ${versionPath}`);
  
} catch (error) {
  console.error('❌ Error generating version file:', error.message);
  
  // Create fallback version file
  const fallbackVersion = {
    commitHash: 'unknown',
    branch: 'unknown',
    buildTime: new Date().toISOString(),
    shortHash: 'unknown'
  };
  
  const srcDir = path.join(__dirname, '../src');
  if (!fs.existsSync(srcDir)) {
    fs.mkdirSync(srcDir, { recursive: true });
  }
  
  const versionPath = path.join(srcDir, 'version.ts');
  const versionContent = `// Auto-generated version file (fallback)
// Do not edit manually

export const version = ${JSON.stringify(fallbackVersion, null, 2)};

export default version;
`;
  
  fs.writeFileSync(versionPath, versionContent);
  console.log('📄 Created fallback version file');
  
  process.exit(1);
} 