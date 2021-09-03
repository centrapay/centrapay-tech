'use strict';

const pluginRss = require('@11ty/eleventy-plugin-rss');
const pluginSyntaxHighlight = require('@11ty/eleventy-plugin-syntaxhighlight');
const pluginNavigation = require('@11ty/eleventy-navigation');

const config = require('./src/config');
/* eslint-disable-next-line no-console */
console.log(`
Resolved Config:
${require('util').inspect(config.getProperties(), null, null)}
`);

module.exports = function(eleventyConfig) {
  eleventyConfig.setDataDeepMerge(true);

  eleventyConfig.addPlugin(pluginRss);
  eleventyConfig.addPlugin(pluginSyntaxHighlight);
  eleventyConfig.addPlugin(pluginNavigation);
  require('./src/_plugins')
    .forEach(plugin => eleventyConfig.addPlugin(plugin));

  // TODO choose either test content or main content
  // requires upcoming eleventy v1.0.0
  // https://www.11ty.dev/docs/ignores/
  // eleventyConfig.ignores.add('src/content.main');
  // eleventyConfig.ignores.add('src/content.test');
  // eleventyConfig.ignores.remove(config.get('contentDir'));

  eleventyConfig.addPassthroughCopy('src/favicon.ico');
  return {
    templateFormats: [
      'md',
      'njk',
      'html',
    ],
    markdownTemplateEngine: 'njk',
    htmlTemplateEngine: 'njk',
    dataTemplateEngine: false,
    dir: {
      input: 'src',
      output: 'dist',
    }
  };
};
