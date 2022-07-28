# Url

一个用于操作URL的辅助工具，可进行URL的解析于生成。

### 使用

#### parse

将一个url字符串解析程一个`parser`对象。

```js
import { Url } from 'solar'

const parser = Url.parse('https://www.solar.com/detail');

 /**
   * 从URL解析出的: 协议
   * 例如: `https` 或 `http`
   */
  parser.protocol

  /**
   * 从URL解析出的: 端口
   * 例如: `8080`
   */
  parser.port

  /**
   * 从URL解析出的: 域名
   * 例如： `www.solar.com`
   */
  parser.hostname

  /**
   * 从URL解析出的: 路径
   * 例如:`/order/list`
   */
  parser.pathname

  /**
   * 从URL解析出的: 查询参数
   * 例如：`name=solar&age=18`
   */
  parser.search

  /**
   * 从URL解析出的: 哈希码路径
   * 例如：`/say/hello`
   */
  parser.hashPath

  /**
   * 从search解析出的: 参数
   */
  parser.params

  /**
   * 从hash解析出的: 参数
   */
  parser.hashParams

```

#### 编辑URL

可以通过修改`parser`中的字段信息，来达到编辑url的效果。

```js

import { Url } from 'solar'

const parser = Url.parse('http://www.solar.com/detail');

// 修改协议头位https
parser.protol = 'https';

// 结果输出 https://www.solar.com/detail
console.log(parser.url);

// 添加参数
parser.params.id = 10;
// 结果输出 https://www.solar.com/detail?id=10
console.log(parser.url);

// 其他字段，可参考parser种返回的结构

```

#### formatObject 

格式化url参数

```js
import { Url } from 'solar'

const  out = Url.formatObject('https://api.demo/id=${id}&name=${name}',{ id:10,name:'jack' });

// 结果应该输出: https://api.demo/id=10&name=jack
console.log(out);

```
