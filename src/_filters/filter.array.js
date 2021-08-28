'use strict';

/*
 * Make an array containing arg or arg's elements if it is already an array.
 */
module.exports = function (arg) {
  if (arg) {
    return [].concat(arg);
  }
  return [];
};
