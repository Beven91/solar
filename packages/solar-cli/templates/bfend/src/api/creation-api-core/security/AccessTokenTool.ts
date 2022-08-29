/**
 * @module AccessTokenTool
 * @description access-token 构造与解析工具
 */
import crypto from 'crypto';
import config from '$projectName$-api-config';
import AccessToken from './AccessToken';

// HMAC签名 密钥
const SIGNATURE_KEY = crypto.scryptSync(config.SIGNATURE_KEY, 'V1', 24);

// 生成token的算法
const TOKEN_ALGORITHM = 'aes-192-cbc';

// 生成token的密钥
const TOKEN_KEY = crypto.scryptSync(config.TOKEN_KEY, 'V1', 24);

// 生成token加密的向量
const TOKEN_IV = Buffer.alloc(16, 0);

export default class AccessTokenTool {
  /**
  * 根据传入的accessToken实例,来创建对应的token字符串
  */
  static createToken(data: AccessToken) {
    if (!data) {
      return '';
    }
    const hmac = crypto.createHmac('md5', SIGNATURE_KEY);
    const cipher = crypto.createCipheriv(TOKEN_ALGORITHM, TOKEN_KEY, TOKEN_IV);
    const payload = AccessToken.stringify(data);
    // 计算payload内容签名
    const signature = hmac.update(payload).digest('hex');
    // 加密产生token
    return [
      cipher.update(`${payload}.${signature}`, 'utf8', 'base64'),
      cipher.final('base64'),
    ].join('');
  }

  /**
   * 逆解析token成为AccessToken实例
   */
  static parseToken(token: string): AccessToken {
    try {
      if (!token) return;
      // 创建解密工具
      const hmac = crypto.createHmac('md5', SIGNATURE_KEY);
      const decipher = crypto.createDecipheriv(TOKEN_ALGORITHM, TOKEN_KEY, TOKEN_IV);
      // 解密accessToken
      const [payload, signature] = [decipher.update(token, 'base64', 'utf8'), decipher.final('utf8')].join('').split('.');
      // 校验签名
      const sign = hmac.update(payload).digest('hex');
      // 解析出 json字符串
      const serialize = (new Buffer(payload, 'base64')).toString('utf8');
      // 解析出 access-token
      const accessToken = AccessToken.from(serialize);
      if (signature !== sign) {
        // 如果签名不匹配，则直接返回null
        return null;
      }
      return accessToken;
    } catch (ex) {
      console.error(ex);
      // 如果解析出现异常，则返回null
      return null;
    }
  }

  /**
   * 校验accessToken是否合法
   */
  static verifyToken(accessToken: AccessToken) {
    const now = Date.now();
    const isExpired = accessToken?.exp === -0 ? false : now > accessToken?.exp;
    if (!accessToken || isExpired) {
      // 如果accessToken 为null 或者accessToken已过期
      return false;
    }
    // 校验通过
    return accessToken.uid && accessToken.uid > 0;
  }
}