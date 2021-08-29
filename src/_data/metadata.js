'use strict';

const config = require('../config');

const baseUrl = config.get('baseUrl');

module.exports = {
  title: 'Your Blog Name',
  url: `${baseUrl}/`,
  language: 'en',
  description: 'I am writing about my experiences as a naval navel-gazer.',
  feed: {
    subtitle: 'I am writing about my experiences as a naval navel-gazer.',
    filename: 'feed.xml',
    path: '/feed/feed.xml',
    id: baseUrl,
  },
  jsonfeed: {
    path: '/feed/feed.json',
    url: `${baseUrl}/feed/feed.json`
  },
};
