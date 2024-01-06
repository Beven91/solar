const fs = require('fs');
const path = require('path');
const babelParser = require('@babel/parser');
const babelTraverse = require('@babel/traverse').default;
const hightlight = require('@vuepress/markdown/lib/highlight');
const nodeToString = require('./nodeToString');
const ReactTypescriptParser = require('../parser/ReactTypescriptParser');
const runtime = require('../parser/Runtimes');

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

function generateObject(type) {
  const code = type.members.map((item) => {
    const segments = [];
    const pad = '  ';
    const optional = item.optional ? '?' : '';
    const optionalDesc = item.optional ? '' : '必填 ';
    const comments = (item.comments || '').split('\n').map((m) => m.trim()).filter((m) => !!m);
    if (comments.length == 1) {
      segments.push(pad + `// ${optionalDesc}` + comments);
    } else if (comments.length > 1) {
      segments.push(pad + `/**\n${pad} * ${comments.join(`\n${pad} * `)}\n${pad} */`)
    }
    if (item.type == 'array') {
      segments.push(`${pad}${item.name}${optional}: Array<${item.elementType.referenceCode || item.elementType.code}>`)
    } else if (item.type == 'object') {
      segments.push(`${pad}${item.name}${optional}: ${item.code.replace(/(\n)/g, '$1' + pad)}`)
    } else {
      segments.push(`${pad}${item.name}${optional}: ${item.code}`)
    }
    return segments.join('\n');
  }).join('\n')
  return `{\n${code}\n}`;
}

function generateReferenceType(interfaces, name) {
  const type = interfaces[name];
  if (!type || type.type !== 'object') return '';
  const code = generateObject(type)
  return {
    name: type.name,
    code: hightlight(code, 'tsx')
  }
}

function generateReturnType(interfaces, returnType) {
  if (!returnType) return '';
  const typeAnnotation = (returnType.typeAnnotation || {});
  if (typeAnnotation.type == 'TSTypeReference' && typeAnnotation.typeName.name == 'Promise') {
    const param = typeAnnotation.typeParameters.params[0];
    const isArray = param.type == 'TSArrayType';
    const typeName = isArray ? param.elementType.typeName : param.typeName;
    const infoType = interfaces[(typeName || {}).name];
    if (!typeName || !infoType) {
      return nodeToString(returnType);
    }
    if (infoType.type != 'object') {
      return nodeToString(returnType);
    }
    return `Promise<${generateObject(infoType)}>`;
  }
  return nodeToString(returnType);
}

async function resolveMethods(id) {
  const parser = new ReactTypescriptParser(id);
  const interfaces = await parser.parse();
  return new Promise((resolve) => {
    const methods = [];
    const ext = path.extname(id).replace('.', '');
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
              accessibility: node.accessibility,
              returnType: hightlight(generateReturnType(interfaces, node.returnType), ext),
              params: node.params.map((m) => {
                const name = m.argument ? nodeToString(m) : m.name;
                const keyName = m.argument ? m.argument.name : m.name;
                const typeAnnotation = (m.typeAnnotation || {}).typeAnnotation || {};
                return {
                  name: name,
                  refType: typeAnnotation.type === 'TSTypeReference' ? generateReferenceType(interfaces, typeAnnotation.typeName.name) : null,
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
        resolve('module.exports = ' + JSON.stringify(methods))
      },
    })
  })
}

module.exports = function () {
  var callback = this.async();
  const id = this._module.resource;
  runtime.imports = {};
  resolveMethods(id).then((res) => callback(null, res)).catch(callback);
}

// const kk = {
//   _module: {
//     resource: '/Users/admin/office/bilis/src/modules/jssdk/src/sdk.ts',
//   },
//   async: () => {
//     return () => {

//     }
//   }
// }

// module.exports.call(kk);