'use strict';

module.exports = function filterTagList(tags = []) {
  return tags.filter(tag => ['all', 'nav', 'post', 'posts'].includes(tag));
};
