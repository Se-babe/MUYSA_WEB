#!/usr/bin/env node
/**
 * MUYSA Connect — pre-launch system check
 * Run from project root: npm run check
 */

import { existsSync, readFileSync } from 'fs';
import { execSync } from 'child_process';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const checks = [];
let failed = 0;

const pass = (name, detail = '') => checks.push({ ok: true, name, detail });
const fail = (name, detail = '') => { checks.push({ ok: false, name, detail }); failed += 1; };

// ─── Files ───────────────────────────────────────────────────────────────────
const requiredFiles = [
  'frontend/package.json',
  'frontend/.env.example',
  'frontend/src/firebase/config.js',
  'frontend/src/services/auth.js',
  'frontend/src/services/firestore.js',
  'firebase/firestore.rules',
  'firebase/firestore.indexes.json',
  'firebase.json',
  '.firebaserc',
];

requiredFiles.forEach((f) => {
  if (existsSync(join(root, f))) pass(`File: ${f}`);
  else fail(`File: ${f}`, 'missing');
});

// ─── Environment ─────────────────────────────────────────────────────────────
const envPath = join(root, 'frontend/.env');
if (existsSync(envPath)) {
  const env = readFileSync(envPath, 'utf8');
  const keys = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_APP_ID',
  ];
  keys.forEach((k) => {
    const line = env.split('\n').find((l) => l.startsWith(`${k}=`));
    const val = line?.split('=')[1]?.trim();
    if (val && !val.includes('your_') && !val.startsWith('your-')) {
      pass(`Env: ${k}`);
    } else {
      fail(`Env: ${k}`, 'not set or still placeholder');
    }
  });
} else {
  fail('frontend/.env', 'copy from .env.example and fill Firebase config');
}

// ─── Firestore rules security patterns ───────────────────────────────────────
const rules = readFileSync(join(root, 'firebase/firestore.rules'), 'utf8');
if (rules.includes("request.resource.data.role in ['student', 'alumni']")) {
  pass('Security: registration role restricted');
} else {
  fail('Security: registration role restricted', 'users create rule may allow admin self-assign');
}
if (rules.includes('ownerProfileUpdate()')) {
  pass('Security: owner cannot change role');
} else {
  fail('Security: owner cannot change role');
}
if (rules.includes('allow read: if isSignedIn()') && rules.includes('executives')) {
  pass('Security: executives require sign-in');
} else {
  fail('Security: executives require sign-in');
}

// ─── Build ───────────────────────────────────────────────────────────────────
try {
  execSync('npm run build --prefix frontend', { cwd: root, stdio: 'pipe' });
  pass('Build: production build succeeds');
} catch (e) {
  fail('Build: production build succeeds', e.stderr?.toString().slice(0, 200) || 'failed');
}

// ─── Report ──────────────────────────────────────────────────────────────────
console.log('\nMUYSA Connect — System Check\n' + '─'.repeat(40));
checks.forEach(({ ok, name, detail }) => {
  const icon = ok ? '✔' : '✘';
  console.log(`${icon} ${name}${detail ? ` — ${detail}` : ''}`);
});
console.log('─'.repeat(40));
console.log(`${checks.length - failed}/${checks.length} passed\n`);

if (failed > 0) {
  console.log('Fix the failed checks before inviting members.\n');
  process.exit(1);
}

console.log('System ready for member onboarding.\n');
console.log('Next steps:');
console.log('  1. npm run deploy:rules     # deploy latest Firestore rules');
console.log('  2. npm run deploy:hosting   # publish the live site');
console.log('  3. Set role: admin in Firestore for your account');
console.log('  4. Add executive records via Manage Executives\n');
