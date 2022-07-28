
<p align="center">
  $projectName$
</p>
<h1 align="center">$projectName$</h1>

## 简介

一个基于React搭建的通用的移动端脚手架。

## 开发

###### 必要开发环境

- `nodejs` 5.2+

> 项目采用`mono-repo`管理方式，默认使用`yarn`的 `workspaces` 如果您想使用 `npm`
可以参照[`lerna`](https://github.com/lerna/lerna)来管理

- [`$projectName$`](packages/genesis-design) - 业务项目
- [`$configs$`](packages/genesis-mobile) - 项目全局配置
- [`$service$`](packages/genesis-modules) - 服务接口服务

###### 运行项目

```shell
npm start
```

###### 发布构建

```shell
npm run build
```

###### 关于构建

项目使用`webpack`作为构建工具，默认支持功能如下:

- 支持`es6` 与 `es7` 等语法
- 支持热更新
- 支持响应式布局&样式兼容[`autoprefix`](https://github.com/postcss/autoprefixer) 布局默认按照`375`宽度来布局
- 支持代码按需加载
- 支持`数据打点`
- 支持`前端异常上报`
- 默认添加[`ant-design-mobile`](https://github.com/ant-design/ant-design-mobile/)组件库