'use strict';

const defaultTags = ['all', 'nav', 'post', 'posts'];

function isCustomTag(tag) {
  return !defaultTags.includes(tag);
}

module.exports = function customTags(tags = []) {
  return tags.filter(isCustomTag);
};
