/**
 * @fileOverview Logging utils
 */
const fs = require('fs');
const path = require('path');
const { forceArray, defaults } = require('./lists');
const { isError, isString } = require('./types');
const { face } = require('./faces');
const { mkdirp } = require('./fs');
const C = require('../constants');

const getStreamWrite = stream => s => stream.write(Buffer.from(`${s}\n`), 'utf8');

/* eslint-disable no-console */
const DEFAULT_INFO_FN = process.stdout ? getStreamWrite(process.stdout) : console.info;
const DEFAULT_ERROR_FN = process.stderr ? getStreamWrite(process.stderr) : console.error;
/* eslint-enable no-console */


const format = (...args) => forceArray(args).map(
  // eslint-disable-next-line no-nested-ternary
  msg => (isError(msg) ? `${msg.message} ${msg.stack}}`.replace(/^/gm, '  ')
    : (isString(msg) ? msg : (msg && JSON.stringify(msg)))),
).join(' ');

/**
 * Write info
 * @param outputFn
 * @param args
 * @return {*|boolean}
 */
const _info = (outputFn, ...args) => {
  const fn = (outputFn || DEFAULT_ERROR_FN);
  const s = format(...args);
  fn(s);
  return s;
};

/**
 * Write error
 * @param outputFn
 * @param args
 * @return {*|boolean}
 */
const _error = (outputFn, ...args) => {
  const fn = (outputFn || DEFAULT_ERROR_FN);
  const s = format(...args);
  fn(s);
  return s;
};


/**
 * Logger
 * @param options
 * @return {{warn: warn, debug: debug, warning: warning, error: _error, info: _info}}
 */
const getLogger = (options) => {
  let o = defaults(
    options,
    {
      dst: null,
      infoWrite: DEFAULT_INFO_FN,
      errWrite: DEFAULT_ERROR_FN,
    },
  );
  if (o.dst) {
    mkdirp(path.dirname(path.resolve(o.dst)));
    const streamWrite = getStreamWrite(fs.createWriteStream(path.resolve(o.dst), { flags: 'a' }));
    o = defaults({
      infoWrite: streamWrite,
      errWrite: streamWrite,
    });
  }
  return {
    debug: (...args) => _info(o.infoWrite, 'DEBUG:', ...args),
    info: (...args) => _info(o.infoWrite, 'INFO:', ...args),
    warn: (...args) => _error(o.errWrite, 'WARN:', ...args),
    warning: (...args) => _error(o.errWrite, 'WARN:', ...args),
    error: (...args) => _error(o.errWrite, 'ERROR:', ...args),
  };
};

const info = (...args) => _info(DEFAULT_INFO_FN, ...args);
const error = (...args) => _error(DEFAULT_ERROR_FN, ...args);


const faceLogTask = (t, tasksTotal, customFace, customMessage) => {
  const padSize = Math.log10(tasksTotal) + 1;
  return [
    face(customFace || C.TASK_STATUS_TO_FACE[t.status]),
    [
      (t.order || 0).toString().padStart(padSize),
      '/',
      (tasksTotal || 0).toString().padEnd(padSize),
    ].join(''),
    t.type.padEnd(C.TASK_TYPE_MAX_LEN),
    t.status.padEnd(C.TASK_STATUS_MAX_LEN),
    t.task.padEnd(C.TASK_NAME_MAX_LEN),
    customMessage || t.message || '',
  ].join('  ');
};

// noinspection JSUnusedGlobalSymbols
module.exports = {
  info,
  error,
  format,
  getLogger,
  faceLogTask,
};
