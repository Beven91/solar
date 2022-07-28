# image

云服务器 图片组件

- [用例](/__tests__/image/index.js)

```js

import React from 'react';
import { Image } from 'ireeder-ui-mobile'

class App extends React.Component{
  render(){
      return (
        <Image src="https://www.xxx.com/a.jpg"/>
        //默认图片 
        <Image src={bg} defUrl={require('./images/a.jpg')}  />
        //云服务器图片对象自动缩放 根据设置的img元素的宽度来进行缩放
        <Image src="T1CqYlB7xv1RCvBVdK" className="bg"  />
        //云服务器指定裁剪宽度与高度
        <Image src="T1CqYlB7xv1RCvBVdK" size="200,50"  />
      )
  }
}
```

### 参数

<Highlight lang="language-javascript" :code="$page.componentProps" />

