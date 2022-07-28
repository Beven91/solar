
<p align="center">
  $projectName$
</p>
<h1 align="center">$projectName$</h1>

## 简介

谷歌扩展程序

 - Chrome 扩展[官方文档](http://www.chromeextensions.org/)

 - 翻不了墙可参考 [360浏览器](http://open.chrome.360.cn/extension_dev/extension.html)

## 开发

###### 必要开发环境

- `nodejs` 5.2+

> 项目采用`mono-repo`管理方式，默认使用`yarn`的 `workspaces` 如果您想使用 `npm`
可以参照[`lerna`](https://github.com/lerna/lerna)来管理

- [`$projectName$`](packages/$projectName$) - 业务项目
- [`$projectName$-configs`](packages/$projectName$-configs) - 项目全局配置
- [`$projectName$-services`](packages/$projectName$-services) - 服务接口服务

## 开发

### 本地调试

- 启动项目

```
 npm start
```

- 从Chrome扩展程序加载已解压扩展程序

选择当前项目目录下的`dist` 目录即可

- 开始你的Chrome开发之旅吧。


### 发布

#### 本地发布模式

- 打包扩展程序包

```
npm run build-local
```

- `dist`目录就是扩展程序目录

#### 远程发布

将扩展程序内容作为`web`发布，这样本地只需要添加`扩展程序一次`，后面的内容更新，仅需要发布`web`部分即可

- 打包扩展程序包

> 注意：打包后`dist`下的`index.html`文件引用的js都会是从`webpack.js`中配置的`remotePath`的服务器引用，
> 所以我们还需要将`dist`目录作为`web`程序发布到一台服务器。
> 这样的好处在于，用户仅需要安装扩展一次，我们可以通过发布`web`部分，就能统一更新。

```
npm run build
```
- 将`dist`发布到服务器

- 本地附加`dist`为扩展程序


###### 关于构建

项目使用`webpack`作为构建工具，默认支持功能如下:

- 支持`es6` 与 `es7` 等语法
- 支持热更新
