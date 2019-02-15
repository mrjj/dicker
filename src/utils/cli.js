/**
 *
 * @param args
 * @returns {any}
 */
const formatBuildArgs = args => (args
  ? Object.keys(args).sort().map(k => `--build-arg "${k}=${args[k].replace('"', '\\\\"')}"`)
  : '');

module.exports = { formatBuildArgs };
