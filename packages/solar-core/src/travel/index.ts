

function travel(from:any, handler:(v:any)=>any) {
  const travedList = [] as any[];
  function propertyTravel(value: any) {
    if (travedList.indexOf(value) > -1) {
      // 如果对象已遍历过，则直接返回，防止死循环
      return value;
    }
    travedList.push(value);
    if (value instanceof Array) {
      return arrayTypeTravel(value);
    } else if (value instanceof Map) {
      return mapTypeTravel(value);
    } else if (value instanceof Set) {
      return setTypeTravel(value);
    } else if (value && typeof value === 'object') {
      return objectTypeTravel(value);
    } else if (handler) {
      return handler(value);
    }
    return value;
  }

  // [Object] 类型遍历
  function objectTypeTravel(value: any) {
  // 对象：需要遍历每个属性
    Object.keys(value).forEach((key: string) => {
      value[key] = propertyTravel(value[key]);
    });
    return value;
  }

  // 数组类型遍历
  function arrayTypeTravel(array: Array<any>) {
  // 数组需要遍历每一项
    array.forEach((item, index) => {
      array[index] = propertyTravel(item);
    });
    return array;
  }

  // Map结构遍历
  function mapTypeTravel(data: Map<any, any>) {
    data.forEach((value, key) => {
      console.log('value', value, key);
      data.set(key, propertyTravel(value));
    });
    return data;
  }

  // Set结构遍历
  function setTypeTravel(data: Set<any>) {
    const newData = new Set<any>();
    data.forEach((value) => {
      newData.add(propertyTravel(value));
    });
    return newData;
  }

  return propertyTravel(from);
}


export default {
  travel,
};
