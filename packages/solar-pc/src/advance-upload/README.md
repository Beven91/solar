# AdvanceUpload

通用文件上传组件,可进行公有云与私有云文件上传。

### 初始化

在使用组件前，您可以通过`solar-core`来全局配置默认的文件上传。

```ts
import { Config } from 'solar-core';

Config.setup({
  oss: {
    directory: 'demo',
    aliOssConfig: (category: string): Promise<AliOssConfig> => {
      return Promise.resolve({
      });
    },
  },
});
```

### 代码演示

<AppCodebox 
  console="true"
  src="src/advance-upload/demo/index.basic" 
  title="默认上传" 
  desc="默认上传文件，采用共有云上传。" 
/>

<AppCodebox 
  console="true"
  src="src/advance-upload/demo/index.object" 
  title="图片上传之object" 
  desc="如果在上传图片时，您希望获取到该图片的宽度与高度，则可以指定valueMode为`object`" 
/>

<AppCodebox 
  console="true"
  src="src/advance-upload/demo/index.array" 
  title="图片列表上传" 
  desc="您可以设置maxCount来设置多张图片上传" 
/>