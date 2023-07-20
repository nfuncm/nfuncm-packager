#!/usr/bin/env node

const packager = require("../src/index.js");

(async () => {
  await packager(process.argv.slice(2));
})();
