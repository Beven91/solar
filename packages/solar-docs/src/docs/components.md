# 内置组件

文档系统内置了一些组件，可用来在书写文档时完成一些特定交互的功能，这些组件可以直接写在`md`文件中。

### QRCode

二维码组件

::: slot qrcode
```md
<QRcode value="https://www.xx.com" />
```
:::

<AppCodebox 
  slotKey="qrcode"
  type="mobile"
>
  <QRcode value="https://www.xx.com" />
</AppCodebox>


### Tooltip

文字提示组件

::: slot tlpdemo
```md
<Tooltip
  title="这是提示文44案....."
>
  <div>查看</div>
</Tooltip>
```
:::

<AppCodebox 
  slotKey="tlpdemo"
  type="mobile"
>
  <div style="margin:80px 0 0 30px">
    <Tooltip title="这是提示文案.....">
      <div>查看</div>
    </Tooltip>
  </div>
</AppCodebox>

  

### AppCodebox

一个带代码演示与源码查看的组件

```md
<AppCodebox 
  src="@midway/ui/Button/index" 
  title="标题" 
  desc="描述"
  type="mobile或者pc"
/>
```