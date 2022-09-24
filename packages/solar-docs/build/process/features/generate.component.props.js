const path = require('path');
const fs = require('fs-extra');
const JavascriptParser = require('../../parser');

function defaultFindComponentPath(name, filePath) {
  const extensions = ['.tsx', '.ts', '.js', '.vue'];
  name = path.dirname(filePath);
  const ext = extensions.find((ext) => fs.existsSync(name + '/index' + ext));
  return name + '/index' + ext;
}

function createMemberTable(type, name, parentReference, isRoot) {
  if (type && type.type == 'function') {
    return `\n### ${name}\n \`\`\`js\n${type.referenceCode || type.code}\n\`\`\`\n`;
  }
  if (!type || type.members.length < 1) return '';
  const htmls = [];
  const reference = parentReference || {};
  htmls.push(`\n### ${name}\n`);
  htmls.push('<table class="table-props">');
  htmls.push('<thead>');
  htmls.push('<tr>');
  htmls.push('<th>属性</th>');
  htmls.push('<th>说明</th>');
  htmls.push('<th>类型</th>');
  htmls.push('<th>默认值</th>');
  htmls.push('</tr>');
  htmls.push('</thead>');
  htmls.push('<tbody>');
  type.members.forEach((member) => {
    const isObject = typeof member.defaultValue == 'object' && member.defaultValue;
    const value = isObject ? JSON.stringify(member.defaultValue, null, 2) : (member.defaultValue);
    const hasValue = !(value === null || value == undefined);
    htmls.push('<tr>');
    htmls.push(`<td>${member.name}</td>`);
    htmls.push(`<td>${html(member.comments || '')}</td>`);
    createTypeReference(member, htmls, reference);
    htmls.push(`<td>${hasValue ? `<code class="default-value">${html(value)}</code>` : '-'}</td>`);
    htmls.push('</tr>');
  });
  htmls.push('</tbody>');
  htmls.push('</table>');
  if (isRoot) {
    htmls.push(Object.keys(reference).map((k) => reference[k]).join('\n'));
  }
  return htmls.join('\n');
}

function createTypeReference(member, htmls, reference) {
  const code = html(member.referenceCode || member.code);
  // const useTable = (referenceType.hasReference || referenceType.members.length > 2);
  switch (member.type) {
    case 'object':
      htmls.push(buildObjectType(member, reference, code));
      break;
    case 'array':
      htmls.push(buildArrayType(member, htmls, reference, code));
      break;
    case 'uiontype':
      htmls.push(buildUionTypes(member, reference, code));
      break;
    default:
      htmls.push(`<td><code>${code}</code></td>`);
      break;
  }
}

function buildReferenceMembers(reference, type) {
  const name = type.reference || type.name;
  if (reference[name]) {
    return name;
  }
  reference[name] = ' ';
  reference[name] = createMemberTable(type, name, reference);
  return name;
}

function buildObjectType(member, reference, code) {
  // const name = member.reference || member.type;
  if (member.members.length > 1) {
    const id = buildReferenceMembers(reference, member);
    return `<td>${buildReferenceLink(id)}</td>`;
  }
  return `<td><code>${code}</code></td>`;
}

function buildArrayType(member, htmls, reference, code) {
  // const rhtmls = [];
  if (member.elementType.type == 'uiontype') {
    return buildUionTypes(member.elementType, reference, code, true);
  } else if (member.elementType && member.elementType.reference) {
    const id = buildReferenceMembers(reference, member.elementType);
    return `<td>${buildReferenceLink(id, '[]')}</td>`;
  } else if (member.elementType.elementType) {
    return buildArrayType(member.elementType, htmls, reference, code);
  }
  return `<td><code>${code}</code></td>`;
}

function buildUionTypes(member, reference, code, isArray) {
  const ids = [];
  const suffix = isArray ? '[]' : '';
  member.uionTypes.forEach((itemType) => {
    if (itemType.type == 'function') {
      const id = buildReferenceMembers(reference, itemType);
      ids.push(`<a href="#${normalizeId(itemType.reference)}">${html(id)}${suffix}</a>`);
    } else if (!itemType.reference || itemType.members.length < 1) {
      const name = (itemType.code || '').replace(/^'/, '').replace(/'$/, '');
      ids.push(`<span class="keyword">${html(name)}${suffix}</span>`);
    } else {
      const id = buildReferenceMembers(reference, itemType);
      ids.push(`<a href="#${normalizeId(id)}">${html(id)}${suffix}</a>`);
    }
  });
  return `<td><code>${ids.join(' | ')}</div></code></td>`;
}

function buildReferenceLink(name, suffix) {
  return `<a class="click-link" href="#${normalizeId(name)}"><code class="type-code">${html(name)}${suffix || ''}</code></a>`;
}

function normalizeId(name) {
  return name.toLowerCase().replace('<', '-').replace('>', '');
}

function html(content) {
  const esca = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '\'': '&#39;',
    '"': '&quot;',
    '`': '\\`',
  };
  content = (content || '').toString().replace(/[&<>'"`]/g, (value) => esca[value]);
  return `{{\`${content.replace(/\n/g, '\\n')}\`}}`;
}

module.exports = async function findComponentProps(site, item) {
  const repo = site.repo;
  let componentPath = null;
  if (typeof repo.findComponent == 'function') {
    const file = repo.findComponent(item.name, item.filePath);
    componentPath = path.isAbsolute(file) ? file : path.join(site.sourceRoot, file);
  } else if (repo.findComponent) {
    const key = item.name.replace(/\\/g, '/');
    componentPath = repo.findComponent[key] || defaultFindComponentPath(item.name, item.filePath);
  } else {
    componentPath = defaultFindComponentPath(item.name, item.filePath);
  }
  if (!componentPath || !fs.existsSync(componentPath)) return '';
  const parser = new JavascriptParser();
  const metadata = await parser.parseComponentProps(componentPath);
  const type = metadata.propType;
  item.reasons = metadata.reasons;
  return createMemberTable(type, '属性', {}, true);
};

module.exports.createMemberTable = createMemberTable;