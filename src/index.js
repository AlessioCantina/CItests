function hello() {
  return 'Hello World';
}

if (require.main === module) {
  console.log(hello());
}

module.exports = { hello };
