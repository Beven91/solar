# Rectangle

图片获取原始尺寸信息的工具

#### getRectangle

获取指定图片的原始尺寸信息

```js
import { Rectangle } from 'solar-core';

const file = '选择的文件' //

Rectangle.getRectangle(file).then((rect)=>{
  console.log('width',rect.width);
  console.log('height',rect.height);
})

```

#### getRectangles

批量获取一批图片文件的原始尺寸信息

```js
import { Rectangle } from 'solar-core';

const files = ['选择的文件'] //

Rectangle.getRectangles(files).then((rects)=>{
  rects.forEach((rect)=>{
    console.log('width',rect.width);
    console.log('height',rect.height);
  })
})
```

#### readAsDataUri

读取指定文件为DataURL

```js
import { Rectangle } from 'solar-core';

const file = '选择的文件' //

Rectangle.readAsDataUri(file).then((dataUri)=>{
  rects.forEach((rect)=>{
    console.log('dataUri',dataUri);
  })
})
```