/**
 *
 * @returns {string}
 */
const now = () => (new Date()).toISOString().replace('T', ' ').split('.')[0];

module.exports = { now };
