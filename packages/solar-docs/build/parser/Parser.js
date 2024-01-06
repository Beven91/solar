
const fs = require('fs');
const path = require('path');
const babelParser = require('@babel/parser');
const nodeToString = require('../loaders/nodeToString');
const babelTraverse = require('@babel/traverse').default;

class Parser {

  plugins = []

  extensions = ['.js']

  // 当前文件解析出来的所有类型字典
  interfaces = {}

  // 当前文件导入的模块变量
  importAvariables = {}

  // 顶级作用域下的变量类型申明
  topDeclarationNodes = []

  // 导出的类型
  exportDeclarations = []

  referenceTypes = [];

  // 默认导出的类型名
  defaultExportNode = null

  // 所有依赖文件
  allReasons = []

  // 当前解析文件的路径
  id = ''

  constructor(id) {
    this.id = id;
    this.allReasons = [id];
  }

  parse(options) {
    return new Promise((resolve, reject) => {
      try {
        const source = fs.readFileSync(this.id).toString('utf-8');
        const ast = babelParser.parse(source, {
          sourceType: 'module',
          plugins: this.plugins,
        });
        babelTraverse(ast, {
          ...(options || {}),
          exit: (a) => {
            if (ast.program !== a.node) return;
            resolve();
          },
        });
      } catch (ex) {
        resolve();
        console.error(ex);
      }
    })
  }

  /**
   * 添加一个导入变量
   */
  addImport(name, request) {
    this.importAvariables[name] = this.resolveModule(request, this.id);
  }

  /**
   * 创建或者获取一个类型结构对象
   * @param {*} name 类型名称
   * @returns {Type}
   */
  createOrGetType(name, type) {
    if (this.interfaces[name]) {
      return this.interfaces[name];
    }
    return this.interfaces[name] = this.createType(name, type);
  }

  /**
   * 创建一个类型结构
   */
  createType(name, type) {
    return {
      // 名称
      name: name,
      // 统一的类型名： object | array | value | uiontype | reference
      type: type,
      // 当前类型对应的代码
      code: '',
      // 如果当前和联合类型，则存放的为类型的组数
      uionTypes: [],
      // 如果类型为 object，则存放的是成员类型
      members: [],
      // 如果类型为array 则表示数组项的类型
      elementType: null,
      // 当前类型为 object时的继承信息
      extends: [],
      // 引用的类型名
      reference: '',
      referenceCode: '',
      // 引用的类型对应的节点
      referenceNode: null,
      // 默认值
      defaultValue: null,
      // 备注信息
      comments: '',
      // 泛型参数定义
      generic: [],
      // 是否处理完毕
      handled: false,
      // 是否可选
      optional: false
    }
  }

  mergeReferenceType(type, sourceType) {
    // type.code = sourceType.code;
    const exclude = type.exclude || {};
    type.referenceCode = sourceType.code;
    type.uionTypes = sourceType.uionTypes;
    type.members = sourceType.members.filter((m) => !exclude[m.name]);
    type.defaultValue = sourceType.defaultValue;
    type.comments = type.comments || sourceType.comments;
    type.generic = sourceType.generic;
    type.extends = sourceType.extends;
    type.elementType = sourceType.elementType;
    type.reference = sourceType.name;
    type.nativeType = sourceType.name;
    type.type = sourceType.type;
  }

  /**
   * 将一个节点转换成代码字符串
   * @param {*} node 
   * @returns {String}
   */
  nodeToString(node) {
    return nodeToString(node);
  }

  /**
   * 解析模块位置
   * @param {*} request 请求字符
   * @param {*} file 所在文件
   * @returns 
   */
  resolveModule(request, file) {
    if (/\.\//.test(request)) {
      let id = path.join(path.dirname(file), request);
      let ext = this.extensions.find((ext) => fs.existsSync(id + ext));
      if (!ext) {
        id = id + '/index';
        ext = this.extensions.find((ext) => fs.existsSync(id + ext));
      }
      this.allReasons.push(id + ext);
      return id + ext;
    }
    const segments = path.dirname(file).split(path.sep);
    while (segments.length > 0) {
      let dir = segments.join(path.sep) + '/.vuepress/@types/' + request;
      let ext = this.extensions.find((ext) => fs.existsSync(dir + ext));
      if (!ext) {
        dir = dir + '/index';
        ext = this.extensions.find((ext) => fs.existsSync(dir + ext));
      }
      if (!ext && !/\//.test(request)) {
        dir = segments.join(path.sep) + '/.vuepress/@types/' + request + '/lib/index';
        ext = this.extensions.find((ext) => fs.existsSync(dir + ext));
      }
      if (ext) {
        this.allReasons.push(dir + ext);
        return dir + ext;
      }
      segments.pop();
    }
    return '';
  }

  asyncEach(array, handler) {
    let promise = Promise.resolve({});
    array.forEach((item) => {
      promise = promise.then(() => Promise.resolve(handler(item)));
    });
    return promise;
  }
}

module.exports = Parser;