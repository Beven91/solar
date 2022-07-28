/**
 * @name 创建一个Rest接口类
 * @date 2018-06-06
 * @description
 *    生成指定Rest接口类到指定目录下
 */
const fs = require('fs');
const path = require('path');
const inquirer = require('inquirer');
const generate = require('./generate');
const configer = require('../../../helpers/configer');
const {
  searchServices,
  searchServiceMethods,
} = require('./common');

let mode = 'service';

module.exports = function(context) {
  mode = context.command;
  return init(context)
    .then(questions)
    .then((answers) => {
      answers.target = context.serviceTarget;
      answers.host = answers.serverHost;
      answers.onlyMock = mode === 'mock';
      if (answers.confirm) {
        return generate(answers);
      }
    });
};

/**
 * 检查配置
 */
function init(answers) {
  return new Promise((resolve, reject) => {
    const solar = configer.solar;
    const { service } = solar;
    if (!service || !service.target) {
      reject(new Error(`找不到service存放配置,
          请检查package.json是存在
          例如: 
          {    
            "solar":{
              "root":"apis/",
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
    answers.solar = solar;
    answers.serviceTarget = configer.findPath(service.target);

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
        type: 'list',
        name: 'serverHost',
        message: '请选择环境?',
        choices: (configer.solar.service.servs || []),
      },
      {
        type: 'autocomplete',
        name: 'service',
        message: '请选择要生成的Rest接口:',
        source: searchServices,
      },
      {
        type: 'checkbox-plus',
        name: 'methods',
        searchable: true,
        message: '要生成的方法(空格键选择，可以输入进行筛选,默认生成所有):',
        source: searchServiceMethods,
      },
      (
        mode === 'mock' ?
          null :
          {
            type: 'confirm',
            name: 'confirm',
            default: false,
            // 当 要生成的Service已存在时使用此 交互
            when: (answers) => fs.existsSync(path.join(topAnswers.serviceTarget, `${answers.service.serviceName}.js`)),
            message: (answers) => `Service(${answers.service.name})已存在`,
          }
      ),
      {
        type: 'confirm',
        name: 'confirm',
        default: false,
        // 当没有执行前面的confirm时执行此交互
        when: (answers) => !('confirm' in answers),
        message: '确定生成?',
      },
    ].filter((v) => !!v));
}
