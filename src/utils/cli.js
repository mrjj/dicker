/**
 *
 * @param args
 * @returns {any}
 */
const formatBuildArgs = args => (args
  ? Object.keys(args).sort().map(k => `--build-arg "${k}=${args[k].replace('"', '\\\\"')}"`)
  : '');

/**
 *
 * @param args
 * @returns {any}
 */
const formatArgs = args => (args
  ? Object.keys(args).sort().map(k => `${k} ${args[k]}`)
  : '');

module.exports = { formatBuildArgs, formatArgs };
