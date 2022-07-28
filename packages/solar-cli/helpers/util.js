const path = require('path');
const fs = require('fs');

module.exports = {
  /**
   * 驼峰命名
   * @param {*} name 需要转换成驼峰的字符串
   * 例如 activity_main 或者 activity/main 将被转换成 activityMain
   */
  toCamel(name) {
    name = name.replace(/_/g, '/');
    const paths = name.split('/');
    let newName = '';
    let segments = [];
    paths.forEach((p) => {
      segments = segments.concat(p.split('-'));
    });
    segments.forEach((segment) => {
      newName += segment[0].toUpperCase() + (segment.substr(1)||'');
    });
    return newName;
  },
  /**
   * 定制版过滤一组数据
   * @param {*} items 待过滤的数组 例如: [{ name:'xx', value:'xx'}]
   * @param {*} filter 过滤值
   * @param {String} prpoerty 属性名 默认为 name
   */
  getFilterResult(items, filter, prpoerty = 'name') {
    return (items || []).filter((element) => !filter || (`${element[prpoerty]}`).indexOf(filter) > -1);
  },
  /**
   * 根据传入的reg来进行分组，将符合reg的数组项靠前
   * @param {*} items items 待过滤的数组 例如: [{ name:'xx', value:'xx'}]
   * @param {*} reg 匹配正则
   * @param {String} prpoerty 属性名 默认为 name
   */
  getNearlyList(items, reg, prpoerty = 'name') {
    return (items || [])
      .filter((element) => reg.test(element[prpoerty]))
      .concat(
        items.filter((element) => !reg.test(element[prpoerty])),
      );
  },

  /**
   * 获取当前环境的package.json
   */
  getMainPackage() {
    const v = path.resolve('package.json');
    if (!fs.existsSync(v)) {
      return {};
    }
    return require(v);
  },
};
