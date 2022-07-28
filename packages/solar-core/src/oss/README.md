# Oss

阿里云OSS 辅助工具

#### resizeAliOss

在oss图片地址上，添加裁剪样式

```js
import { Oss } from 'solar-core'

const url = 'http://ali-oss.shanghai.com/a.png';

// 设定宽度裁剪
const out = Oss.resizeAliOss(url,100);

// 返回 out为： http://ali-oss.shanghai.com/a.png?x-oss-process=image/resize,w_100

```

#### renderAliOss

在oss图片链接上添加样式

```js
import { Oss } from 'solar-core'

const url = 'http://ali-oss.shanghai.com/a.png';

const out = Oss.renderAliOss(url,'image/resize,w_100');

// 返回 out为： http://ali-oss.shanghai.com/a.png?x-oss-process=image/resize,w_100

```

#### uploadToAliOss

上传图片到阿里OSS,支持：`小程序端`，与 `web端`