'use strict';

const config = require('../config');

const baseUrl = config.get('baseUrl');

module.exports = {
  title: 'Centrapay Engineering',
  url: `${baseUrl}/`,
  githubUrl: 'https://github.com/centrapay',
  twitterUrl: 'https://twitter.com/centrapay',
  linkedInUrl: 'https://www.linkedin.com/company/centrapay',
  instagramUrl: 'https://www.instagram.com/centrapay',
  facebookUrl: 'https://www.facebook.com/centrapay',
  language: 'en',
  description: 'News and views from the Centrapay Engineering team',
  nav: [
    {
      title: 'Home',
      url: '/',
    },
    {
      title: 'Archive',
      url: '/posts/',
    },
  ],
  feed: {
    subtitle: 'News and views from the Centrapay Engineering team',
    filename: 'feed.xml',
    path: '/feed/feed.xml',
    id: baseUrl,
  },
  jsonfeed: {
    path: '/feed/feed.json',
    url: `${baseUrl}/feed/feed.json`
  },
};
