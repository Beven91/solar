export interface InvokeableMethods {
  [propName: string]: string | Function
}

export interface JssdkOptions {

  /**
   * 当前jssdk名称
   */
  name: string

  /**
   * 判断当前宿主环境是否能使用当前jssdk
   */
  match: (userAgent: string) => boolean

  /**
   * 目标jssdk的js资源地址
   * 如果不需要，则可以不设置此参数
   */
  url?: string,

  /**
   * 自定义协议， 可以将目标jssdk的函数调用转换成 sheme链接方式
   */
  protocol?: string

  /**
   * 获取引入jssdk实例的函数
   */
  getInstance: () => object

  /**
   * 初始化jssdk
   * 触发时机： 在加载完url后执行
   */
  onInitialize?: (native: any) => Promise<any>

  /**
   * sdk方法映射配置
   * > 例如：定义closeWebview
   * ```js
   *
   * {
   *   methods:{
   *     closeWebview:()=>{
   *      Native.nativeCloseWebview();
   *     },
   *     // 也可以关联设置
   *    closeWebview:'nativeCloseWebview'
   *   }
   * }
   *
   * ```
   */
  methods: InvokeableMethods
}
