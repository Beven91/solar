enum SecurityEnum {

  /**
   * 当前接口需要用户登录才能访问
   */
  Login,

  /**
   * 当前接口在游客登录态或者已登录可访问
   */
  Guest,

  /**
   * 需要管理员登录态
   */
  Admin,

  /**
   * 当前接口无需登录即可访问呢
   */
  None
}

export default SecurityEnum;