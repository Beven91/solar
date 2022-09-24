

const fs = require('fs');
const Parser = require('./Parser');
const globalRuntimes = require('./Runtimes');

class ReactTypescriptParser extends Parser {
  plugins = [
    'jsx',
    'classProperties',
    'typescript',
  ];

  extensions = ['.d.ts', '.tsx', '.ts'];

  async parse() {
    await super.parse({
      enter: (path) => {
        const node = path.node;
        // console.log(node.type);
        switch (node.type) {
          case 'ImportDeclaration':
            const request = (node.source || {}).value;
            node.specifiers.forEach((specifier) => {
              this.addImport((specifier.local || specifier.imported || {}).name, request);
            });
            break;
          case 'ExportNamedDeclaration':
            this.exportDeclarations.push(node);
            break;
          case 'FunctionDeclaration':
            if (path.parentPath.node.type == 'Program') {
              this.topDeclarationNodes.push(node);
            }
            break;
          case 'VariableDeclaration':
            if (path.parentPath.node.type == 'Program') {
              this.topDeclarationNodes.push(...node.declarations);
            }
            break;
          case 'TSTypeAliasDeclaration':
            if (node.id) {
              const aliasNode = node.typeAnnotation || node.type;
              const type = this.createOrGetType(node.id.name);
              this.readTSType(type, aliasNode);
              this.readTypeParameters(type, node);
              type.code = this.nodeToString(aliasNode || node.body);
            }
            break;
          case 'ClassDeclaration':
          case 'TSInterfaceDeclaration':
            this.readClassInterfaceType(node);
            break;
          case 'ExportDefaultDeclaration':
            this.topDeclarationNodes.push(node.declaration);
            this.defaultExportNode = node.declaration;
            break;
        }
      },
    });
    await this.processFallbackTypes();
    return this.interfaces;
  }

  async parseComponentProps() {
    await this.parse();
    const name = this.findNodeName(this.defaultExportNode);
    const propName = this.readComponentPropsType() || `${name}Props`;
    let propType = this.interfaces[propName];
    const exportType = this.interfaces[name];
    if (propName && !propType) {
      propType = await this.resolveReferenceType(propName);
    }
    propType = propType || this.interfaces[`${name}Props`];
    if (propType && propType.uionTypes.length > 0) {
      this.mergeUionTypes(propType);
    }
    if (propType && exportType && exportType.generic.length > 0) {
      await this.renderGeneric(propType, exportType.generic);
    }
    if (exportType && propType) {
      const defaultProps = exportType.members.find((m) => m.name == 'defaultProps');
      const value = (defaultProps || {}).defaultValue || {};
      propType.members.forEach((memberType) => {
        memberType.defaultValue = memberType.defaultValue == null ? value[memberType.name] : memberType.defaultValue;
      });
    }
    return {
      interfaces: this.interfaces,
      propType: propType,
      reasons: this.allReasons,
    };
  }

  async renderGeneric(type, generic) {
    return this.asyncEach(type.members, async(memberType) => {
      const genericType = generic.find((m) => m.name == memberType.code);
      if (genericType) {
        const value = genericType.defaultValue;
        const dest = value ? value.code : genericType.type;
        memberType.referenceNode = {
          typeName: {
            name: dest,
          },
        };
        return this.processTypeReferences(memberType, generic);
      }
    });
  }

  readClassInterfaceType(node) {
    const type = this.createOrGetType(node.id.name, 'object');
    type.extends = [...(node.implements || [])]; // .map((m) => m.expression.name);
    if (node.extends) {
      const ids = node.extends; // .map((m) => m.expression.name);
      type.extends = type.extends.concat(ids);
    }
    if (node.superClass) {
      type.extends.push(node.superClass);
    }
    this.readTSType(type, node.body);
    type.code = this.nodeToString(node.body);
    this.readTypeParameters(type, node);
  }

