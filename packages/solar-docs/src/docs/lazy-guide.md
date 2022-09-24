# 懒人教程

文档系统内置了一些配置，可以让您快速配置一些风格文档类型。

目前风格如下:

- 移动端UI库风格

- PC端UI库风格

- 常规文档风格

### 我的项目没有为组件书写`.md`可以使用当前系统吗?

可以使用，您可以修改文档配置`patterns`,根据源代码文件来生成文档

例如: package.json

```json
{
  "docs":{
    "patterns":["src/**/*.tsx"]
  }
}

```

### 根据调试文件来生成文档

如果您的二方库有demo代码，则您可以根据demo文件来生成一个附带演示的文档,例如: [@midway/ui](/solar-docs/@midway/ui)。

例如: package.json

```json
{
  "docs":{
    "type":"demo",
    "patterns":["demo/*.tsx"],
    "findComponent":{
      "demo/Button.tsx":"src/Button.tsx"
    },
    "demoBase":"https://h5.dev.shantaijk.cn/midway/#",
    "demoUrl":{
      "demo/Button.tsx":"demo/button"
    }
  }
}
```