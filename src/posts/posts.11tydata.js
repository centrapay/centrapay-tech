'use strict';

const authors = require('../_data/authors');

module.exports = {
  tags: [ 'posts' ],
  eleventyComputed: {
    /* replace author id with author object */
    author: data => authors.byId[data.author],
  }
};
