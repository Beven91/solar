# AbstractTable

通用表格组件，基于`antd`的Table组件。

### 代码演示

<AppCodebox 
  console="true"
  src="src/abstract-table/demo/index" 
  title="基本用法" 
  desc="配置一个带搜索条件，操作按钮的表格。" 
/>

<AppCodebox 
  console="true"
  src="src/abstract-table/demo/index.button" 
  title="按钮详解" 
  desc="按钮支持，行内，顶部，单选，多选等功能。" 
/>

<AppCodebox 
  console="true"
  src="src/abstract-table/demo/index.columns" 
  title="列配置详解" 
  desc="列支持，格式化，外键，枚举以及默认等展示风格，当然也可以通过render函数进行完全自定义。" 
/>

<AppCodebox 
  console="true"
  src="src/abstract-table/demo/index.filter" 
  title="分组过滤" 
  desc="通过配置filters属性，可以为表格组件配置一个分组tab,切换不同分组可以进行不同查询。" 
/>

<AppCodebox 
  console="true"
  src="src/abstract-table/demo/index.sort" 
  title="列排序" 
  desc="通过设置column.sort来设置该列进行排序" 
/>

<AppCodebox 
  console="true"
  src="src/abstract-table/demo/index.select" 
  title="选择表格" 
  desc="通过设置select属性，可以让表格进入选择模式，选择后会触发onSelectRows事件,实际业务场景推荐使用AbstractTablePicker" 
/>