const { execSync } = require('child_process');
const fs = require('fs');

try {
  console.log("Running npm run lint...");
  const lintOut = execSync('npm run lint', { encoding: 'utf-8' });
  fs.writeFileSync('lint_out.txt', lintOut);
} catch (error) {
  fs.writeFileSync('lint_out.txt', error.stdout || error.message);
}

try {
  console.log("Running tsc...");
  const tscOut = execSync('npx tsc --noEmit', { encoding: 'utf-8' });
  fs.writeFileSync('tsc_out.txt', tscOut);
} catch (error) {
  fs.writeFileSync('tsc_out.txt', error.stdout || error.message);
}
console.log("Done");
