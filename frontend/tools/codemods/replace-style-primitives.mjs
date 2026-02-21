import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve('src/components');
const EXCLUDED_DIRS = new Set(['shared']);
const TARGET_EXT = '.jsx';

const REPLACEMENTS = [
  {
    regex: /bg-white\s+rounded-lg\s+shadow(?:-[a-z]+)?/g,
    replacement: 'card'
  },
  {
    regex: /bg-blue-600\s+text-white\s+rounded(?:-lg|-md)?\s+hover:bg-blue-700/g,
    replacement: 'btn-primary'
  },
  {
    regex: /bg-red-600\s+text-white\s+rounded(?:-lg|-md)?\s+hover:bg-red-700/g,
    replacement: 'btn-danger'
  },
  {
    regex:
      /border\s+border-gray-300\s+rounded-lg\s+focus:ring-2\s+focus:ring-(?:blue|green)-500(?:\s+focus:border-(?:transparent|blue-500))?/g,
    replacement: 'input-field'
  }
];

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!EXCLUDED_DIRS.has(entry.name)) {
        files.push(...walk(fullPath));
      }
      continue;
    }
    if (entry.isFile() && fullPath.endsWith(TARGET_EXT)) {
      files.push(fullPath);
    }
  }
  return files;
}

let modifiedCount = 0;
for (const file of walk(ROOT)) {
  const original = fs.readFileSync(file, 'utf8');
  let next = original;
  for (const { regex, replacement } of REPLACEMENTS) {
    next = next.replace(regex, replacement);
  }
  if (next !== original) {
    fs.writeFileSync(file, next, 'utf8');
    modifiedCount += 1;
  }
}

console.log(`Codemod complete. Updated ${modifiedCount} file(s).`);
