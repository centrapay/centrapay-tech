'use strict';

module.exports = function(eleventyConfig) {
  const filters = require('../_filters');
  eleventyConfig.addCollection('tagList', function(collection) {
    let tagSet = new Set();
    collection.getAll().forEach(item => {
      (item.data.tags || []).forEach(tag => tagSet.add(tag));
    });
    return filters.filterTagList([...tagSet]);
  });
};
