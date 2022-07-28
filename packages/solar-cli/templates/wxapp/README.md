
<p align="center">
  $projectName$
</p>
<h1 align="center">$projectName$</h1>

## 简介

当前项目使用 [`solar`]生成

##### 默认支持哪些特性?

- 支持`es6` 与 `es7` 等语法。
- 默认自带了公司微信授权功能，您仅需要配置对应的小程序`appid`即可,(修改`project.config.json`)。
- 默认接入配置项`WEB-INF`本地编译
- 默认接入 `solar-core` 的网络接口工具。
- 默认根据设计稿750宽度来布局，打包样式转换比例 `1px`=`1rpx`。
- 支持小程序页面母版页 参见:`app.wxml` 提供此特性的插件`wxml-layout-loader`

## 开发

###### 必要开发环境

- `nodejs` 5.2+

> 项目采用`mono-repo`管理方式，默认使用`yarn`的 `workspaces` 如果您想使用 `npm`
可以参照[`lerna`](https://github.com/lerna/lerna)来管理

- [`wxapp`](packages/genesis-design) - 小程序业务模块
- [`wxapp-configs`](packages/genesis-mobile) - 项目全局配置
- [`wxapp-provider`](packages/genesis-mobile) - 数据提供模块（默认自带了用户登录态信息模块`profile`)
- [`wxapp-services`](packages/genesis-modules) - 服务接口服务

###### 运行项目

```shell
npm start
```

###### 发布构建

```shell
npm run build
```

然后点击微信开发者工具上传即可.