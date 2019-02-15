/**
 * @fileOverview Type checking
 */

/**
 * Check if item is Array.
 *
 * @param item
 * @return {boolean}
 */
const isArray = item => (
  item && (Array.isArray(item) || Object.prototype.toString.call(item) === '[object Array]')
);

/**
 * Check if item Error or Error-like.
 *
 * @param item
 * @return {boolean}
 */
const isError = item => ((item instanceof Error) || (item && item.stack && item.message));

/**
 * Check if item is Object
 * @param item
 * @return {boolean}
 */
const isObject = (item) => {
  const type = typeof item;
  return item != null && (type === 'object' || type === 'function');
};

/**
 * Checks value for undefined NaN and null
 * @param item
 * @return {boolean}
 */
const isNil = item => (item == null);

/**
 * Check if item is string.
 *
 * @param item
 * @return {boolean}
 */
const isString = item => (typeof item === 'string');

/**
 * Checks value on being empty
 * @param item
 * @return {boolean}
 */
const isEmpty = (item) => {
  if (isNil(item)) {
    return true;
  }
  if (isArray(item) || isString(item)) {
    return item.length === 0;
  }
  if (isObject(item)) {
    return Object.keys(item).length === 0;
  }
  return !!item;
};

/**
 * Check if item is function.
 * @param item
 * @return {boolean}
 */
const isFunction = item => (typeof item === 'function');

/**
 * Check if item is number.
 * @param item
 * @return {boolean}
 */
const isNumber = item => (typeof item === 'number');

/**
 * Check if item is undefined.
 * @param item
 * @return {boolean}
 */
const isUndefined = item => (typeof item === 'undefined');

module.exports = {
  isArray,
  isEmpty,
  isError,
  isFunction,
  isNil,
  isNumber,
  isObject,
  isString,
  isUndefined,
};
