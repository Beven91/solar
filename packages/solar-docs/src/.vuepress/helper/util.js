module.exports = {
  getRepository(site) {
    const repositories = site.themeConfig.repository;
    let base = process.env.base;
    base = /^\//.test(base) ? base : "/" + base;
    const segments = location.pathname.split(base).pop().split('/');
    let repository = null;
    while (segments.length > 0) {
      repository = repositories[segments.join('/')];
      if (repository) {
        return repository;
      }
      segments.pop();
    }
  }
}