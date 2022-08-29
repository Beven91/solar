# mini-css-extract-hot-plugin

主要用来关闭掉`mini-css-extract-plugin`部分的`hmrc`,在5.5.0版本，热更时，总是全局刷css,体验太差，

所以使用当前来重置掉内容部的`hmrc`，从而让其使用`updateCss`。

> 在production模式下，当前组件会自动禁用。

### 安装

```shell
npm install mini-css-extract-hot-plugin
```

### 使用

```js
const MiniCssExtractHotPlugin = require('mini-css-extract-hot-plugin');

module.exports = {
  plugins:[
    new MiniCssExtractHotPlugin()
  ]
}
```