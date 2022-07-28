/**
 * @name Swagger 接口客户端类
 * @date 2018-05-05
 * @description
 *        用于组织swagger的json数据结构
 */
const request = require('request');
const util = require('../../../helpers/util');

class Swagger {
  /**
   * swagger文件的地址 可以为本地文件，也可以是一个http地址
   * @param {String} id
   * @returns {Promise}
   */
  static get(id, options) {
    const mode = /http|https/.test(id) ? 'network' : 'local';
    const promise = mode === 'network' ? handleRemote(id, options) : handleLocal(id);
    return promise.then((config) => new Swagger(config));
  }

  static getParameters(...params) {
    return getParameters(...params);
  }

  /**
   * 获取Service名称
   * @param {} controller
   */
  static getServiceName(controller) {
    const name = controller.name.replace('-controller', '').replace(/(-|_)/g, '/');
    return `${util.toCamel(name)}Service`;
  }

  static getCacheControllers(url, filter, options) {
    this.allServices = this.allServices || {};
    const allControllers = this.allServices[url];
    if (!allControllers) {
      return this.get(url, options).then((data) => {
        this.allServices[url] = data.allControllers;
        return this.allServices[url];
      });
    }
    return Promise.resolve(allControllers.filter((c) => c.name.indexOf(filter) > -1));
  }

  constructor(config) {
    this.config = config;
    this.controllers = this.initControllers(config);
  }

  get allControllers() {
    return Object.keys(this.controllers).map((name) => {
      const controller = this.controllers[name];
      return {
        name: `${name}【${controller.label}】`,
        value: controller,
      };
    });
  }

  initControllers(config) {
    const paths = config.paths || {};
    const apiKeys = Object.keys(paths);
    const controllers = {};
    const definitions = this.config.definitions || {};
    apiKeys.forEach((apiKey) => {
      const api = paths[apiKey];
      const methodKeys = Object.keys(api);
      // const parts = apiKey.split('/');
      methodKeys.forEach((methodKey) => {
        const method = api[methodKey];
        if (!method.tags) {
          return;
        }
        const controllerName = this.getControllerName(method.tags[0], apiKey);
        const controller = controllers[controllerName] || {};
        const methods = controller.methods || {};
        const key = this.getOperationId(method.operationId, apiKey);
        const name = key.replace(/(_\d+)/g, '').replace(/UsingPOST|UsingGET|UsingDELETE|UsingPUT/, 'Async');
        // const urlKey = this.normalizeUrl(apiKey);
        // const isUrlNamed = urlKey && urlKey !== '/';
        controller.methods = methods;
        this.initParameters(method.parameters);
        if (!controller.name) {
          controller.label = method.tags[0];
          controller.name = controllerName;
          controller.serviceName = Swagger.getServiceName(controller);
          controller.description = method.tags[0];
        }
        const camelName = name;
        const methodName = camelName[0].toLowerCase() + camelName.slice(1);
        method.url = apiKey;
        method.method = methodKey;
        method.model = this.getModel(method, definitions);
        method.responseMock = function() {
          const schema = method.responses['200'].schema || {};
          const responseName = (schema.$ref || '').split('#/definitions/').pop();
          const response = config.definitions[responseName] || {};
          return convertMock(response, config.definitions);
        };
        method.methodName = methodName;
        method.name = method.methodName;
        controller.swagger = this;
        methods[methodName] = method;
        controllers[controllerName] = controller;
      });
    });
    Object.keys(controllers).forEach((name) => {
      const controller = controllers[name];
      controller.methodsArray = Object.keys(controller.methods).map((k) => controller.methods[k]);
    });
    return controllers;
  }

