/**
 * @fileOverview Object related utils
 */
const { isObject, isUndefined } = require('./types.js');

/**
 * Soft version of extend. Assigns own properties
 * only if they are undefined in the original object.
 *
 * defaults({a: 1}, {a: 2})
 * // => {a: 1}
 *
 * defaults({a: 1}, {b: 2})
 * // => {a: 1, b: 2}
 *
 * @param obj
 * @param def
 * @return {*}
 */
const defaults = (obj, def) => {
  const o = isObject(obj) ? Object.assign({}, obj) : {};

  const _maybeSetProp = (val, key) => {
    if (isUndefined(o[key])) {
      o[key] = val;
    }
  };
  Object.keys(isObject(def) ? def : {}).forEach(k => _maybeSetProp(def[k], k));
  return o;
};

module.exports = { defaults };
