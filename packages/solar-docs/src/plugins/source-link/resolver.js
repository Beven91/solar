const path = require('path');
const fs = require('fs');
const babelParser = require('@babel/parser');
const babelGenerator = require('@babel/generator').default;
const babelTraverse = require('@babel/traverse').default;
// const TsResolver = require('./TsResolver');

module.exports = {
  resolveHome: function(pages) {
    const homeReadme = path.resolve('README.md');
    if (fs.existsSync(homeReadme)) {
      pages.push({
        path: '/',
        meta: {},
        title: 'Home',
        filePath: homeReadme,
      });
    }
    return pages;
  },
  resolveTs: function(page) {
    return new Promise((resolve) => {
      const file = page._filePath;
      const dir = path.dirname(file);
      const component = path.join(dir, 'index.tsx');
      // if (!fs.existsSync(component)) {
      //   component = path.join(dir, 'index.ts');
      // }
      if (!fs.existsSync(component)) {
        return resolve();
      }
      const meta = {
        componentPropsName: '',
        interfaces: {},
      };
      const buffer = fs.readFileSync(component);
      const ast = babelParser.parse(buffer.toString('utf-8'), {
        sourceType: 'module',
        plugins: [
          'classProperties',
          'jsx',
          'typescript',
        ],
      });
      babelTraverse(ast, {
        // ExportDefaultDeclaration
        // TSTypeParameterInstantiation
        // TSTypeReference
        // TSInterfaceDeclaration
        // TSInterfaceBody
        // TSPropertySignature
        exit(a) {
          if (ast.program !== a.node) return;
          const name = meta.interfaces[meta.componentPropsName];
          const newPage = {
            path: page.path,
            meta: {
              componentProps: name,
            },
            title: page.title,
            filePath: page._filePath,
            // content: content.replace(/\<interface-props\s+\/>/, `\`\`\`ts\n${name || ''}\n\`\`\``),
            relative: page.relativePath,
            frontmatter: page.frontmatter,
          };
          resolve(newPage);
        },
        enter(path) {
          const node = path.node;
          switch (node.type) {
            case 'TSInterfaceDeclaration':
              if (node.id) {
                // const props = node.body.body;
                const res = babelGenerator(node, { filename: 'a.js', retainLines: true });
                meta.interfaces[node.id.name] = res.code.replace(/\n+/, '\n').trim().replace(/\}$/, '\n}');
              }
              break;
            case 'ExportDefaultDeclaration':
              if (node.declaration) {
                const superTypeParameters = node.declaration.superTypeParameters;
                if (superTypeParameters) {
                  const param = superTypeParameters.params[0];
                  if (param) {
                    meta.componentPropsName = param.typeName.name;
                  }
                }
              }
              break;
          }
        },
      });
    });
  },
};