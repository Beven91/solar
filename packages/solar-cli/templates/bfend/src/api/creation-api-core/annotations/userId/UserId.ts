/**
 * @module UserId
 * @description 获取用户id的注解
 */

import { Target } from 'node-web-mvc';

@Target
export class UserIdAnnotation {
}

/**
 * 获取用户id注解
 */
export default Target.install<typeof UserIdAnnotation>(UserIdAnnotation);