'use strict';

const glob = require('glob');
const path = require('path');

const filters = {};

glob.sync('./filter.*.js', { cwd: __dirname })
  .forEach(file => {
    const name = path.basename(file).split('.')[1];
    filters[name] = require(file);
  });

module.exports = filters;
