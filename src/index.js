function hello() {
  return 'Hello Lab';
}

if (require.main === module) {
  console.log(hello());
}

module.exports = { hello };
