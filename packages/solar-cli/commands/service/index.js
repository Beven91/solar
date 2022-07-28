const inquirer = require('inquirer');

module.exports = function(context) {
  return inquirer
    .prompt([
      {
        type: 'list',
        name: 'type',
        message: '请选择接口类型?',
        choices: [
          { name: 'Swagger-API', value: 'swagger' },
        ],
      },
    ])
    .then((answers) => {
      switch (answers.type) {
        case 'swagger':
          return require('./swagger/index')(context);
        default:
          return Promise.reject(new Error('无效类型'));
      }
    });
};
