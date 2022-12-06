const path = require('path');
const fs = require('fs');
const pgk = require('./package.json');
const inquirer = require('inquirer');

inquirer.registerPrompt('autocomplete', require('inquirer-autocomplete-prompt'));
inquirer.registerPrompt('checkbox-plus', require('inquirer-checkbox-plus-prompt'));

const commands = [
  { name: 'H5项目', type: 'mobile', value: 'mobile' },
  { name: '创建后台应用', type: 'admin', value: 'admin' },
  { name: '创建后台应用(服务端)', type: 'admin', value: 'backend' },
  { name: '创建后台主应用', type: 'admin', value: 'admin-main' },
  { name: '创建后台子应用', type: 'admin', value: 'admin-sub' },
  { name: '小程序', type: 'mp', value: 'wxapp' },
  { name: '创建Chrome扩展', type: 'browser', value: 'chrome' },
  { name: '创建一个Admin页面模块', type: 'admin', value: 'admin-module' },
  { name: '创建一个Service', type: 'api', value: 'service' },
  { name: '创建一个Mock数据', type: 'api', value: 'mock' },
];

// 服务询问
function mainQuestions() {
  return inquirer.prompt([
    {
      type: 'list',
      name: 'type',
      message: '请选择平台(' + pgk.version + ')',
      choices: [
        { name: '接口', value: 'api' },
        { name: '小程序', value: 'mp' },
        { name: '后台', value: 'admin' },
        { name: '浏览器', value: 'browser' },
      ],
    },
    {
      type: 'autocomplete',
      name: 'command',
      message: '请选择服务:',
      source: (answer) => {
        return Promise.resolve(commands.filter((m) => m.type == answer.type));
      },
    },
  ]);
}

// 答复询问
function mainQuestionAnswer(answers) {
  const executePath = path.join(__dirname, './commands/' + answers.command);
  if (!fs.existsSync(executePath + '.js') && !fs.existsSync(executePath + '/index.js')) {
    throw new Error('不存在命令:' + executePath);
  }
  const executeCommand = require(executePath);
  if (typeof executeCommand !== 'function') {
    throw new Error('命令文件，module.exports必须返回函数形式，文件:' + executePath);
  }
  return executeCommand(answers);
}

// 启动服务操作
function runApplication() {
  mainQuestions()
    .then(mainQuestionAnswer)
    .then(function() {
      process.exitCode = 0;
    })
    .catch(function(error) {
      console.error(error);
      process.exitCode = 1;
    });
}

// 启动服务
runApplication();
