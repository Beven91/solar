/**
 * @name 后台系统页面生成
 * @date 2018-05-05
 * @description
 *        结合后台Rest接口swagger文档
 *        用于生成后台系统的列表页面，修改页面，新增页面，查看页面
 *        以及对应的接口
 */
const inquirer = require('inquirer');
const compile = require('./generate');
const configer = require('../../helpers/configer');
const util = require('../../helpers/util');
const generateService = require('../service/swagger/generate');
const {
  searchServices,
} = require('../service/swagger/common');

module.exports = function() {
  const context = {};
  init(context).then(() => mainQuestions(context));
};

/**
 * 检查配置
 */
function init(answers) {
  return new Promise((resolve, reject) => {
    const solar = configer.solar || {};
    const { service, admin } = solar;
    if (!service) {
      reject(new Error(`找不到service存放配置,
          请检查package.json是存在
          例如: 
          {    
            "solar":{
              "root":"apps/",
              "service":{
                "servs":[
                  { name: '订单服务', value: 'https://ssss.swagger.json' },
                ],
                "target":"rest-services", //service文件存放目录
              }
            }
          }
      `));
    }
    if (!admin) {
      reject(new Error(`找不到admin存放配置,
          请检查package.json是存在
          例如: 
          {    
            "solar":{
              "root":"apps/",
              "admin":{
                "target":"admin/(后台模块存放位置)",
                "services":""
              }
            }
          }
      `));
    }
    answers.solar = solar;
    answers.admin = admin;
    answers.prefix = solar.prefix;
    answers.routerTarget = configer.findPath(admin.router);
    answers.pagesRoot = configer.findPath(admin.target);
    answers.serviceTarget = configer.findPath(service.target);
    answers.enumTarget = configer.findPath(admin.enums);

    resolve(answers);
  });
}

function mainQuestions(context) {
  inquirer
    .prompt([
      {
        type: 'list',
        name: 'serverHost',
        message: '选择服务',
        choices: (configer.solar.service.servs || []).concat([
          { name: '本地模式', value: 'local' },
        ]),
      },
      {
        type: 'autocomplete',
        name: 'controller',
        when: (answer) => answer.serverHost !== 'local',
        message: '扫描到以下可生成的后台页面,请选择:',
        source: searchServices,
      },
      {
        type: 'input',
        name: 'controller',
        when: (answer) => answer.serverHost === 'local',
        message: '请输入模块名称：',
      },
      {
        type: 'input',
        when: (answer) => {
          if (answer.serverHost === 'local') {
            answer.controller = {
              name: answer.controller,
            };
          }
          if (compile.existsModule(context, answer.controller)) {
            console.log('当前模块已存在，无需生成');
            process.exit();
          }
        },
      },
      {
        type: 'autocomplete',
        name: 'list',
        message: '请选择列表接口',
        when: (answer) => answer.serverHost !== 'local',
        source: getNearlyListFilter(/list|query/),
      },
      {
        type: 'autocomplete',
        name: 'add',
        message: '请选择择新增接口',
        when: (answer) => answer.serverHost !== 'local',
        source: getNearlyListFilter(/add|create/),
      },
      {
        type: 'autocomplete',
        name: 'remove',
        message: '请选择删除接口',
        when: (answer) => answer.serverHost !== 'local',
        source: getNearlyListFilter(/delete|remove/),
      },
      {
        type: 'autocomplete',
        name: 'update',
        message: '请选择修改接口',
        when: (answer) => answer.serverHost !== 'local',
        source: getNearlyListFilter(/update|modify/),
      },
      {
        type: 'autocomplete',
        name: 'get',
        message: '请选择单个获取接口',
        when: (answer) => answer.serverHost !== 'local',
        source: getNearlyListFilter(/get|detail/),
      },
      {
        type: 'autocomplete',
        name: 'primaryKey',
        message: '请选择主键属性名:',
        when: (answer) => answer.serverHost !== 'local',
        source: queryPrimaryKey,
      },
      {
        type: 'input',
        name: 'primaryKey',
        message: '请输入主键属性名:',
        when(answer) {
          return answer.primaryKey === '其他';
        },
        validate(value) {
          return !value ? '请输入主键属性名' : true;
        },
      },
      {
        type: 'checkbox-plus',
        name: 'optionalActionKeys',
        searchable: true,
        when(answer) {
          return answer.serverHost !== 'local';
        },
        message: '要生成的动作(空格键选择，可以输入进行筛选,默认生成所有):',
        source: getOptionalActions,
      },
    ])
    .then((answers) => generate(answers, context))
    .catch(console.error);
}

