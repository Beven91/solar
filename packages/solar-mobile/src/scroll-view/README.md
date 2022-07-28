# ScrollView

滚动容器

### 用例

```js
import React from 'react';
import { ScrollView } from 'solar-mobile';

export default class ScrollViewApp extends React.Component {

  render() {
    return (
      <ScrollView>
        <div className="content">
          <p> 浩浩乎凭虚御风 <input type="checkbox" /> </p>
          <p> 飘飘乎 <input type="radio" /> </p>
          <div>输入吧：<input type="text" /></div>
          <div>备注吧：<textarea type="text" /></div>
          <Button type="primary" onClick={this.handleClick}>点我</Button>
        </div>
        <div>
          <div>水平滚动</div>
          <ScrollView direction="horizon" className="horizon">
            <div className="container">
              <div className="inner"></div>
              <div className="inner2"></div>
            </div>
          </ScrollView>
        </div>
        <div className="content blue"></div>
      </ScrollView>
    )
  }
}
```

### 参数

<Highlight lang="language-javascript" :code="$page.componentProps" />
