/**
 * @name CmsCommand
 * @date 2018-06-19
 * @description
 *    创建一个CMS装修模块
 */
const fs = require('fs');
const path = require('path');
const inquirer = require('inquirer');
const configer = require('../../helpers/configer');
const Compiler = require('../../helpers/compiler.js');

const ui = new inquirer.ui.BottomBar();

module.exports = function(context) {
  return init(context)
    .then(questions)
    .then((answers) => generate(answers, context));
};

/**
 * 检查配置
 */
function init(answers) {
  return new Promise((resolve, reject) => {
    const solar = configer.solar || {};
    const { cms } = solar;
    if (!cms) {
      reject(new Error(`找不到cms存放配置,
          请检查package.json是存在
          例如: 
          {    
            "solar":{
              "root":"packages/",
              "cms":{
                "target":"genesis-modules/modules/",
                "path":"genesis-modules/modules",
                "index":"genesis-modules/index.js",
                "groupName":"通用模块",
              }
            }
          }
      `));
    }
    answers.solar = solar;
    answers.targetRoot = configer.findPath(cms.target);
    answers.targetGroup = configer.findPath(cms.index);
    answers.targetGroupPath = configer.findPath(cms.path);
    answers.targetGroupName = cms.groupName;
    resolve(answers);
  });
}

/**
 * 人机交互，输入用户需要生成的接口等信息
 */
function questions(topAnswers) {
  return inquirer
    .prompt([
      {
        type: 'input',
        name: 'name',
        message: '装修模块名称:(例如: image ):',
        validate: (name) => {
          const result = name.replace(/\s/g, '') !== '' &&
            !fs.existsSync(path.join(topAnswers.targetRoot, `${name}`));
          return result ? true : `装修模块${name}已存在`;
        },
      },
    ]);
}

/**
 * 生成页面模块
 */
function generate(answers, context) {
  const { name } = answers;
  const { targetRoot } = context;
  const templateRoot = path.join(__dirname, '../../templates/cms');
  const compileOptions = {
    class: toCamel(name),
    date: (new Date()).toLocaleString(),
    name: name.toLowerCase(),
    groupName: context.targetGroupName || '通用模块',
    path: (`${context.targetGroupPath}/${name.toLowerCase()}`).replace(/\/\//g, '/'),
  };
  const compiler = new Compiler(templateRoot, targetRoot);
  compiler.compile(compileOptions, {});
  compileReferences(compileOptions, context);
  ui.log.write('生成完毕!');
}

/**
 * 编译装修模块注册引用
 */
function compileReferences(compileOptions, context) {
  const group = context.targetGroup;
  const { targetRoot } = context;
  if (fs.existsSync(group)) {
    const relative = path.relative(path.dirname(group), path.join(targetRoot, compileOptions.name));
    (new Compiler()).compileVar(group, {
      GENERATE_IMPORT: `import ${compileOptions.class} from './${relative}';\n`,
      GENERATE_EXPORT: `${compileOptions.class},\n  `,
    });
  }
}

/**
 * 驼峰命名
 * @param {String} name
 */
function toCamel(name) {
  const paths = name.split('/');
  let newName = '';
  let segments = [];
  paths.forEach((p) => {
    segments = segments.concat(p.split('-'));
  });
  segments.forEach((segment) => {
    newName += segment[0].toUpperCase() + (segment.substr(1)||'');
  });
  return newName;
}