  readTypeExtend(node) {
    if (!node.expression) {
      return { name: node.name, exclude: {} };
    }
    const advanceType = ['Omit', 'Partial', 'Readonly', 'Pick', 'Required', 'Exclude', 'Extract'];
    if (advanceType.indexOf(node.expression.name) > -1) {
      const exclude = {};
      const name = node.typeParameters.params[0].typeName.name;
      switch (node.expression.name) {
        case 'Omit':
          const param = node.typeParameters.params[1] || {};
          this.readOmitExclude(param, exclude);
          break;
      }
      return { name, exclude };
    }
    return { name: node.expression.name };
  }

  renderAvanceType(type, node) {
    switch (node.typeName.name) {
      case 'Omit':
        type.exclude = this.readOmitExclude(node.typeParameters.params[1] || {});
        break;
    }
  }

  readOmitExclude(node, exclude) {
    exclude = exclude || {};
    const types = node.types ? node.types : (node.literal ? [node.literal] : []);
    types.forEach((type) => {
      const id = type.literal ? type.literal.value : type.value;
      exclude[id] = true;
    });
    return exclude;
  }

  readTypeParameters(type, node) {
    if (node.typeParameters) {
      type.generic = node.typeParameters.params.map((m) => {
        const genericType = this.createType(m.name);
        if (m.default) {
          genericType.defaultValue = this.createType();
          this.readTSType(genericType.defaultValue, m.default);
        } else if (m.constraint) {
          genericType.type = m.constraint.typeName.name;
        }
        genericType.type = genericType.type || m.name;
        return genericType;
      });
    }
  }

  readTSType(type, node) {
    switch (node.type) {
      case 'TSTypeLiteral':
        type.type = type.type || 'object';
        node.members.forEach((item) => this.readTSType(type, item));
        break;
      case 'ObjectExpression':
      case 'ObjectPattern':
        node.properties.forEach((item) => this.readTSType(type, item));
        break;
      case 'TSInterfaceBody':
      case 'ClassBody':
        node.body.forEach((item) => this.readTSType(type, item));
        break;
      case 'TSTypeAnnotation':
        return this.readTSType(type, node.typeAnnotation);
      case 'TSUnionType':
      case 'TSIntersectionType':
        type.type = 'uiontype';
        type.code = this.nodeToString(node);
        type.uionTypes = node.types.map((itemNode) => {
          const itemType = this.createType();
          this.readTSType(itemType, itemNode);
          itemType.code = this.nodeToString(itemNode);
          return itemType;
        });
        break;
      case 'TSFunctionType':
        type.type = 'function';
        type.code = this.nodeToString(node);
        break;
      case 'TSArrayType':
        type.type = 'array';
        type.elementType = this.createType();
        this.readTSType(type.elementType, node.elementType);
        break;
      case 'TSTypeReference':
        this.readTSTypeReference(type, node);
        break;
      case 'ClassProperty':
      case 'ObjectProperty':
      case 'TSPropertySignature':
        const memberType = this.createType(node.key.name, '');
        const typeAnnotation = node.typeAnnotation || (node.value || {}).typeAnnotation;
        if (typeAnnotation) {
          this.readTSType(memberType, typeAnnotation);
        } else {
          memberType.type = 'value';
        }
        if (node.value && node.value.type == 'ObjectExpression') {
          this.readTSType(memberType, node.value);
          const value = {};
          memberType.members.forEach((itemType) => {
            value[itemType.name] = itemType.defaultValue;
          });
          memberType.defaultValue = value;
        } else {
          memberType.defaultValue = this.valueToString(node.value);
        }
        const comments = (node.leadingComments || []).map((item) => item.value).join(' ').replace(/\*/g, '');
        memberType.code = this.nodeToString(node.typeAnnotation || node.value);
        memberType.comments = comments.replace(/^\n|\n$/g, '').trim();
        type.members.push(memberType);
        break;
      default:
        type.code = this.nodeToString(node);
        break;
    }
  }

