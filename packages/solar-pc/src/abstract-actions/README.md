# AbstractActions

动作容器集组件，用于实现经典后台`列表页`+`详情页`的复合组件。

### 代码演示

<AppCodebox 
  src="src/abstract-actions/demo/index" 
  title="基本用法" 
  desc="配置一个列表和新增与修改表单" 
/>

<AppCodebox 
  src="src/abstract-actions/demo/index.sub" 
  title="子动作" 
  desc="可以通过subAction属性来指定当前所处的子动作，子动作主要用于某个动作界面中以弹窗或者抽屉的形式执行相关操作。" 
/>

<AppCodebox 
  console="true"
  src="src/abstract-actions/demo/index.history" 
  title="路由结合" 
  desc="可通过设置history与templateUrl来结合路由联动。" 
/>