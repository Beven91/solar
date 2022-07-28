/**
 * @name Genesis
 * @date 2018-06-06
 * @description
 *    生成一个脚手架
 */
const fs = require('fs');
const path = require('path');
const inquirer = require('inquirer');
const Npm = require('npm-shell');
const Compiler = require('../../helpers/compiler');

const ui = new inquirer.ui.BottomBar();

module.exports = function(context) {
  return questions().then((answers) => end(answers, context));
};

/**
 * 人机交互，输入用户需要生成的接口等信息
 */
function questions() {
  return inquirer
    .prompt([
      {
        type: 'input',
        name: 'name',
        default: path.basename(path.resolve('')),
        message: '请输入您的项目名称:',
        validate: (name) => {
          const result = name.replace(/\s/g, '') !== '';
          const target = path.join(process.cwd(), name);
          if (!result) {
            return '项目名称不能为空';
          } if (fs.existsSync(fs.existsSync(target))) {
            return `已存在名称为:${name}的项目`;
          }
          return true;
        },
      },
      {
        type: 'confirm',
        name: 'isInit',
        default: false,
        // 当没有执行前面的confirm时执行此交互
        when: (answer) => generate(answer),
        message: '项目已生成，是否初始化项目?',
      },
      {
        type: 'confirm',
        name: 'isStart',
        default: false,
        // 当没有执行前面的confirm时执行此交互
        when: (answer) => initTarget(answer),
        message: '初始化完成，是否启动项目?',
      },
    ]);
}

/**
 * 生成页面模块
 */
function generate(answers) {
  const name = answers.name.toLowerCase().trim();
  const templateRoot = path.join(__dirname, '../../templates/mobile');
  const targetRoot = path.join(process.cwd(), name);
  const context = {
    projectName: name,
    configs: `${name}-configs`,
    version: require('../../../../package.json').version,
    service: `${name}-services`,
  };
  answers.templateRoot = targetRoot;
  const compiler = new Compiler(templateRoot, targetRoot);
  compiler
    .shouldFormat((id) => false)
    .setTemplate({
      'packages/app/': `packages/${context.projectName}/`,
      'packages/service/': `packages/${context.service}/`,
      'packages/configs/': `packages/${context.configs}/`,
    })
    .compile(context);
  return true;
}

// 初始化项目
function initTarget(answers) {
  if (answers.isInit) {
    const npm = new Npm(path.join(answers.templateRoot));
    ui.log.write('初始化项目...');
    npm.run('init');
    ui.log.write('初始化项目完成。');
    return true;
  }
  return false;
}

function end(answers) {
  if (answers.isStart) {
    const npm = new Npm(path.join(answers.templateRoot));
    npm.run('start');
    ui.close();
  }
}
