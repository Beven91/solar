/**
 * @name Admin
 * @description
 *    生成一个后台系统脚手架
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
  const templateRoot = path.join(__dirname, '../../templates/backend');
  const targetRoot = path.join(process.cwd(), name);
  const context = {
    projectName: name,
    configs: `${name}-configs`,
    version: require('../../package.json').version,
    service: `${name}-services`,
  };
  answers.targetRoot = targetRoot;
  // if (fs.existsSync(path.join(targetRoot, 'package.json'))) {
  //   ui.log.write('项目已存在,无需生成。');
  //   return false;
  // }
  const compiler = new Compiler(templateRoot, targetRoot);
  compiler
    .shouldFormat((id) => false) // !/service\/index|build\//.test(id))
    .shouldFilter((file)=>/index\.dll\.ts|\.main\.(tsx|js)/.test(file))
    .setTemplate({
      'src/api/creation-api/': `src/api/${context.projectName}-api/`,
      'src/api/creation-api-config/': `src/api/${context.projectName}-api-config/`,
      'src/api/creation-api-core/': `src/api/${context.projectName}-api-core/`,
      'src/api/creation-api-models/': `src/api/${context.projectName}-api-models/`,
      'src/api/creation-api-services/': `src/api/${context.projectName}-api-services/`,
      'src/web/creation/': `src/web/${context.projectName}/`,
      'src/web/creation-provider/': `src/web/${name}-provider/`,
      'src/web/creation-ui/': `src/web/${name}-ui/`,
      'src/web/creation-services/': `src/web/${context.service}/`,
      'src/web/creation-configs/': `src/web/${context.configs}/`,

    })
    .compile(context);
  return true;
}

// 初始化项目
function initTarget(answers) {
  if (answers.isInit) {
    const npm = new Npm(path.join(answers.targetRoot));
    ui.log.write('初始化项目...');
    npm.shell('yarn', '');
    ui.log.write('初始化项目完成。');
    return true;
  }
  return false;
}

function end(answers) {
  if (answers.isStart) {
    const npm = new Npm(path.join(answers.targetRoot));
    npm.run('start');
    ui.close();
  }
}
