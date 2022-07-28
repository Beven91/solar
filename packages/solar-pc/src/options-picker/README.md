# OptionsPicker

字典选项选择器。


### 初始化

在使用组件前需要完成全局配置：即指定如何根据`key`获取对应的字典数据

您可以在您的应用入口通过`AbstractProvider`指定`fetchOption`配置

```tsx
import React from 'react';
import { AbstractProvider, AbstractConfig } from 'solar-pc';
import { Network } from 'solar-core';

const network = new Network();

const config: AbstractConfig = {
  fetchOption(key, query) {
    return network.get<any>('https://xx.com/api/dictionary/' + key, query).json();
  }
}

export default function App() {

  return (
    <AbstractProvider
      value={config}
    >

    </AbstractProvider>
  )
}
```

### 代码演示

<AppCodebox 
  src="src/options-picker/demo/index.basic" 
  title="基本用法" 
  desc="通过配置optionsKey来加载对应的字典数据" 
/>