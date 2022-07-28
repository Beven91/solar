const fs = require('fs');
const path = require('path');
const inquirer = require('inquirer');
const util = require('../../helpers/util');
const Compiler = require('../../helpers/compiler');
const generateRedux = require('./redux');

module.exports = function(answer, api, context) {
  const { controller } = answer;
  const component = util.toCamel(controller.name.replace('-controller', '').replace(/-/g, '/'));
  const lname = component.toLowerCase();
  const ui = new inquirer.ui.BottomBar();
  const templateRoot = path.join(__dirname, '../../templates/admin-module');
  const pagesRoot = path.resolve(context.pagesRoot);
  const targetModule = path.join(pagesRoot, component);
  controller.usingComponents = {};
  controller.enums = {};
  controller.rules = {};
  if (!existsModule(context, controller)) {
    const containerRoot = path.dirname(context.routerTarget);
    const compiler = new Compiler(templateRoot, targetModule);
    const relativeModule = path.relative(containerRoot, targetModule).replace(/\\/g, '/');
    const data = getCompileData(controller, answer, api, lname, component, context);
    const reference = {
      'GENERATE-ROUTE-IMPORT': `const ${component} = loadable(() => import(/* webpackChunkName: "${lname}" */ '${relativeModule}'));\n`,
      'GENERATE-ROUTE': `<Route exact path='/${lname}/:action?/:id?' component={${component}} />\n`,
    };
    compiler
      .shouldFormat(() => true)
      .compile(data);
    compiler.compileVar(context.routerTarget, reference);
    generateEnums2(compiler, controller, context);
    ui.writeLog(`页面模块 【${component}】 Created !`);
  } else {
    ui.writeLog(`页面模块 【${component}】 已存在,无需重复生成 !`);
  }
  ui.close();
};


function existsModule(context, controller) {
  const pagesRoot = path.resolve(context.pagesRoot);
  const component = util.toCamel(controller.name.replace('-controller', '').replace(/-/g, '/'));
  const targetModule = path.join(pagesRoot, component);
  return fs.existsSync(targetModule);
}

function getCompileData(controller, answer, api, lname, component, context) {
  const namespace = lname.split('/').join('.');
  const redux = api.redux ? generateRedux(answer, api, namespace) : {};
  const enumTarget = context.admin.enumsUsing;
  return {
    'name': component,
    namespace,
    'projectName': context.prefix,
    'primaryKey': answer.primaryKey,
    'className': `${lname.split('/').join('-')}-module`,
    'componentName': api.serviceName.replace('Service', ''),
    'ui': 'antd',
    'service': api.serviceName,
    'serviceDescription': api.desc,
    'get': api.get || '',
    'query': api.query || '',
    'title': controller.label,
    'state': namespace.split('/').join('-'),
    'enumTarget': context.admin.enumsUsing,
    'storeModule': context.admin.store,
    'uiModules': context.admin.ui,
    'serviceModule': context.admin.services,
    'GENERATE-COLUMNS': generateColumns(controller) || '',
    'GENERATE-SEARCH': generateSearch(controller) || '',
    'GENERATE-EDIT-FORMS': generateForms(controller) || '',
    'GENERATE-LIST-ANT': generateUsing(controller, 'list', 'antd'),
    'GENERATE-LIST-UI': generateUsing(controller, 'list', 'pc', ','),
    'GENERATE-CONSTANT': generateEnums(controller, 'list', 'const', enumTarget),
    'GENERATE-EDIT-CONSTANT': generateEnums(controller, 'edit', 'const', enumTarget),
    'GENERATE-EDIT-ANT': generateUsing(controller, 'edit', 'antd'),
    'GENERATE-EDIT-UI': generateUsing(controller, 'edit', 'pc', ','),
    'GENERATE-EDIT-RULES': Object.keys(controller.rules).map((k) => controller.rules[k]).join(',\n    '),
    'GENERATE-ACTIONS': redux.actions || '',
    'GENERATE-REDUCERS': redux.reducers || '',
    'GENERATE-ACTIONS-EXPORTS': redux.actionExports || '',
    'GENERATE-SUBMIT': redux.submit,
    'actionViews': redux.viewsCase,
  };
}

/**
 * 生成表格列
 * @param {} controller
 */
function generateColumns(controller) {
  const properties = getProperties(controller);
  return Object.keys(properties).map((name) => {
    const property = properties[name];
    const isDate = (property.format || '').indexOf('date') > -1 && property.format.indexOf('time') > -1;
    let format = isDate ? ', format: \'date\'' : '';
    if (property.enum) {
      const enumName = getEnumName(controller, name);
      format = `, enums: Admin.${enumName}`;
    }
    return `{ title: '${properties[name].text}', name: '${name}'${format}}`;
  }).join(',\n    ');
}

