# 文档开发

如果您希望进行文档定制，则可以通过文档配置来处理，配置的方式分为两种。

### 方法一：在package.json中配置

```json
{
  "docs":{
    // 是否本地调试 默认为: false
    "devServer":false,
    // 文档类型: demo 或者 不填写则为默认
    "type": "",
    // 自定义检索文档文件，默认为: ['**/*.md', '**/*.vue']
    "patterns":["src/**/*.md"],
    // 平台类型： mobile 或者 pc
    "platform":"mobile",
    // 源码映射表,不填写，会根据默认规则查找源代码文件,参考：零配置
    "findComponent":{
      "src/Button/README.md":"src/Button/Button.tsx"
    },
    // 在devServer 模式下，自定义查找运行用例文件模式，该内容可用于AppCodebox组件
    "runnerPatterns": ["__tests__/**/*.tsx","__tests__/**/*.ts"],
    // 如果需要自定义runner的运行流程，可以自定义一个index文件，来实现运行 默认可不填写
    "runnerIndex":"__tests__/index",
    // 当指定了demoUrl情况下，可以通过demoBase来制定基础url
    "demoBase":"https://h5.shantaijk.cn/#",
    // 当文档类型为demo时，可以指定具体文件对应的演示demo地址
    "demoUrl":{
      "src/Button/README.md":"/demo/button"
    }
  }
}
```

### 方法二： 通过`.vuepress/repository.js`来配置

您还可以在项目.vuepress/目录下新建一个`repository.js`来配置

```js
module.exports = {
  // 是否本地调试 默认为: false
  "devServer":false,
  // 文档类型: demo 或者 不填写则为默认
  "type": "",
  // 自定义检索文档文件，默认为: ['**/*.md', '**/*.vue']
  "patterns": ["src/**/*.md"],
  // 在devServer 模式下，自定义查找运行用例文件模式，该内容可用于AppCodebox组件
  "runnerPatterns": ["__tests__/**/*.tsx","__tests__/**/*.ts"],
  // 如果需要自定义runner的运行流程，可以自定义一个index文件，来实现运行 默认可不填写
  "runnerIndex":"__tests__/index",
  // 平台类型： mobile 或者 pc
  "platform": "mobile",
  // 源码映射表,不填写，会根据默认规则查找源代码文件,参考：零配置
  // 如果在js文件中定义，则可以指定为一个函数
  "findComponent": (name,fullPath)=>{
    return "/Button.tsx";
  },
  // 当指定了demoUrl情况下，可以通过demoBase来制定基础url
  "demoBase": "https://h5.shantaijk.cn/#",
  // 当文档类型为demo时，可以指定具体文件对应的演示demo地址
  "demoUrl":(name,fullPath)=> {
    return "/demo/button"
  }
}
```

### monorepo项目配置

针对`monorepo`的项目，您可以将配置放到每个具体项目的`package.json`中，当然也可以统一配置在`monorepo`项目根目录的`package.json`中。

```json
{
  "workspaces":{
    "demo2":{

    },
    "demo":{
      // 自定义检索文档文件，默认为: ['**/*.md', '**/*.vue']
      "patterns":["src/**/*.md"],
      // 平台类型： mobile 或者 pc
      //....其他配置
    }
  }
}
```

