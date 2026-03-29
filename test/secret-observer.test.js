const test = require('node:test');

// This test is intentionally harmless. It never prints the secret value.
// It only reports whether a demo secret was available to the workflow.
test('report whether DEMO_SECRET was exposed to this run', (t) => {
  const present = Boolean(process.env.DEMO_SECRET);
  console.log(`DEMO_SECRET_PRESENT=${present}`);
});
