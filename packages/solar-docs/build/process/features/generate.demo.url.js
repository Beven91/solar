
module.exports = function findComponentDemoUrl(repo, name) {
  let demoUrl = '';
  if (typeof repo.demoUrl == 'function') {
    demoUrl = repo.demoUrl(name);
  } else if (repo.demoUrl) {
    const key = item.name.replace(/\\/g, '/');
    demoUrl = repo.demoUrl[key];
  }
  if (demoUrl && repo.demoBase) {
    demoUrl = repo.demoBase + demoUrl;
  }
  return demoUrl;
};