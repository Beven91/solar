const fs = require('fs');
const ReactTypescriptParser = require('./ReactTypescriptParser');
const { probeApp } = require('../loaders/vendor-loader/index');

class JavascriptParser {

  createParser(file) {
    const source = fs.readFileSync(file).toString('utf-8');
    const type = probeApp(source);
    switch (type) {
      case 'react':
        return new ReactTypescriptParser(file);
      default:
        return null;
    }
  }

  async parseComponentProps(file) {
    try {
      const parser = this.createParser(file);
      if (parser) {
        return parser.parseComponentProps();
      } else {
        return { interfaces: {} }
      }
    } catch (ex) {
      console.error(ex);
      return { interfaces: {} }
    }
  }
}

// const Parser = require('./Parser');
// const parser = new Parser('build/parser/demo.tsx');

// parser.plugins = [
//   'jsx',
//   'classProperties',
//   'typescript',
// ]

// parser.parse({
//   enter: (path) => { 
//     // if(path.node.type == 'TSTypeReference'){
//     //   console.log(path.node);
//     // }
//     console.log(path.node.type)    
//   }
// })

// const mm = require('../process/features/generate.component.props');
// const id = '/Users/admin/office/fluxy/src/fluxy-pc/src/abstract-object/index.tsx';
// // const id = '/Users/admin/office/stjkdocs/repos/fluxy/src/fluxy-pc/src/abstract-table/index.tsx';
// const id = '/Users/admin/office/bilis/src/modules/jssdk/src/sdk.ts'
// const parser2 = new ReactTypescriptParser(id);
// parser2.parseComponentProps().then((res) => {
//   console.log(res);
//   // const content = mm.createMemberTable(res.propType, '属性', {}, true);
//   // console.log(content);
//   // console.log(res.propType.members[0]);
// })


// const id = '/Users/admin/office/stjkdocs/repos/fluxy/src/fluxy-pc/src/abstract-object/index.tsx';
// new JavascriptParser('react').parseComponentProps(id).then((r)=>{
//   console.log(r.interfaces[r.propsName].members[1].referenceType.members[1].referenceType);
// })

module.exports = JavascriptParser