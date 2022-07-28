# Cookie

`cookie`操作工具。

#### 基础操作

```js

import { Cookie } from 'solar-core';

// 默认解析的为document.cookie

Cookie.cookies._aid;

```

#### 设置cookie

```js
import { Cookie } from 'solar-core';

// 添加一个 _aid_
Cookie.setCookie('_aid',10,new Date());

// 添加一个 _aid path=/
Cookie.setCookie('_aid',10,new Date(),'/');

// 添加一个 _aid path=/ domain=www.api.com

Cookie.setCookie('_aid',10,new Date(),'/','www.api.com');

// 添加一个httpOnly
Cookie.setCookie('_aid',10,new Date(),'/','www.api.com',true);

```