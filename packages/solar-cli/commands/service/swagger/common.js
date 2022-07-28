const Swagger = require('./swagger');

/**
 * 搜索匹配的服务接口
 * @param {Object} answers 选择答复的结果
 * @param {String} search 当前搜索的key
 */
function searchServices(answers, search) {
  const url = answers.serverHost;
  const data = typeof url === 'string' ? { url } : url;
  const options = getOptions(data);
  return Swagger
    .getCacheControllers(data.url, search, options).then(data => data);
}

/**
 * 搜索指定service下的所有方法
 * @param {Object} answers 选择答复的结果
 * @param {String} search 当前搜索的key
 */
function searchServiceMethods(answers, search) {
  search = (search || '').toLowerCase();
  const { service } = answers;
  const methods = service.methodsArray;
  return new Promise((resolve) => {
    const filters = search ? methods.filter((m) => m.url.toLowerCase().indexOf(search) > -1) : methods;
    resolve(filters.map((m) => ({
      name: m.url,
      value: m,
    })));
  });
}

function getOptions(data) {
  const options = { headers: {} };
  if (data.basic) {
    const credential = Buffer.from(data.basic);
    options.headers['Authorization'] = 'Basic ' + credential.toString('base64');
  }
  return options;
}

exports.searchServices = searchServices;
exports.searchServiceMethods = searchServiceMethods;
// exports.generate = generate;
