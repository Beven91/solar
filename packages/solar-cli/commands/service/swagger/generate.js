/**
 * @name 生成指定接口选中的方法
 * @date 2018-03-16
 * @description
 */
const fs = require('fs');
const path = require('path');
const Compiler = require('../../../helpers/compiler.js');
const ServiceAST = require('./ast');

const templateDir = path.join(__dirname, '../../../templates');

module.exports = function(answers) {
  const selecteds = (answers.methods || []);
  const methods = selecteds.length < 1 ? answers.service.methodsArray : selecteds;
  return new Promise((resolve) => {
    resolve(generate(answers, methods));
  }).catch((ex) => console.error(ex));
};

/**
 * 开始生成
 * @param {} answers
 */
function generate(answers, methods) {
  const { service } = answers;
  const context = {
    total: methods.length,
    methods,
    // swagger域名
    host: answers.host,
    // 生成目标目录
    target: answers.target,
    // 是否仅生成mock数据
    onlyMock: answers.onlyMock,
    // Rest接口组名称
    name: service.name.toLowerCase(),
    // 生成Service类名称
    serviceName: service.serviceName,
    // 描述
    desc: service.description,
    // 生成日期
    date: (new Date()).toLocaleString(),
    // ts全局类型
    types: {

    },
  };
  if (context.onlyMock) {
    generateServiceMock(context);
  } else {
    generateServiceClass(context);
    // generateServiceMock(context);
  }
}

/**
 * 生成Service类
 */
function generateServiceClass(context) {
  console.info(`开始创建Rest接口Service:${context.serviceName}`);
  const name = `${context.serviceName}.ts`;
  const base = context.target + '//src';
  const fullName = path.join(base, name);
  const astFile = fs.existsSync(fullName) ? fullName : path.join(templateDir, 'rest.ts');
  const serviceAST = new ServiceAST(astFile, context.serviceName, context);
  const generateMethods = context.methods.filter((m) => !!m);
  generateMethods.map((m) => {
    const code = generateMethod(m);
    serviceAST.addServiceMethod(m.name, code);
  });
  generateReference(context, fullName);
  serviceAST.saveTo(fullName);
  console.info(`总计:${context.total} 成功:${generateMethods.length}`);
  console.info(`恭喜您，Rest接口${context.serviceName}创建完毕!`);
}

/**
 * 生成Service的mock数据
 */
function generateServiceMock(context) {
  console.info(`开始创建Rest接口Service(${context.serviceName}) Mock数据`);
  const generateMethods = context.methods.filter((m) => !!m);
  generateMethods.map((m) => generateMock(m));
  console.info(`恭喜您，Rest接口${context.serviceName}Mock数据创建完毕!`);
}

function getResponseType(method) {
  const consumes = method.consumes || [];
  const response = Object.keys(((method.responses || {})['200'] || {}).content || {});
  const content = (consumes.length < 1 ? response : consumes).join(',');
  if (content.indexOf('application/json') > -1) {
    return 'json';
  }
  return null;
}

/**
 * 生成Rest Service类接口函数
 */
function generateMethod(method) {
  const parameters = generateParameters(method.url, method.parameters, method.method);
  const type = getResponseType(method);
  method.parameterInfo = parameters;
  const format = type ? `.${type}()` : '';
  return `/**
 * ${method.description || method.summary}
 * ${parameters.description || '暂无描述'}
 */
  ${method.name}(${parameters.signParameter}) {
    return this.any(${parameters.url}, ${parameters.bodyParameter}, '${method.method.toUpperCase()}')${format};
  }`;
}

/**
 * 获取制定接口函数对应的参数信息
 */
