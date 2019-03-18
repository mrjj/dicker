const fs = require('fs');
const path = require('path');
const shell = require('shelljs');
const yaml = require('js-yaml');
const { forceArray } = require('./utils/lists');
const { info, error } = require('./utils/logger');
const C = require('./constants');

const __ENTRY_POINT = shell.pwd().toString();


/**
 *
 * @param manifestPath
 * @returns {string}
 */
const locateManifest = (manifestPath = '.') => {
  let mp = path.isAbsolute(manifestPath || '.')
    ? manifestPath
    : path.resolve(path.relative(__ENTRY_POINT, manifestPath));
  if (fs.statSync(mp).isDirectory()) {
    const files = fs.readdirSync(mp);
    const possibleManifestNames = files.sort().filter(
      fileName => (C.POSSIBLE_EXTENSIONS.indexOf(path.extname(fileName.toLowerCase())) !== -1),
    );
    if (possibleManifestNames.length === 0) {
      error(`Manifest path was not found at: "${mp}", exiting with code 1`);
      shell.exit(1);
    } else if (possibleManifestNames.length > 1) {
      const pmpStr = possibleManifestNames.map(pmp => `"${pmp}"`).join(' ');
      error(`Warning: More than one possible manifest path is found: ${pmpStr}`);
    }
    mp = path.join(manifestPath, possibleManifestNames[0]);
  }
  return mp;
};


const loadManifest = async (manifestPath) => {
  const mp = locateManifest(manifestPath || '.');
  info(`Loading manifest file: "${mp}"`);
  if (!shell.test('-f', mp)) {
    error(`Manifest path do not exists: "${mp}", exiting with code 1`);
    shell.exit(1);
  } else {
    let tasks = [];
    const ext = path.extname(manifestPath).toLowerCase();
    if (C.POSSIBLE_EXTENSIONS.indexOf(ext) === -1) {
      throw new Error(`Unknown file format: "${ext}" of file "${mp}"`);
    }
    const data = fs.readFileSync(mp, C.DEFAULT_ENCODING);
    if (['.json'].indexOf(ext) !== -1) {
      tasks = forceArray(JSON.parse(data));
    } else if (['.yaml', '.yml'].indexOf(ext) !== -1) {
      tasks = forceArray(yaml.safeLoad(data));
    }
    if (tasks.length === 0) {
      error(`No tasks defined in manifest: "${mp}", exiting with code 0`);
      shell.exit(0);
      return 0;
    }
    info(`Tasks loaded:        ${tasks.length} (also one service task: "${C.ROOT_TASK.task}" will be used)`);
    return tasks;
  }
  return [];
};

module.exports = {
  loadManifest,
  locateManifest,
};
