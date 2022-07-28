# XlsxPicker

一个`xlsx`文件选择控件，可用于解析选择`xlsx`为数据。

### 代码演示

<AppCodebox 
  src="src/xlsx-picker/demo/index" 
  title="基本用法" 
  desc="选择xlsx文件" 
/>

<AppCodebox 
  src="src/xlsx-picker/demo/index.mapping" 
  title="高级映射" 
  desc="可以通过制定mappings来进行细节定制。" 
/>

```props
```

### CellMapping

| 属性 | 说明 | 类型| 默认值 |
| ---- | ---- | ---- | ---- |
| name | 属性名字 | string | - |
| format | 用于格式化该属性的值格式化 | `(value:string)=>any` | - |