/**
 * 生成enums引用
 * @param {}
 */
function generateEnums(controller, type, id, enumTarget) {
  const enums = generateUsing(controller, type, id);
  if (enums) {
    return `import Admin from '${enumTarget}'`;
  }
  return '';
}

/**
 * 生成搜索条件
 * @param {} controller
 */
function generateSearch(controller) {
  const properties = getProperties(controller);
  const searchKeys = Object.keys(properties).slice(0, 3);
  return searchKeys.map((name) => {
    const property = properties[name];
    const form = generateFormInput(property, controller, name, 'list');
    return `{ title: '${property.text}', name: '${name}'${form} }`;
  }).join(',\n    ');
}

/**
 * 获取所有属性
 * @param {*} controller
 */
function getProperties(controller) {
  const model = controller.model || { properties: {} };
  const { properties } = model;
  const newProperties = {};
  Object
    .keys(properties || {})
    .map((name) => {
      const property = properties[name];
      newProperties[name] = property;
      property.text = property.description || name;
      return true;
    });
  return newProperties;
}

/**
 * 生成表单
 * @param {*} controller
 */
function generateForms(controller) {
  const properties = getProperties(controller);
  const ignores = ['createTime', 'updateTime', 'updateBy', 'updateTime'];
  return Object.keys(properties)
    .filter((name) => ignores.indexOf(name) < 0)
    .map((name) => {
      const property = properties[name];
      const { text } = property;
      const render = generateFormInput(property, controller, name, 'edit', 'disabled={this.isViewMode} ');
      if (!property.allowEmptyValue) {
        controller.rules[name] = `${name}: [{ required: true, message: '请输入${text}' }]`;
      }
      return `{ title: '${text}', name: '${name}'${render} }`;
    }).join(',\n    ');
}

/**
 * 根据属性，来生成对应的表单组件
 * @param {*} property
 * @param {*} controller
 * @param {*} propertyName
 */
function generateFormInput(property, controller, propertyName, namespace, custProps) {
  const { usingComponents } = controller;
  usingComponents[namespace] = usingComponents[namespace] || {};
  const typeUsing = usingComponents[namespace];
  const { enums } = controller;
  custProps = custProps || '';
  switch (property.type) {
    case 'number':
    case 'int64':
    case 'float':
    case 'double':
      typeUsing.InputNumber = 'antd';
      return `, render: <InputNumber ${custProps}/>`;
    case 'date-time':
    case 'date':
      typeUsing.DatePicker = 'antd';
      return `, render: <DatePicker ${custProps}/>`;
    case 'string':
      if (property.enum) {
        const item = { enum: {}, name: property.description || property.name };
        const name = getEnumName(controller, propertyName);
        property.enum.map((name2) => item.enum[name2] = { label: name2, value: name2 });
        enums[name] = item;
        typeUsing.Admin = 'const';
        if (namespace === 'list') {
          return `, enums: Admin.${name}`;
        }
        typeUsing.AdvancePicker = 'pc';
        return `, render: <AdvancePicker mode="local" data={ Admin.${name} } ${custProps}/>`;
      }
      return '';
    case 'boolean':
      typeUsing.Switch = 'antd';
      return ', render: <Switch />';
    default:
      return '';
  }
}

/**
 * 生成执行类型的引用
 * @param {*} controller
 * @param {*} libarary
 */
function generateUsing(controller, libarary, mName, prefix) {
  const { usingComponents } = controller;
  const typeUsing = usingComponents[libarary] || {};
  const elements = Object.keys(typeUsing).filter((name) => typeUsing[name] === mName);
  if (elements.length > 0 && prefix) {
    return prefix + elements.join(', ');
  }
  return elements.join(', ');
}

/**
 * 生成枚举值
 * @param {*} compiler
 * @param {*} controller
 * @param {*} context
 */
function generateEnums2(compiler, controller, context) {
  const { enums } = controller;
  const enumsRoot = path.resolve(context.enumTarget);
  Object.keys(enums).forEach((k) => {
    const item = enums[k];
    const { name } = item;
    const obj = item.enum;
    const json = Object.keys(obj).map((p) => {
      const element = obj[p];
      return `  ${p}: { label: '${element.label}', value: '${element.value}' },`;
    }).join('\n');
    const enumReference = {
      'GENERATE-ENUM': `// ${name}\nconst ${k} ={\n${json}\n};\n\n`,
      'GENERATE-EXPORT': `${k},\n  `,
    };
    compiler.compileVar(enumsRoot, enumReference);
  });
}

// 获取生成的枚举值名称
function getEnumName(controller, name) {
  return util.toCamel(`${controller.name}/${name}`);
}

module.exports.existsModule = existsModule;
