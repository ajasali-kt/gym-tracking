import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve('src/components');
const EXCLUDED_DIRS = new Set(['shared']);
const TARGET_EXT = '.jsx';

const FORBIDDEN_PATTERNS = [
  {
    name: 'card',
    regex: /bg-white\s+rounded-lg\s+shadow(?:-[a-z]+)?/g,
    message: 'Use `.card` primitive.'
  },
  {
    name: 'primary-button',
    regex: /bg-blue-600\s+text-white\s+rounded(?:-lg|-md)?\s+hover:bg-blue-700/g,
    message: 'Use `.btn-primary` primitive.'
  },
  {
    name: 'danger-button',
    regex: /bg-red-600\s+text-white\s+rounded(?:-lg|-md)?\s+hover:bg-red-700/g,
    message: 'Use `.btn-danger` primitive.'
  },
  {
    name: 'input',
    regex:
      /border\s+border-gray-300\s+rounded-lg\s+focus:ring-2\s+focus:ring-(?:blue|green)-500(?:\s+focus:border-(?:transparent|blue-500))?/g,
    message: 'Use `.input-field` primitive.'
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

function lineNumberFromIndex(text, index) {
  return text.slice(0, index).split('\n').length;
}

const files = walk(ROOT);
const violations = [];

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  for (const pattern of FORBIDDEN_PATTERNS) {
    for (const match of content.matchAll(pattern.regex)) {
      const line = lineNumberFromIndex(content, match.index ?? 0);
      violations.push({
        file,
        line,
        found: match[0],
        message: pattern.message
      });
    }
  }
}

if (violations.length > 0) {
  console.error('Design primitive guard failed:\n');
  for (const v of violations) {
    const relative = path.relative(process.cwd(), v.file).replaceAll('\\', '/');
    console.error(`- ${relative}:${v.line}  ${v.message}`);
    console.error(`  Found: "${v.found}"`);
  }
  process.exit(1);
}

console.log('Design primitive guard passed.');