/**
 * 开始生成
 */
function generate(answer, context) {
  const { optionalActionKeys, defaultActionKeys } = answer;
  answer.optionalActionKeys = ((optionalActionKeys || []).length < 1 ? defaultActionKeys : optionalActionKeys) || [];
  if (answer.serverHost === 'local') {
    const name = answer.controller.name;
    answer.controller = {
      name: name, label: name,
      methods: [
        'add',
        'update',
        'list',
        'remove',
      ],
      serviceName: name + 'Service',
    };
    answer.list = {
      methodName: '',
      model: {
        properties: {
          id: { description: '编号' },
          name: { description: '名称' },
          title: { description: '标题' },
        },
      },
    };
    answer.add = { methodName: '' };
    answer.update = { methodName: '' };
    answer.remove = { methodName: '' };
    answer.get = { methodName: '' };
    initialCurdModels(answer);
    // 生成页面
    compile(answer, answer.crudModels, context);
  } else {
    const { controller, crudModels: api } = answer;
    const seviceAnswer = {
      methods: controller.methodsArray,
      service: controller,
      target: context.serviceTarget,
    };
    // 生成对应的服务
    generateService(seviceAnswer);
    // 生成页面
    compile(answer, api, context);
  }
}


// 获取一个命名相近的接口列表查询器
function getNearlyListFilter(reg) {
  return function(answer, filter) {
    const items = queryListApis(answer);
    if (filter) {
      return Promise.resolve(util.getFilterResult(items, filter));
    }
    return Promise.resolve(util.getNearlyList(items, reg));
  };
}

// 获取当前controller下所有方法选项
function queryListApis(answer) {
  const { methods } = answer.controller;
  const items = Object.keys(methods).map((k) => {
    const m = methods[k];
    return {
      name: m.url,
      value: m,
    };
  });
  items.push({ name: '无', value: {} });
  return items;
}

// 获取可选择的action动作
function getOptionalActions(answer) {
  const { controller } = answer;
  const { methods } = controller;
  const crudKeys = [
    answer.list.methodName,
    answer.add.methodName,
    answer.update.methodName,
    answer.remove.methodName,
    answer.get.methodName,
  ];
  const actions = Object
    .keys(methods)
    .filter((k) => crudKeys.indexOf(k) < 0)
    .map((k) => {
      const method = methods[k];
      const desc = method.description || method.summary;
      return { name: `${k}(${desc})`, value: k };
    });
  answer.defaultActionKeys = actions.map((m) => m.value);
  return Promise.resolve(actions);
}

// 获取当前可选的主键字段
function queryPrimaryKey(answer, filter) {
  // 生成crud 相关model信息
  initialCurdModels(answer);
  // 开始获取主键相关信息
  const { primaryKeys } = answer;
  return Promise.resolve(util.getFilterResult(primaryKeys, filter));
}

// 初始化curd 相关模型
function initialCurdModels(answer) {
  if (answer.crudModels) {
    return;
  }
  const { controller } = answer;
  const api = {};
  const crudKeys = [
    answer.list.methodName,
    answer.add.methodName,
    answer.update.methodName,
    answer.remove.methodName,
    answer.get.methodName,
  ];
  api.serviceName = controller.serviceName;
  api.query = answer.list.methodName || 'beimplement';
  api.get = answer.get.methodName || 'beimplement';
  api.update = answer.update.methodName || 'beimplement';
  api.remove = answer.remove.methodName || 'beimplement';
  api.add = answer.add.methodName || 'beimplement';
  api.redux = true;
  api.crudKeys = crudKeys;
  controller.model = answer.add.model || answer.update.model || answer.get.model || answer.list.model || {};
  const propertyKeys = Object.keys(controller.model.properties || {}).concat('其他');
  const primaryKeys = propertyKeys.map((name) => ({ name, value: name }));
  answer.crudModels = api;
  answer.primaryKeys = util.getNearlyList(primaryKeys, /id/);
}
