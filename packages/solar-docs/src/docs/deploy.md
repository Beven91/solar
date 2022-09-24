# 文档部署

## 注册应用 :pen:

- 打开`solar-docs`应用代码,修改`repositories.js`

```js
  {
    // 您的二方库git地址
    url: 'git@xx.com/xx.git',
    // 对应的分支
    branch: 'develop',
  }
```

## 添加首页入口

如果您希望在首页透出您的应用文档，则可以按照如下修改：

打开`src/.vuepress/store/index.js`注册应用入口

```js
{
  // 应用名称
  name: 'aut-config-plugin',
  // 应用图标
  logo: apiLogo,
  // 应用描述
  description: '帮助你快速切换本地调试环境的webpack插件。',
  // 应用标签
  tags: ['webpack']
},
```

添加后在文档首页会按照如下展示

<img src="/solar-docs/demo-app-home.jpg" />

