/**
 * @module BusinessEnum
 * @description 业务编码
 */

enum BusinessEnum {

   /**
    * 表示业务处理状态为: 成功
    */
   SUCCESS = 0,

   /**
    * 表示业务处理状态为：异常
    */
   ERROR = 100,

   /**
    * 表示当前请求未授权：未登录
    */
   UN_LOGIN = 120,

   /**
    * 表当当前请求，用户无权限
    */
   UN_PERMISSION = 130
}

export default BusinessEnum;