  getControllerName(id, key) {
    if (!/[\u4e00-\u9fa5]/.test(id)) {
      return id;
    }
    return key.replace(/^\//, '').split('/').shift();
  }

  getOperationId(id, key) {
    if (id) {
      return id;
    }
    const items = key.replace(/^\//, '').split('/').slice(1);
    if (items.length < 1) return key.replace(/\//g, '');
    return items.map((v, i) => {
      if (!v) {
        return key.replace(/\//g, '');
      }
      return i > 0 ? v[0].toUpperCase() + v.slice(1) : v;
    }).join('');
  }

  getModel(method, definitions) {
    const parameters = method.parameters || [];
    const bodyParameter = parameters.filter((p) => p.in === 'body').pop() || {};
    const ref = getRef((method.responses['200'].schema || {}).$ref || '');
    const bodyRef = getRef((bodyParameter.schema || {}).$ref || '');
    return definitions[ref] || definitions[bodyRef] || {};
  }

  normalizeUrl(url) {
    return (url || '').toString().replace(/^\//, '')
      .replace(/\{.+?\}/g, '')
      .replace(/\/$/, '')
      .replace(/\s/g, '')
      .replace(/\/-+$/g, '')
      .replace(/\/\//g, '/')
      .replace(/\/$/, '');
  }

  initParameters(parameters) {
    const definitions = this.config.definitions || {};
    parameters = parameters || [];
    parameters.forEach((parameter) => {
      if (parameter.schema) {
        const ref = parameter.schema.$ref;
        if (ref) {
          const name = getRef(ref);
          parameter.model = definitions[name];
        }
      }
    });
  }
}

/**
 * 获取制定接口函数对应的参数信息
 */
function getParameters(url, parameters = []) {
  let bodyParameters = [];
  const signParameters = [];
  const schema = {};
  const description = [];
  let paramterIndex = 0;
  parameters.forEach((parameter) => {
    const { name } = parameter;
    if (url.indexOf(`{${name}}`) > -1) {
      url = url.replace(`{${name}}`, `\${${name}}`);
    } else if (parameter.in === 'query') {
      const char = url.indexOf('?') > -1 ? '&' : '?';
      url = `${url}${char}${name}=\${${name}}`;
    } else if (parameter.in === 'body') {
      bodyParameters.push(name);
    } else if (parameter.in === 'header') {
      return;
    } else {
      bodyParameters.push(name);
    }
    signParameters.push(name);
    if (parameter.model) {
      const { properties } = parameter.model;
      const data = {};
      Object.keys(properties).map((k) => {
        const p = properties[k];
        return data[k] = `${p.type} ${p.description}`;
      });
      description.push(JSON.stringify(data, null, 2).replace(/\n/g, '\n    '));
    } else {
      description.push(`${paramterIndex === 0 ? '参数：\n' : ''}   * @param {${parameter.type}} ${parameter.name} ${parameter.description}`);
    }
    const s = parameter.schema || {};
    const sname = s.$ref || '';
    schema[name] = sname.toString().indexOf('#/definitions') > -1;
    paramterIndex++;
  });
  if (bodyParameters.length === 1 && schema[bodyParameters[0]]) {
    bodyParameters = bodyParameters[0];
  } else {
    bodyParameters = `{${bodyParameters.join(', ')}}`;
  }
  return {
    signParameter: signParameters.join(', '),
    bodyParameter: bodyParameters,
    url,
    description: description.join('\n'),
  };
}

/**
   * 转换服务接口返回结果为json对象
   */
function convertMock(entry, cache) {
  const map = {};
  return convertMockObj(entry, map, cache);
}

/**
 * 转换服务接口field-type对象为json对象
 * @param {*} entry 当前field-type
 * @param {*} map 所有field-type
 */
function convertMockObj(entry, map, cache) {
  const data = {};
  const properties = entry.properties || {};
  Object.keys(properties || {}).forEach((name) => {
    const field = properties[name];
    if (!field) {
      return;
    }
    const itemsRef = (field.items || {}).$ref;
    const ref = (itemsRef || field.$ref || '').split('#/definitions/').pop();
    const type = field.type;
    const isList = type === 'array';
    let value = null;
    if (!cache[ref]) {
      value = generateMock(field, name);
    } else if (!map[ref]) {
      map[ref] = true;
      entry = cache[ref];
      value = convertMockObj(entry, map, cache);
    }
    data[name] = isList ? [value] : value;
  });
  return data;
}

/**
 * 根据field.type生成默认的mock数据
 * @param {*} field field对象
 */
function generateMock(field, name) {
  switch (field.type) {
    case 'long':
    case 'int':
    case 'double':
    case 'float':
    case 'short':
    case 'integer':
    case 'int64':
      return name === 'count' ? 1 : 0;
    case 'boolean':
      return name === 'success';
    case 'date':
      return new Date().toLocaleString();
    case 'object':
      return {};
    default:
      return '';
  }
}

function getRef(ref) {
  return ref.split('definitions/').pop()
    .split('«').pop()
    .replace(/»/g, '');
}

function handleRemote(url, options) {
  return new Promise((resolve, reject) => {
    request.get(url, options, (error, response) => {
      if (error) {
        reject(error);
      } else {
        const data = response.toJSON();
        const body = String(data.body, 'utf8');
        const result = JSON.parse(body);
        resolve(result);
      }
    });
  });
}

function handleLocal(id) {
  return new Promise((resolve) => {
    resolve({

    });
  });
}

module.exports = Swagger;
