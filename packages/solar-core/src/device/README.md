# Device

平台判定工具

#### 基本操作

```js
import { Device } from 'solar-core';

// 获取已知的平台名称 例如:android ios windows
Device.platform


// 获取已知的宿主应用名 例如： mircoMessager
Device.app 

```

#### applyEnv

添加一个平台或者应用识别

```js
import { Device } from 'solar-core';

// 添加一个平台识别
Device.applyEnv('windows',/win32/,true);
// 以上代码添加后，假设ua包含 win32下 Device.platform 为 'windows'


// 添加一个 应用识别
Device.applyEnv('qq',/QQ/);
// 以上代码添加后，假设在 ua中包含了QQ 则Device.app 为 'qq'

```

#### applyClass

在`document.documentElement`下，添加平台样式与应用样式

添加后，假设在android 下的微信中

```html
<html class="is-platform-android is-mircoMessager">
...
</html>
```