# 生成原理

启动文档开发调试服务后，开发服务会按照如下步骤去构建您项目的文档。

主要的步骤如下:

### 一、搜索文档页面

默认会搜索当前项目下所有`.md`文件，并且会作为一个页面来渲染。

> 例如: demo项目

```txt
demo
  -- src/Button/README.md
  -- src/Picker/README.md
  -- src/link-button/README.md
```

搜索后会生成如下页面

```js
[
  { path:"src/Button/README.md" },
  { path:"src/Picker/README.md" },
  { path:"src/link-button/README.md" },
]
```

在搜索过程中会判断当前项目是否为`monorepo`的项目风格，根据`workspaces`与`lerna.json`来判定，
如果项目为`monorepo`则会按照`monorepo`的配置为每个项目生成独立的文档。


### 二、构建侧边栏

系统会根据搜索到的页面文件来构建一个侧边栏菜单。

例如项目结构如下

```txt
demo
  -- src/Button/README.md
  -- src/Picker/README.md
  -- src/link-button/README.md
```

那么会生成如下siderbar

```js
{
  "/demo/":[
    { title:"Button",path:"/demo/Button/" },
    { title:"Picker",path:"/demo/Picker/" },
    // 如果文件名是 使用 "-" 链接，则会按照大驼峰来命名
    { title:"Picker",path:"/demo/LinkButton/" },
  ]
}

```

### 三、渲染页面内容

在渲染找到的具体页面内容时，会根据当前页面的文件路径，去查找对应的源文件。

例如:

```txt
demo
  -- src/Button/README.md
  -- src/Picker/README.md
  -- src/link-button/README.md
```

根据后缀名依次查找 `.tsx`,`.ts`,`.js`,`.vue`,

```txt
demo
  -- src/Button/index.tsx
  -- src/Picker/index.tsx
  -- src/link-button/index.tsx
```

如果查找到源文件，则会读取该文件源码，根据代码内容来自动追加内容

- 如果是`react`组件，则会通过`AST`解析出组件的属性类型与注释，来生成一个属性表，拼接在文件末尾。

- 其他特征，待开发...

### 四、生成项目全局配置

系统会根据项目的`package.json`文件来生成项目文档的全局信息，例如：`标题`，`版本`等

### 五、构建vendor

如果您的文档类型配置为`demo` 则会自动根据`demo`文件源码，生成一份`vendor.js`,该js用于`AppCodebox`组件引用。
