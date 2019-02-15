/**
 * @fileOverview Face drawing utils
 */
const { forceArray } = require('./lists');

const { defaults } = require('./objects');

/**
 * Default face options
 *
 * @constant DEFAULT_FACE_OPTIONS {Object}
 */
const DEFAULT_FACE_OPTIONS = {
  ltr: true,
  count: 1,
};

/**
 * Default face
 *
 * @constant DEFAULT_FACE {string}
 */
const DEFAULT_FACE = '{-.-}';

const _DYNAMIC_FACE_COUNTERS = {};

/**
 * Draw face (emoticon)
 *
 *
 * @param faceStrings
 * @param options {Object} - face options
 *   - @property ltr {boolean} - left to right direction, default: true
 *   - @property count {number} - how many faces to draw, default: 1
 *
 * @return {string} - rendered faces
 */
const face = (faceStrings, options) => {
  const o = defaults(options, DEFAULT_FACE_OPTIONS);
  if (o.count === 0) {
    return '';
  }
  const fStrs = forceArray(faceStrings || DEFAULT_FACE);
  const sequenceCounterKey = fStrs.join('|');
  const num = _DYNAMIC_FACE_COUNTERS[sequenceCounterKey] || 0;
  _DYNAMIC_FACE_COUNTERS[sequenceCounterKey] = (num + 1) % fStrs.length;
  const fStr = fStrs[num];
  const braceLeft = fStr[0];
  const braceRight = fStr[fStr.length - 1];
  const faceVisible = fStr.slice(1, fStr.length - 1);
  const result = [];
  if (o.ltr) {
    result.push(braceLeft);
    for (let i = 0; i < o.count; i += 1) {
      result.push(faceVisible);
      result.push(braceRight);
    }
  } else {
    for (let i = 0; i < o.count; i += 1) {
      result.push(braceLeft);
      result.push(faceVisible);
    }
    result.push(braceRight);
  }
  return result.join('');
};


module.exports = {
  face,
};
