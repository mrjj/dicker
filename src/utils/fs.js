/**
 * @fileOverview File system utils
 */
const shell = require('shelljs');

/**
 * Recursively remove directory like `rm -rf`
 *
 * Taken from: https://stackoverflow.com/a/32197381
 * @param path {string} - path to remove
 */
const rmrf = path => shell.rm('-rf', path);

/**
 * Works like `mkdir -p`
 *
 * @param dirPath {string} - path to directory that should be created
 * @param recreate {boolean} - remove path first
 */
const mkdirp = (dirPath, recreate = false) => {
  if (recreate) {
    rmrf(dirPath);
  }
  shell.mkdir('-p', dirPath);
};

module.exports = {
  mkdirp,
  rmrf,
};
