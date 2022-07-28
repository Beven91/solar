
function parseUrl(url: string) {
  url = url || '';
  const index = url.indexOf('://');
  const protocol = index > -1 ? url.slice(0, index) : '';
  const pathQuery = index > -1 ? url.slice(index, url.length) : url;
  const queryIndex = pathQuery.indexOf('?');
  const method = (queryIndex > -1 ? pathQuery.slice(0, queryIndex) : pathQuery).replace(/^:\/\//, '');
  const query = queryIndex > -1 ? pathQuery.slice(queryIndex + 1) : '';
  const params = getQueryParams(query);
  return {
    protocol,
    method,
    params,
  };
}

// json解析
function tryJson(data: string) {
  if (data.trim() === '') {
    return data;
  }
  try {
    return JSON.parse(decodeURIComponent(data));
  } catch (ex) {
    return data;
  }
}

function attachObj(obj: any, key: string, v?: any) {
  if (/\[\d+\]/.test(key)) {
    // 数组
    const parts = key.split('[');
    obj = obj[parts[0]] = [];
    return obj[parts[1].replace(']', '')] = v || {};
  }
  if (v === '') {
    return obj[key] = v;
  }
  // 对象
  return obj[key] = v || obj[key] || {};
}


function getQueryParams(search: string) {
  const items = search.split('&');
  const query = {};
  items.forEach((item) => {
    if (item) {
      const [keys, value] = item.split(/=/);
      const levels = keys.split('.');
      const key = levels.pop();
      const data = levels.reduce((obj: any, key: string) => attachObj(obj, key), query);
      attachObj(data, key, tryJson(value));
    }
  });
  return query;
}

export default {
  parseUrl,
};
