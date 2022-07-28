# AbstractForm

一个动态表单组件，可通过配置来生成表单界面。（主要用于配合`AbstractObject`组件使用)

### 代码演示

<AppCodebox 
  console="true"
  src="src/abstract-form/demo/index.basic" 
  title="基本用法" 
  desc="通过配置，来生成一个带校验的表单界面" 
/>

<AppCodebox 
  src="src/abstract-form/demo/index.group" 
  title="表单分组" 
  desc="通过配置group，来生成一个分组表单" 
/>

<AppCodebox 
  src="src/abstract-form/demo/index.readonly" 
  title="只读表单" 
  desc="通过配置isReadOnly，来生成一个只读表单" 
/>


```props
```

### AbstractValueConverter

如上面`基本用法`中的截止时间表单，可以配置一个`convert`来进行值转换，该转换功能，我们称之为表单值转换器(AbstractValueConverter)。

#### 如何注册自己的转换器?

```tsx
import { AbstractForm } from 'solar-pc';

AbstractForm.registerConverter('moment',{

  // 将表单控件返回的value值转换成需要的类型 fmt 为配置参数，可以多个
  getValue(value, fmt = 'YYYY-MM-DD') {
    return value ? value.format(fmt) : null;
  },
  // 转换值为表单控件对应的value类型
  setInput(value, fmt = 'YYYY-MM-DD') {
    return value ? moment(value,fmt) : null;
  }

});

```

#### 如何使用convert?

设置表单项的`convert`属性

- 直接定义: convert: ['转换器名称','参数1','参数2'....]

- 函数返回: convert: (model)=> ['转换器名称','参数1','参数2'....]

```tsx
const groups:AbstractGroups = [
  {
    title: '截止时间',
    name: 'validateStartTime',
    convert: () => ['moment','YYYY-MM'],
    render: <DatePicker />,
  },
]
```

### valuePropName

在设置值给表单控件时，默认设置的属性为`value`,在实际使用中有一些组件使用的不是`value`作为值属性名，

例如:`Switch`,`Checkbox`

为了统一处理，`AbstractForm`组件提供了一个`register`函数，可用于设置表单控件的值属性名。

> 例如： AbstractForm 内置了几个组件的值属性名

```tsx
import { AbstractForm } from 'solar-pc';
import { Switch, Checkbox, Radio } from 'antd';

AbstractForm.register(Switch,'checked');
AbstractForm.register(Checkbox,'checked');
AbstractForm.register(Radio,'checked');

```