const fs = require('fs');
const path = require('path');
const babelParser = require('@babel/parser');
const babelTraverse = require('@babel/traverse').default;
const hightlight = require('@vuepress/markdown/lib/highlight');
const nodeToString = require('./nodeToString');

module.exports = function () {
  var callback = this.async();
  const methods = [];
  const id = this._module.resource;
  const source = fs.readFileSync(id).toString('utf-8');
  const ext = path.extname(id).replace('.', '');
  const ast = babelParser.parse(source, {
    sourceType: 'module',
    plugins: [
      'jsx',
      'classProperties',
      'typescript',
    ],
  });
  babelTraverse(ast, {
    enter: (path) => {
      const node = path.node;
      switch (node.type) {
        case 'FunctionDeclaration':
          const isReturn = node.body.body.length == 1 && node.body.body[0].type === 'ReturnStatement';
          let oCode = nodeToString(node.body);
          if (isReturn) {
            oCode = oCode.replace('return ', '')
          }
          oCode = oCode.replace(/^\{/, '').replace(/\}$/, '')
          const code = hightlight(oCode, ext);
          methods.push({
            name: node.id?.name,
            code: code,
          })
          break;
      }
    },
    exit: (path) => {
      if (ast.program !== path.node) return;
      callback(null, 'module.exports = ' + JSON.stringify(methods))
    },
  })
}

// const kk = {
//   _module: {
//     resource: '/Users/admin/office/bilis/src/modules/jssdk/demo/src/onPageVisibilityChange.tsx'
//   },
//   async: () => {
//     return () => {

//     }
//   }
// }

// module.exports.call(kk);