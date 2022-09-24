# 快速上手

## 安装

```shell
$ npm install solar-docs --global --registry=https://packages.aliyun.com/5faa3678e6f9d07f148517ac/npm/npm-registry/
$ or
$ npm install solar-docs --location=global --registry=https://packages.aliyun.com/5faa3678e6f9d07f148517ac/npm/npm-registry/
```

## 调试

在您的项目根目录下，执行以下命令，会以默认的规则去启动文档调试服务。

```shell
$ solar-docs
```

如果您需要定制文档类型，那么请阅读下[文档配置](/solar-docs/config/)

## 说明

当前系统基于`vuepress`搭建而成，大部分文档内容书写请参考[vuepress](https://www.vuepress.cn/guide/markdown.html)