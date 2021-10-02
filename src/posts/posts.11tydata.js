'use strict';

const authors = require('../_data/authors');

module.exports = {
  tags: [ 'posts' ],
  eleventyComputed: {
    /* replace author id with author object */
    author: data => authors.byId[data.author],
    readingTime: async data => {
      const content = await require('fs').promises.readFile(data.page.inputPath, 'utf-8');
      const wordCount = content.match(/[\w']+/g).length;
      /* typical reading speed is 250 wpm */
      return Math.ceil(wordCount / 250);
    }
  }
};
