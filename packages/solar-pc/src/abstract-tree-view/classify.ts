export default function classify(rows: Array<any>, parentKey: string, idKey: string) {
  let pv;
  let id;
  let linkParent = null as any;
  let cd = null as any;
  let childs = null;
  const links = {} as any;
  const map = {} as any;
  rows.forEach((item, i) => {
    pv = item[parentKey];
    id = item[idKey];
    map[item[idKey]] = item;
    linkParent = links[pv];
    if (linkParent == null) {
      cd = linkParent = links[pv] = { empty: true };
      cd.children = [];
      linkParent[idKey] = pv;
    }
    item.key = item[idKey];
    childs = linkParent.children;
    childs.push(item);
    item.parent = linkParent;
    if (links[id]) {
      item.children = links[id].children;
    } else {
      links[id] = item;
      item.children = [];
    }
  });
  rows.forEach((item) => {
    const parent = item.parent;
    if (parent && 'empty' in parent) {
      const meta = map[parent[idKey]];
      delete parent.empty;
      Object.assign(parent, meta);
    }
  });
  return links;
}
