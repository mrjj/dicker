/**
 * @fileOverview Constants
 */

/**
 * @constant TASK_STATUS {Object}
 * @type {{DONE: string, FAILED: string, RUNNING: string, SKIPPED: string, PENDING: string}}
 */
const TASK_STATUS = {
  SKIPPED: 'SKIPPED',
  PENDING: 'PENDING',
  RUNNING: 'RUNNING',
  DONE: 'DONE',
  FAILED: 'FAILED',
  UNKNOWN: 'UNKNOWN',
};

const TASK_TYPES = {
  CONTROL: 'CONTROL',
  DOCKER_BUILD: 'DOCKER_BUILD',
  DOCKER_PUSH: 'DOCKER_PUSH',
};

const DEFAULT_TASK_TYPE = TASK_TYPES.DOCKER_BUILD;
const DEFAULT_TASK_STATUS = TASK_STATUS.PENDING;
const DEAD_TASK_NAME = '$_dead_$';
/**
 * @constant ROOT_TASK_NAME
 * @type {string}
 */
const ROOT_TASK = {
  type: TASK_TYPES.CONTROL,
  dependsOn: [],
  task: '$_root_task_$',
  description: 'Root task (will not be executed)',
  skip: false,
  status: DEFAULT_TASK_STATUS,
};

/**
 * @constant DEFAULT_MANIFEST_PATH
 * @type {string}
 */
const DEFAULT_MANIFEST_PATH = './build.json';

/**
 * @constant DEFAULT_IMAGE_NAME
 * @type {string}
 */
const DEFAULT_IMAGE_NAME = 'latest';


/**
 * @constant FACES
 *
 *   - HAPPY             `(^‿^)`
 *   - DEAD              `[X.X]`
 *   - DEAD_FOR_28_DAYS  `[X~x]`
 *   - NDE               `[x.x]`
 *   - SURPRISED         `[O.O]`
 *   - CALMED_DOWN       `[o.o]`
 *   - DONT_GIVE         ` -.- `
 *   - DIZZY             ` ~_~ `
 *   - NOT_ME            ` ._. `
 *   - HIDING            ` _._ `
 *   - INSPECTOR:        `[-.<]`  `[>.<]`   `[>.-]`
 *   - YES_BUT           `[ ! ]`
 */
const FACES = {
  HAPPY: '(^‿^)',
  DEAD: '{X.X}',
  DEAD_FOR_28_DAYS: '{X~x}',
  NDE: '{x.x}',
  AWAKENING: '[-.o]',
  SURPRISED: '[O.O]',
  CALMED_DOWN: '[o.o]',
  DONT_GIVE: [' -.- ', ' -.~ ', ' ~.~ ', ' ~.- '],
  DASH: '  -  ',
  DIZZY: '[~_~]',
  NOT_ME: ' -.- ',
  HIDING: ' _._ ',
  INSPECTOR: ['[-.<]', '[-.o]', '[o.O]', '[o.°]', '[~.o]', '[-‿<]'],
  YES_BUT: '( ! )',
};

const TASK_STATUS_TO_FACE = {
  [TASK_STATUS.SKIPPED]: FACES.NOT_ME,
  [TASK_STATUS.PENDING]: FACES.AWAKENING,
  [TASK_STATUS.RUNNING]: FACES.SURPRISED,
  [TASK_STATUS.DONE]: FACES.HAPPY,
  [TASK_STATUS.FAILED]: FACES.DEAD,
  [TASK_STATUS.UNKNOWN]: FACES.NDE,
};

const TASK_NAME_MAX_LEN = 32;
const TASK_STATUS_MAX_LEN = Object.keys(TASK_STATUS)
  .map(ts => ts.length)
  .sort((a, b) => (b - a))[0];
const TASK_TYPE_MAX_LEN = Object.keys(TASK_TYPES)
  .map(ts => ts.length)
  .sort((a, b) => (b - a))[0];

const SEP = `${'-'.repeat(16)}`;

const DEFAULT_DOCKER_PUBLIC_REGISTRY = 'docker.io/';
const DEFAULT_NAME = 'dicker-default';

const LEGACY_DEFAULT_DOMAIN = 'index.docker.io';
const DEFAULT_DOMAIN = 'docker.io';
const OFFICIAL_REPO_NAME = 'library';
const DEFAULT_TAG = 'latest';

const PATH_SEPARATOR = '/';
const LOCALHOST = 'localhost';

const POSSIBLE_EXTENSIONS = ['.json', '.yml', '.yaml'];
const DEFAULT_DOCKERFILE_NAME = 'Dockerfile';

const DEFAULT_ENCODING = 'utf8';
const DOCKER_BUILD_MANDATORY_FLAGS = ['--force-rm'];

module.exports = {
  DEAD_TASK_NAME,
  DOCKER_BUILD_MANDATORY_FLAGS,
  DEFAULT_DOCKER_PUBLIC_REGISTRY,
  DEFAULT_DOCKERFILE_NAME,
  DEFAULT_DOMAIN,
  DEFAULT_ENCODING,
  DEFAULT_IMAGE_NAME,
  DEFAULT_MANIFEST_PATH,
  DEFAULT_NAME,
  DEFAULT_TAG,
  DEFAULT_TASK_STATUS,
  DEFAULT_TASK_TYPE,
  FACES,
  LEGACY_DEFAULT_DOMAIN,
  LOCALHOST,
  OFFICIAL_REPO_NAME,
  PATH_SEPARATOR,
  POSSIBLE_EXTENSIONS,
  ROOT_TASK,
  SEP,
  TASK_NAME_MAX_LEN,
  TASK_STATUS,
  TASK_STATUS_MAX_LEN,
  TASK_STATUS_TO_FACE,
  TASK_TYPE_MAX_LEN,
  TASK_TYPES,
};
