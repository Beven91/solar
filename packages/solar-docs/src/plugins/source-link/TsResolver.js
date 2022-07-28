function resolveUnionType(node) {
  return {
    type: 'union',
    values: node.types.map((item) => resolveType(item)),
  };
}

function resolveFunctionType(node) {
  const parameters = node.parameters.map((i) => resolveType(i));
  const items = node.parameters.map((p, i) => `${p.name}:${parameters[i].value}  `);
  return {
    type: 'function',
    // parameters:
    //   value:`(${items.join(',')}) => `
  };
}

function resolveType(node) {
  switch (node.type) {
    case 'TSTypeAnnotation':
      return getAnnotationType(node.typeAnnotation);
    case 'TSStringKeyword':
      return { type: 'string' };
    case 'TSAnyKeyword':
      return { type: 'any' };
    case 'TSTypeReference':
      return { type: 'reference', value: node.typeName.name };
    case 'TSLiteralType':
      return { type: 'literal', value: node.literal.value };
    case 'TSUnionType':
      return resolveUnionType(node);
    case 'TSFunctionType':
      return resolveFunctionType(node);
    default:
      return {
        type: 'unknow',
      };
  }
}


module.exports = {
  resolveType: resolveType,
};