function generateParameters(url, parameters = [], method) {
  const parameterModel = {};
  const bodyParameters = parameters.filter((p) => ['body', 'form', 'formData'].indexOf(p.in) > -1);
  const queryParameters = parameters.filter((p) => p.in === 'query');
  const pathParameters = parameters.filter((p) => p.in === 'path');
  const inBodyParameters = parameters.filter((p) => p.in === 'body');
  const useParameters = method === 'get' ? queryParameters : bodyParameters;
  const combine = useParameters.length > 2 || inBodyParameters.length > 0;
  const combineVariable = useParameters.length === 1 ? useParameters[0].name : 'data';
  const signParameters = combine ? [{ name: combineVariable }] : useParameters.map((p) => p);

  // rest路径参数
  pathParameters.forEach((param) => {
    signParameters.push(param);
    url = url.replace(`{${param.name}}`, `\${${param.name}}`);
  });

  // 构建参数元数据
  parameters.forEach((parameter) => {
    const { name } = parameter;
    parameterModel[name] = {
      name: name,
      type: parameter.type || (parameter.schema || {}).type,
      description: parameter.model ? parameter : parameter.description,
    };
  });

  // 补全ts类型
  signParameters.forEach((param) => {
    const type = getTsType(param);
    const required = param.required ? '' : '?';
    param.value = `${param.name}${required}:${type}`;
  });

  if (combine) {
    parameterModel[combineVariable] = {
      description: {
        model: {
          properties: {
            ...parameterModel,
          },
        },
      },
    };
  }

  if (method !== 'get') {
    queryParameters.forEach((param) => {
      const joinChar = url.indexOf('?') > -1 ? '&' : '?';
      const type = getTsType(param);
      const required = param.required ? '' : '?';
      signParameters.push({ value: `${param.name}${required}:${type}`, name: param.name });
      url = `${url}${joinChar}${param.name}=\${${param.name}}`;
    });
  }

  return {
    url: url.indexOf('${') > -1 ? `\`${url}\`` : `'${url}'`,
    signParameter: signParameters.map((p) => p.value || p.name).join(', '),
    bodyParameter: combine ? combineVariable : `{ ${useParameters.map((p) => p.name).join(', ')} }`,
    description: getMethodParameterDescription(signParameters, parameterModel),
  };
}

function getTsType(param) {
  const schema = param.schema || {};
  switch (schema.type) {
    case 'string':
      return 'string';
    case 'integer':
      return 'number';
    case 'boolean':
    case 'bool':
      return 'boolean';
    case 'object':
      return '{ [k:string]:any }';
    default:
      return 'any';
  }
}

/**
 * 获取方法参数签名备注
 * @param {*} signParameters
 * @param {*} parameterModel
 */
function getMethodParameterDescription(signParameters, parameterModel) {
  const topParameter = { model: { properties: parameterModel } };
  return signParameters
    .map(({ name }) => `@param ${name} ${getParamDescription(parameterModel[name] || topParameter)}`)
    .join('\n*');
}

/**
 * 获取有定义模型的参数描述
 */
function getParamDescription(parameter) {
  if (typeof parameter.description === 'string') {
    return ` ${parameter.description || ''}`;
  }
  if (!parameter.description) {
    return '暂无描述';
  }
  const data = getParameterModel(parameter.description);
  const json = JSON.stringify(data, null, 6);
  return (`\n    \`\`\`js\n    {${json.substr(1, json.length - 2)}    }\n    \`\`\``);
}

function getParameterModel(parameter) {
  const { properties } = parameter.model;
  const data = {};
  Object.keys(properties).forEach((key) => {
    const p = properties[key];
    const { description } = p;
    data[key] = (description || {}).model ? getParameterModel(description) : `${p.type} ${description}`;
  });
  return data;
}

/**
 * 生成mock.js
 */
function generateMock(method) {
  const info = generateParameters(method.url, method.parameters);
  const parameters = JSON.stringify(generateMockParameters(method), null, '\t');
  const json = JSON.stringify(method.responseMock(), null, 2);
  const context = { result: json, parameters };
  const name = info.url.replace(/\//g, '-').replace(/^-/, '');
  const compiler = new Compiler(templateDir, path.resolve('mock/rest/'));
  compiler.compileTo('mock.rest.js', `${name}.js`, context);
}

/**
 * 生成mock.js的校验参数
 */
function generateMockParameters(method) {
  const { parameters } = method;
  return (parameters || []).reduce((data, parameter) => {
    if (parameter.required === true) {
      data[parameter.name] = { type: parameter.format };
    }
    return data;
  }, {});
}

/**
 * 生成引用
 * 刷新services/index.js
 */
function generateReference(context, fullName) {
  const { serviceName } = context;
  const compiler = new Compiler();
  const index = path.join(context.target, 'index.ts');
  const relative = path.relative(context.target, fullName).replace(/\\/g, '/').replace('.ts', '');
  if (fs.existsSync(index)) {
    compiler.compileVar(index, {
      GENERATE_IMPORT: `import ${serviceName} from './${relative}';\n`,
      GENERATE_EXPORT: `${serviceName},\n  `,
    });
  }
}
