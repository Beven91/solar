# AbstractObject

一个通用的对象编辑页组件。

### 代码演示

<AppCodebox 
  console="true"
  src="src/abstract-object/demo/index" 
  title="基本用法" 
  desc="配置一个带确认和返回的表单提交页" 
/>

<AppCodebox 
  console="true"
  src="src/abstract-object/demo/index.modal" 
  title="弹窗模式" 
  desc="通过设置type来设置编辑页的UI风格。" 
/>

<AppCodebox 
  src="src/abstract-object/demo/index.readonly" 
  title="只读表单页" 
  desc="通过isReadOnly属性来设置当前页面为只读，只读模式无控件外观,且无提交按钮。" 
/>

<AppCodebox 
  src="src/abstract-object/demo/index.footer" 
  title="追加操作按钮" 
  desc="通过footActions属性来设置当前页面额外的操作按钮。" 
/>

<AppCodebox 
  console="true"
  src="src/abstract-object/demo/index.ok.enable" 
  title="确认按钮disabled控制" 
  desc="可以通过okEnable来控制提交按钮的禁用状态。" 
/>