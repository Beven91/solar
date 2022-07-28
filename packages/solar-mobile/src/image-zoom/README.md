# image-zoom

图片预览缩放组件（点击容器中的图片，可弹出浮层，可以对图片进行打开查看)

- [用例](/__tests__/image-zoom/index.js)

```js
import React from 'react';
import { ImageZoom } from 'ireeder-ui-mobile';

export default class App extends React.Component {
  render() {
    return (
      <div style={styles.container}>
        <ImageZoom>
          <div>一下图片点击可放大哦</div>
          <img style={styles.img} 
              src="https://static.solar.cn/T16lVbB4J41RCvBVdK.jpg?img=/rs,w_100" 
              data-zoom="https://static.solar.cn/T16lVbB4J41RCvBVdK.jpg" 
          />
          <img style={styles.img} src="https://static.solar.cn/T16lVbB4J41RCvBVdK.jpg?img=/rs,w_100" />
           <img style={styles.img} src="https://static.solar.cn/T16lVbB4J41RCvBVdK.jpg?img=/rs,w_100" />
            <img style={styles.img} src="https://static.solar.cn/T16lVbB4J41RCvBVdK.jpg?img=/rs,w_100" />
        </ImageZoom>
      </div>
    )
  }
}
```

### 参数

<Highlight lang="language-javascript" :code="$page.componentProps" />
