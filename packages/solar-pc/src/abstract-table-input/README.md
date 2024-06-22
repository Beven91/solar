# AbstractTableInput

一个带编辑列的表格输入控件。

### 代码演示

<AppCodebox 
  src="src/abstract-table-input/demo/index.basic" 
  title="默认用例" 
  desc="" 
  console="true"
/>

<AppCodebox 
  console="true"
  src="src/abstract-table-input/demo/index" 
  title="多行编辑" 
  desc="可快速通过配置实现一个可录入的表格。" 
/>

<AppCodebox 
  console="true"
  src="src/abstract-table-input/demo/index.buttons" 
  title="操作按钮" 
  desc="和AbstractTable一样，可以配置每行的操作按钮,另外可通过removeVisible来控制默认的移除按钮是否可见" 
/>

<AppCodebox 
  console="true"
  src="src/abstract-table-input/demo/index.row" 
  title="单行编辑" 
  desc="通过设置mode=row 来进入单行编辑模式。" 
/>

<AppCodebox 
  src="src/abstract-table-input/demo/index.move" 
  title="移动行" 
  console="true"
  desc="通过配置moveable属性，开启行位置调整功能" 
/>

<AppCodebox 
  src="src/abstract-table-input/demo/index.large" 
  title="大量数据测试" 
  desc="当数据量比较大的情况下，可以通过开启分页来解决性能问题。" 
/>

<AppCodebox 
  src="src/abstract-table-input/demo/index.form" 
  title="位于form下" 
  console="true"
  desc="测试在form下更新，是否会导致输入框失去焦点" 
/>

<AppCodebox 
  src="src/abstract-table-input/demo/index.shallow" 
  title="位于form下" 
  console="true"
  desc="测试onChange后生成新的数据，是否会对编辑行输入框产生失焦" 
/>

