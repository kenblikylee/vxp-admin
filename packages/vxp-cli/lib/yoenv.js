const env = require("yeoman-environment").createEnv();

env.register(require.resolve("./generators/app"), "app");

// env.run('app ' + process.argv.slice(2).join(' '));

module.exports = env;
