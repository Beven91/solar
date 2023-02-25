# AdvanceUpload

通用文件上传组件,可进行公有云与私有云文件上传。

### 初始化

在使用组件前，您可以通过`solar-core`来全局配置默认的文件上传。

```ts
import { Config } from 'solar-core';

Config.setup({
  fileGateway: {
    // 该参数可以用来全局指定调用上传接口时的额外参数
    data: { bizId: 'doctorSubmit' },
    // 文件上传地址
    uploadUrl: 'http://www.oss.cn/upload',
    urls: {
      // 私有云访问地址
      private: 'http://www.oss.cn/private',
      // 共有云访问地址
      public: 'http://www.oss.cn/public'
    }
  }
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

<AppCodebox 
  src="src/advance-upload/demo/index.multiple" 
  title="批量上传" 
  console="true"
  desc="通过设置multiple可以同时选择多张图片上传" 
/>

<AppCodebox 
  console="true"
  src="src/advance-upload/demo/index.select" 
  title="手动上传" 
  desc="通过设置selectOnly来提供选择文件模式，然后进行自定义上传" 
/>

<AppCodebox 
  src="src/advance-upload/demo/index.file" 
  title="支持docx、pptx、xlsx、pdf、文本、图片、视频(mp4)等文件" 
  desc="通过accept指定文件类型" 
/>