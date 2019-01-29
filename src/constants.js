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

/**
 * @constant ROOT_TASK_NAME
 * @type {string}
 */
const ROOT_TASK = {
  task: '$_ROOT_TASK_$',
  description: 'Root task (will not be executed)',
  skip: true,
  status: TASK_STATUS.SKIPPED,
  dockerfile: null,
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
  [TASK_STATUS.PENDING]: FACES.DIZZY,
  [TASK_STATUS.RUNNING]: FACES.SURPRISED,
  [TASK_STATUS.DONE]: FACES.HAPPY,
  [TASK_STATUS.FAILED]: FACES.DEAD,
  [TASK_STATUS.UNKNOWN]: FACES.NDE,
};

const TASK_STATUS_MAX_LEN = Object.keys(TASK_STATUS)
  .map(ts => ts.length)
  .sort((a, b) => (b - a))[0];

const SEP = `${'-'.repeat(16)}`;

module.exports = {
  DEFAULT_IMAGE_NAME,
  DEFAULT_MANIFEST_PATH,
  FACES,
  TASK_STATUS,
  TASK_STATUS_TO_FACE,
  TASK_STATUS_MAX_LEN,
  ROOT_TASK,
  SEP,
};
