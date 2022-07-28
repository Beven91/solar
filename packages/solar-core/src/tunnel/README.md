# Tunnel

一个消息订阅与发布的工具

### 使用

#### 全局容器

```js

import { Tunnel } from 'solar-core';

// 订阅 custom-message 消息
Tunnel.pull('custom-message',(data) => {
  console.log('receieve',data);
})

// 发布一条 custom-message
Tunnel.push('custom-message','hello');

```

#### 新建容器

可以通过`Tunnel.create`创建一个独立的消息容器，这样可以和全局容器区分开来

```js

import { Tunnel } from 'solar-core';

const tunnel = Tunnel.create();

// 订阅 custom-message 消息
tunnel.pull('custom-message',(data) => {
  console.log('receieve',data);
})

// 发布一条 custom-message
tunnel.push('custom-message','hello');

```

#### 解除订阅

```js
import { Tunnel } from 'solar-core';

const tunnel = Tunnel.create();

// 订阅 custom-message 消息
const off = tunnel.pull('custom-message',(data) => {
  console.log('receieve',data);
})

// 可通过返回的off函数解除订阅
off();

// 也可以通过Tunnel.off函数来解除

// 解除所有custom-message 所有订阅
Tunnel.off('custom-message');

// 解除指定订阅
Tunnel.off('custom-message',fn);

```

#### 覆盖式订阅

可以通过`Tunnel.pull`的第三个参数来，控制在订阅当前类型消息时，先移除之前的订阅。

```js

import { Tunnel } from 'solar-core';

Tunnel.pull('custom-message',()=>{  });

// 执行此代码，会移除掉上面一行的订阅
Tunnel.pull('custom-message',()=>{ },true);


```