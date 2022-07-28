const fs = require('fs-extra');
const path = require('path');
const babelParser = require('@babel/parser');
const babelGenerator = require('@babel/generator').default;
const babelTraverse = require('@babel/traverse').default;
const Compiler = require('../../../helpers/compiler.js');

class ServiceAST {
  constructor(file, name, data) {
    this.className = name;
    this.data = data;
    this.source = fs.readFileSync(file).toString('utf-8');
    this.ast = babelParser.parse(this.source, {
      plugins: [
        'typescript',
        'classProperties',
      ],
      sourceType: 'module',
    });
    babelTraverse(this.ast, {
      enter(path) {
        if (path.node.type === 'ClassMethod') {
          const leadingComments = path.node.leadingComments || [];
          delete path.node.trailingComments;
          delete path.node.leadingComments;
          if (leadingComments.length > 0) {
            const comment = (leadingComments[0].value || '').replace(/\n\s\s/g, '\n');
            path.addComment('leading', comment);
          }
        }
      },
    });
  }

  /**
   * 当前接口类已经定义好的方法
   */
  get methods() {
    const classNode = this.ast.program.body.find((node) => node.type === 'ClassDeclaration');
    if (classNode) {
      return classNode.body.body
        .filter((node) => node.type === 'ClassMethod')
        .map((node) => {
          return {
            name: node.key.name,
            node: node,
          };
        });
    }
  }

  addServiceMethod(name, code) {
    if (this.methods.find((n) => n.name === name)) {
      // 已存在的方法不进行生成
      return;
    }
    const template = `class A { 
      ${code} 
    }`;
    try {
      const className = this.className;
      const ast = babelParser.parse(template, {
        plugins: [
          'typescript',
          'classProperties',
        ],
      });
      const classNode = ast.program.body.find((n) => n.type === 'ClassDeclaration');
      babelTraverse(this.ast, {
        enter(path) {
          if (path.node.name === 'DemoService') {
            path.node.name = className;
          } else if (path.node.type === 'ClassDeclaration') {
            delete classNode.body.body[0].leadingComments;
            const nodes = path.get('body').pushContainer('body', classNode.body.body);
            nodes[0].addComment('leading', ast.comments[0].value);
          }
        },
      });
    } catch (ex) {
      console.log(template);
      throw ex;
    }
  }

  saveTo(target) {
    const compiler = new Compiler();
    const res = babelGenerator(this.ast, { filename: target, retainLines: true });
    const inCode = res.code
      .replace(/\*\//g, '*/\n')
      .replace(/\/\*\*/g, '\n\n/**')
      .replace(/\n\s{3,}/g, '\n   ');
    const code = compiler.compileString(inCode, this.data, true, 'a.js');
    fs.ensureDirSync(path.dirname(target));
    fs.writeFileSync(target, code);
  }
}

module.exports = ServiceAST;
