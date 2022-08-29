/**
 * @module UserIdArgumentResolver
 * @description 用于从登录态中解析出userID
 */
import { HandlerMethodArgumentResolver, MethodParameter, ServletContext } from 'node-web-mvc';
import UserId from './UserId';
import UserContext from '../../security/UserContext';

export default class UserIdArgumentResolver implements HandlerMethodArgumentResolver {
  supportsParameter(parameter: MethodParameter, servletContext: ServletContext): boolean {
    return parameter.hasParameterAnnotation(UserId);
  }

  resolveArgument(parameter: MethodParameter, servletContext: ServletContext) {
    const request = servletContext.request;
    const user = new UserContext(request);
    return user.userId;
  }
}