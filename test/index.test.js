const test = require('node:test');
const assert = require('node:assert');
const { hello } = require('../src/index');

test('hello() returns Hello Lab', () => {
  assert.strictEqual(hello(), 'Hello World');
});
