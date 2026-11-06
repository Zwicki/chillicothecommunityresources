const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '..', 'src', 'data', 'resources.json');
const raw = fs.readFileSync(dataPath, 'utf-8');
const resources = JSON.parse(raw);

console.log(`Auditing ${resources.length} resources...`);

const ids = new Set();
const categories = new Set();
let errorCount = 0;

resources.forEach((r, idx) => {
  if (!r.id) {
    console.error(`[Error] Resource at index ${idx} missing id`);
    errorCount++;
  } else if (ids.has(r.id)) {
    console.error(`[Error] Duplicate id found: ${r.id}`);
    errorCount++;
  } else {
    ids.add(r.id);
  }

  if (!r.name) {
    console.error(`[Error] Resource ${r.id} missing name`);
    errorCount++;
  }

  if (!r.category) {
    console.error(`[Error] Resource ${r.id} missing category`);
    errorCount++;
  } else {
    categories.add(r.category);
  }
});

console.log(`\nValidation complete!`);
console.log(`Total valid resources: ${resources.length}`);
console.log(`Unique categories found: ${categories.size}`);
console.log(`Categories:`, Array.from(categories).sort().join(', '));

if (errorCount === 0) {
  console.log(`\n ALL DATA INTEGRITY CHECKS PASSED PERFECTLY!`);
  process.exit(0);
} else {
  console.error(`\n ${errorCount} data errors detected.`);
  process.exit(1);
}
