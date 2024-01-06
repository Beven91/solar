const fs = require('fs');
const babelParser = require('@babel/parser');
const nodeToString = require('./nodeToString');
const babelTraverse = require('@babel/traverse').default;

function parseComments(leadingComments) {
  leadingComments = (leadingComments || []).map((m) => m.value);
  const segments = leadingComments.join('\n').split('\n').map((segment) => {
    return segment.replace(/(\/\*|\*)+/g, '').trim();
  })
  const commnetInfo = {
    title: '',
    details: [],
    params: {
    }
  }
  segments.filter((m) => !!m.trim()).forEach((segment, i) => {
    if (i == 0) {
      commnetInfo.title = segment.trim();
    } else if (/@param/.test(segment)) {
      const cn = segment.split('@param').pop().trim();
      const parts = cn.split(/\s+/);
      const kn = parts[0].trim();
      commnetInfo.params[kn] = String(parts[1]).replace(/\n/, '')
    } else if (!/@/.test(segment) && Object.keys(commnetInfo.params).length < 1) {
      commnetInfo.details.push(segment);
    }
  })
  return commnetInfo;
}

module.exports = function () {
  var callback = this.async();
  const methods = [];
  const id = this._module.resource;
  const source = fs.readFileSync(id).toString('utf-8');
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
      const leadingComments = (node.leadingComments || [])
      const commnetInfo = parseComments(leadingComments);
      switch (node.type) {
        case 'FunctionDeclaration':
          break;
        case 'ClassMethod':
        case 'TSDeclareMethod':
          methods.push({
            name: node.key.name,
            params: node.params.map((m) => {
              const name = m.argument ? nodeToString(m) : m.name;
              const keyName = m.argument ? m.argument.name : m.name;
              return {
                name: name,
                code: nodeToString(m.typeAnnotation),
                desc: commnetInfo.params[keyName]
              }
            }),
            title: commnetInfo.title,
            leadingComments: commnetInfo.details
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