  readTSTypeReference(type, node) {
    type.name = type.name || node.typeName.name;
    type.code = this.nodeToString(node);
    switch (node.typeName.name) {
      case 'PropsWithChildren':
      case 'Partial':
      case 'Readonly':
      case 'Pick':
      case 'Required':
      case 'Exclude':
      case 'Extract':
      case 'Omit':
        const parameter = node.typeParameters.params[0];
        if (parameter.typeName && parameter.typeName.type == 'Identifier') {
          type.referenceNode = parameter;
        } else {
          this.readTSType(type, node.typeParameters.params[0]);
        }
        this.renderAvanceType(type, node);
        break;
      case 'Array':
        type.type = 'array';
        if (node.typeParameters) {
          type.elementType = this.createType();
          this.readTSType(type.elementType, node.typeParameters.params[0]);
        }
        break;
      default:
        type.referenceNode = node;
        break;
    }
  }

  readComponentPropsType(node) {
    if (node == null) {
      const declarations = this.topDeclarationNodes;
      const name = this.findNodeName(this.defaultExportNode);
      node = declarations.find((declaration) => declaration.id.name == name);
    }
    node = node || {};
    switch (node.type) {
      case 'ClassDeclaration':
        const cid = node.superTypeParameters ? node.superTypeParameters.params[0].typeName.name : '';
        if (cid == 'React.PropsWithChildren' || cid == 'PropsWithChildren') {
          return this.readComponentPropsType(node.superTypeParameters.params[0]);
        }
        return cid;
      case 'VariableDeclarator':
        return node.init ? this.readComponentPropsType(node.init) : '';
      case 'CallExpression':
        if (node.callee.name == 'forwardRef') {
          const typeNode = node.arguments[0].params[0].typeAnnotation;
          return typeNode ? typeNode.typeAnnotation.typeName.name : '';
        }
        break;
      case 'FunctionDeclaration':
      case 'FunctionExpression':
        const params = node.params || [];
        const isSfc = params.length > 0 && params[0].typeAnnotation;
        const name = isSfc ? params[0].typeAnnotation.typeAnnotation.typeName.name : '';
        if (isSfc) {
          const type = this.createType();
          const memberValues = {};
          const itemType = this.interfaces[name];
          this.readTSType(type, params[0]);
          type.members.forEach((member) => {
            memberValues[member.name] = member.defaultValue;
          });
          if (itemType) {
            itemType.members.forEach((member) => {
              member.defaultValue = memberValues[member.name];
            });
          }
        }
        return name;
      case 'TSTypeReference':
        if (node.typeParameters) {
          const item = node.typeParameters.params[0];
          return item.typeName ? item.typeName.name : '';
        } else if (node.typeName) {
          return node.typeName.name;
        }
        return '';
      default:
        return '';
    }
  }

  mergeUionTypes(type) {
    type.uionTypes.forEach((item) => {
      this.mergeUionTypes(item);
      type.members.push(...item.members);
    });
  }

  async processFallbackTypes() {
    globalRuntimes.imports[this.id] = this.interfaces;
    await this.processExportSpecifiers();
    await this.asyncEach(Object.keys(this.interfaces), async(key) => {
      const type = this.interfaces[key];
      if (!type) {
        return;
      }
      const generic = type.generic;
      return this.processFallbackType(type, generic);
    });
  }

  async processFallbackType(type, generic) {
    if (type.handled) return;
    type.handled = true;
    // 处理继承
    await this.processTypeExtends(type);
    // 处理交叉和联合类型
    await this.processUionTypes(type, generic);
    // 处理当前类型子成员
    await this.processTypeMembers(type, generic);
    // 处理类型引用
    await this.processTypeReferences(type, generic);
  }

  async processExportSpecifiers() {
    return this.asyncEach(this.exportDeclarations, async(node) => {
      if (!node.source) return;
      const source = node.source.value;
      const specifiers = node.specifiers || [];
      const id = this.resolveModule(source, this.id);
      if (id) {
        const interfaces = await this.requireTypeFile(id);
        specifiers.forEach((itemNode) => {
          const name = (itemNode.local || itemNode.exported).name;
          if (!this.interfaces[name]) {
            this.interfaces[name] = interfaces[itemNode.exported.name];
          }
        });
      }
    });
  }

