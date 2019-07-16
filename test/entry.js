// mocha entry point

process.env.NODE_ENV = process.env.NODE_ENV || "test";

require("ts-node/register/transpile-only");
require("tsconfig-paths/register");

// require chai plugins or mocha specific files here...
require("chai").use(require("chai-as-promised"));
