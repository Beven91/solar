const Swagger = require('../service/swagger/swagger');

const popupActions = ['add', 'update'];

/**
 * 获取当前service所有的actions
 */
function generateRedux(answer, api, namespace) {
  const { controller, optionalActionKeys } = answer;
  const serviceName = Swagger.getServiceName(controller);
  const actionKeys = getActionKeys(api, controller, optionalActionKeys);
  const methods = controller.methods || {};
  const actionReducers = actionKeys.map((item, index) => {
    const { name, method } = item;
    const m = methods[name];
    return {
      name,
      method: m,
      action: generateReduxAction(name, m, index, serviceName),
      reducer: generateReduxReducer(method, m, index, item, serviceName, namespace),
      submit: generateListSubmit(method, m, item),
      viewsCase: generateViewsCase(item),
    };
  });
  const char = actionReducers.length > 0 ? ',' : '';
  return {
    actions: actionReducers.map((m) => m.action).join('\n'),
    reducers: actionReducers.map((m) => m.reducer).join(',\n  ') + char,
    actionExports: actionReducers.map((m) => m.name).join(',\n  ') + char,
    submit: actionReducers.filter((m) => m.submit).map((m) => m.submit).join('\n  '),
    viewsCase: actionReducers.filter((m) => m.viewsCase).map((m) => m.viewsCase).join('\n  '),
  };
}

/**
 * 获取需要生成redux的actionKeys
 */
function getActionKeys(api, controller, optionalActionKeys) {
  const normalActionKeys = getNoCurdActionKeys(api, controller, optionalActionKeys);
  const actionKeys = getCrudActionKeys(api, controller).concat(normalActionKeys);
  const mapKeys = {};
  return actionKeys.filter((item) => {
    const key = item.name;
    const v = !mapKeys[key];
    mapKeys[key] = true;
    return v;
  });
}

/**
 * 获取需要生成redux的非curd操作actionKeys
 */
function getNoCurdActionKeys(api, controller, optionalActionKeys) {
  const { crudKeys } = api;
  const methods = controller.methods || {};
  const apiKeys = Object.keys(methods);
  return apiKeys
    .filter((m) => (!/mock$/.test(m)) && crudKeys.indexOf(m) < 0)
    .filter((m) => optionalActionKeys.indexOf(m) > -1)
    .map((k) => ({
      name: k,
      method: `${k}`,
      meta: methods[k],
    }));
}

/**
 * 获取crudKeys对应的actionKeys
 */
function getCrudActionKeys(api, controller) {
  const orderActionKeys = ['addRecordAsync', 'updateRecordAsync', 'removeRecordAsync'];
  const orderCrudKeys = [api.add, api.update, api.remove];
  const orderMessages = ['新增成功', '修改成功', '删除成功'];
  const orderTypes = ['add', 'update', 'remove'];
  const methods = controller.methods || {};
  return orderCrudKeys.map((k, index) => {
    if (k !== 'beimplement') {
      return {
        name: k,
        meta: methods[k],
        method: orderActionKeys[index],
        message: orderMessages[index],
        type: orderTypes[index],
      };
    }
    return null;
  }).filter((v) => !!v);
}

/**
 *  根据当前service生成redux.reducer
 */
function generateReduxReducer(name, method, index, item, serviceName, namespace) {
  const space = index > 0 ? '  ' : '';
  switch (item.type) {
    default:
      return generateCommonReducer(space, name, method, item, serviceName, namespace);
  }
}

/**
 * 生成通用reducer
 */
function generateCommonReducer(space, name, method, item, serviceName, namespace) {
  const desc = method.description || method.summary;
  const message = item.message || desc + '成功';
  return `${space}// ${desc}
    async ${name}(this: ModelThis, data: RecordModel, tree: any) {
      // const state = tree.${namespace} as ModelState;
      await ${serviceName}.${method.name}(data).showLoading();
      this.leaveAction({ message: '${message}', reload: true });
    }`;
}

/**
 * 根据当前service生成redux.action
 */
function generateReduxAction(name, method, index, serviceName) {
  const parameterInfo = method.parameterInfo || { signParameter: 'model' };
  const parameters = (parameterInfo.signParameter || '').split(',');
  let signParameters = parameters.map((p) => `data.${p}`).join(', ');
  if (!parameterInfo.isOnlyOne) {
    signParameters = 'data.model';
  }
  const space = index > 0 ? '' : '\n';
  return `${space}// ${method.description || method.summary}
export function ${name}(data, state) {
  return ${serviceName}.${name}(${signParameters}).showLoading();
}\n`;
}

/**
 * 根据当前service生成对应的submit
 */
function generateListSubmit(name, context, item) {
  if (popupActions.indexOf(item.type) < 0) {
    return '';
  }
  return `case '${item.type}':
        return this.${name}(data.model);`;
}

/**
 * 生成 partial/index.js 的viewcase
 */
function generateViewsCase(item) {
  if (popupActions.indexOf(item.type) < 0) {
    return '';
  }
  return `<AbstractActions.Object title="${item.message}"  action="${item.type}" use={Record} />`;
}


module.exports = generateRedux;
