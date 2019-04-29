const fs = require('fs');
const path = require('path');
const shell = require('shelljs');

const yaml = require('js-yaml');

const { forceArray, promiseMap } = require('./utils/lists');
const { defaults } = require('./utils/objects');
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


const loadManifest = async (inputManifestPath) => {
  const manifestPath = locateManifest(inputManifestPath || '.');
  if (!shell.test('-f', manifestPath)) {
    error(`Manifest path do not exists: "${manifestPath}", exiting with code 1`);
    shell.exit(1);
  }
  info(`Loading manifest file: "${manifestPath}"`);
  let tasks = [];
  const ext = path.extname(manifestPath).toLowerCase();
  if (C.POSSIBLE_EXTENSIONS.indexOf(ext) === -1) {
    throw new Error(`Unknown file format: "${ext}" of file "${manifestPath}"`);
  }
  const data = fs.readFileSync(manifestPath, C.DEFAULT_ENCODING).toString();
  if (['.json'].indexOf(ext) !== -1) {
    tasks = forceArray(JSON.parse(data));
  } else if (['.yaml', '.yml'].indexOf(ext) !== -1) {
    tasks = forceArray(yaml.safeLoad(data));
  }
  if (tasks.length === 0) {
    error(`No tasks defined in manifest: "${manifestPath}", exiting with code 0`);
    return [];
  }
  info(`Tasks loaded:        ${tasks.length} (also one service task: "${C.ROOT_TASK.task}" will be used)`);
  return tasks.map(task => ({ ...task, manifestPath }));
};

const loadManifests = async (manifestPaths, { args, buildArgs }) => (
  await promiseMap(manifestPaths, loadManifest)
).reduce(
  (acc, { tasks, manifestPath }) => acc.concat(
    tasks.map(task => defaults(task, { manifestPath, args, buildArgs })),
    [],
  ),
);


module.exports = {
  loadManifests,
};
