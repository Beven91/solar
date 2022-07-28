# InputFactory

表单工厂组件，可以用于动态创建不同的表单组件。


<AppCodebox 
  src="src/input-factory/demo/index" 
  title="基本用法" 
  desc="通过InputFactory.create来创建一个组件" 
/>


#### 内置了哪些组件?

- input (Input)
- iconfont (IconPicker.Input)
- textarea (Input.TextArea)
- number  (InputNumber)
- switch  (Switch)
- checkbox  (Checkbox.Group)
- radio   (Radio.Group)
- slider  (Slider)
- date  (DatePicker)
- time  (TimePicker)
- options (OptionsPicker)
- upload  (AdvanceUpload)

#### 如何添加自己的组件?

```tsx
import { InputFactory } from 'solar-pc'

InputFactory.register([
   {
    name: 'input',
    component: Input,
    options: [
      { title: '最大长度', name: 'maxLength', render: <InputNumber /> },
    ],
  },
])

```

#### 如何获取注册的组件信息?

```tsx
import { InputFactory } from 'solar-pc'

const meta = InputFactory.getRegistration('input');
```