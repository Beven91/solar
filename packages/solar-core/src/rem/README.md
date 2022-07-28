# Rem

一个用于进行rem与px相互转换的工具

#### 基础用法

```js
import { Rem } from 'solar-core';

// 设置font-size 推荐全局初始化
Rem.initRem(17.5);

// 将px转换成rem
Rem.getRem(175); // 返回  '10rem'

// 将rem转换成px
Rem.getPixel('10rem'); // 返回 175

```

#### getRems

将一个对象中所有值为数值类型的属性转换成rem单位

```js
import { Rem } from 'solar-core';

// 设置font-size 推荐全局初始化
Rem.initRem(37.5);

const style = {
  width: '1rem',
  height: 375,
  left: '375',
  top: undefined as any,
  borderWidth: '375px',
};

const out = Rem.getRems(style);

// 输出结果如下
out = {
  // 本来为 rem 所以位置原始值
  width: '1rem',
  // 375 ---> 10rem
  height: '10rem',
  // '375' ---> '10rem'
  left: '10rem',
  // undefined --> undefined
  top: undefined as any,
  // 375px ---> 10rem
  borderWidth: '10rem',
};
```

#### getPixelsWithsUnit

将一个对象中的所有`rem` 以及`px`转换成像素数值 

```js
import { Rem } from 'solar-core';

// 设置font-size 推荐全局初始化
Rem.initRem(37.5);

const style = {
  width: '1rem',
  height: 10,
  left: '10',
  top: 'ssss',
  n: null as any,
  borderWidth: '10px',
};

const out = Rem.getPixelsWithsUnit(style);

// 输出结果为：
const out = {
  // 1rem ---> 37.5
  width: 37.5,
  // 10 --> 10
  height: 10,
  // '10' --> 10
  left: 10,
  top: NaN,
  n: 0,
  // 10px ---> 10
  borderWidth: 10,
};
```