  processTypeExtends(type) {
    const allMembers = {};
    const extendsNodes = type.extends || [];
    type.members.forEach((m) => allMembers[m.name] = true);
    return this.asyncEach(extendsNodes, async(extendsNode) => {
      const meta = this.readTypeExtend(extendsNode);
      const exclude = meta.exclude || {};
      const extendsType = await this.resolveReferenceType(meta.name);
      if (!extendsType) return;
      extendsType.members.forEach((member) => {
        if (!allMembers[member.name] && !exclude[member.name]) {
          allMembers[member.name] = true;
          type.members.push(member);
        }
      });
    });
  }

  async processUionTypes(type, generic) {
    for (let i = 0, k = type.uionTypes.length; i < k; i++) {
      const itemType = type.uionTypes[i];
      if (itemType.referenceNode) {
        this.processTypeReferences(itemType, generic);
        // const realType = await this.resolveReferenceType(reference);
        // itemType.referenceType = realType;
      }
    }
  }

  async processGenericTypes(type, generic) {
    const referenceNode = type.referenceNode;
    const name = referenceNode.typeName.name;
    const genericType = generic.find((m) => m.name == name);
    const params = referenceNode.typeParameters ? referenceNode.typeParameters.params : [];
    if (genericType) {
      const value = genericType.defaultValue;
      const dest = value ? value.code : genericType.type;
      referenceNode.typeName.name = genericType.type;
      const regexp = new RegExp(name, 'g');
      type.code = type.code.replace(regexp, dest);
    }
    params
      .filter((parameter) => parameter.type == 'TSTypeReference')
      .forEach((parameter) => {
        const genericType = generic.find((m) => m.name == name);
        if (genericType) {
          parameter.typeName.name = genericType.name;
        }
      });
  }

  async processTypeReferences(type, generic) {
    if (!type.referenceNode) return;
    const referenceNode = type.referenceNode;
    this.processGenericTypes(type, generic);
    const name = referenceNode.typeName.name;
    const referenceType = await this.resolveReferenceType(name);
    if (!referenceType) {
      delete type.referenceNode;
      return;
    }
    this.mergeReferenceType(type, referenceType);
    delete type.referenceNode;
  }

  async processTypeMembers(type, generic) {
    const members = type.members || [];
    for (let i = 0, k = members.length; i < k; i++) {
      const memberType = members[i];
      const memberGeneric = [...memberType.generic, ...generic];
      await this.processFallbackType(memberType, memberGeneric);
    }
    if (type.elementType) {
      const memberGeneric = [...type.elementType.generic, ...generic];
      await this.processFallbackType(type.elementType, memberGeneric);
    }
  }

  async resolveReferenceType(name) {
    const type = this.interfaces[name];
    const id = this.importAvariables[name];
    if (type || !id) {
      return type;
    }
    const interfaces = await this.requireTypeFile(id);
    return interfaces[name];
  }

  async requireTypeFile(id) {
    let interfaces = globalRuntimes.imports[id];
    if (!interfaces && fs.existsSync(id)) {
      const parser = new ReactTypescriptParser(id);
      interfaces = await parser.parse();
      this.allReasons.push(...parser.allReasons);
    }
    return interfaces || {};
  }

  /**
   * 将一个值节点转换成代码字符串
   * @param {*} node
   * @returns {String}
   */
  valueToString(node) {
    if (!node) return null;
    switch (node.type) {
      case 'StringLiteral':
        return node.extra.rawValue;
      case 'BinaryExpression':
        return this.nodeToString(node);
      case 'VariableDeclarator':
        return this.valueToString(node.init);
      case 'AssignmentPattern':
        return this.valueToString(node.right);
      case 'ObjectExpression':
        return this.nodeToString(node);
      case 'TSAsExpression':
        return this.valueToString(node.expression);
      case 'Identifier':
        const avariableNode = this.topDeclarationNodes.find((m) => m.id.name == node.name);
        return this.valueToString(avariableNode);
      default:
        return this.nodeToString(node);
    }
  }

  findNodeName(node) {
    if (!node) return null;
    switch (node.type) {
      case 'Identifier':
        return node.name;
      default:
        return (node.id || {}).name;
    }
  }
}

module.exports = ReactTypescriptParser;