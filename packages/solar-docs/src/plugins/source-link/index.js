const path = require('path');
const resolver = require('./resolver');

module.exports = {
  name: 'solar-source-link',
  extendMarkdown: function(md) {
    md.use(require('../../markdown/markdown-it-params'));
  },
  extendPageData: function($page) {
    if ($page._meta) {
      $page.componentProps = $page._meta.componentProps;
    }
    // $page._computed.__page._content = $page._computed.__page._strippedContent = 'ssssssssss';
    // $page._content = 'sssssssss';
    // $page._strippedContent = 'ssssssss'
    // var s = 10;
    // $page._computed.__page._content = 'ssss';
  },
  additionalPages: function(ctx) {
    const pages = ctx.pages.filter((item) => item.path !== '/');
    ctx.siteConfig.themeConfig = ctx.siteConfig.themeConfig || {};
    ctx.themeConfig = ctx.siteConfig.themeConfig;
    ctx.siteConfig.themeConfig.sidebar = [
      {
        title: '导航',
        path: '/',
        collapsable: true,
        sidebarDepth: 1,
        children: pages.map((item) => {
          const name = path.basename(item.path.replace(/\\$/, ''));
          return {
            title: name,
            path: item.path,
            sidebarDepth: 1,
          };
        }),
      },
    ];
    return Promise
      .all(ctx.pages.map((page) => resolver.resolveTs(page)))
      .then((pages) => pages.filter((a) => !!a));
  },
};