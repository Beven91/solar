import config, { AliOssConfig } from '../config';

type onUploadProgress = (percent: number) => void

const absoluteRegexp = /^(https|http|\/\/)/;

export type BucketType = 'public' | 'private'

export interface OssUploadOptions {
  // 上传目录
  category?: string
  // 上传bucket类型
  bucketType?: BucketType
  // 是否保留原始文件名
  keepName?: boolean
  // 设置上传文件，访问时的缓存策略
  'Cache-Control'?: string
  // 设置上传文件，访问时的编码类型
  'Content-Encoding'?: string
  // 设置上传文件，访问时的缓存过期时间
  'Expires'?: string
  // 设置上传文件，下载时的文件名
  'Content-Disposition'?: string
}

interface UploadResponse {
  success: boolean
  result: string
  errorMsg: string
  errorCode: string
}

export default class AliOss {
  /**
   * 获取文件系统访问地址
   * @param bucketType 文件存放类型
   * @param src 文件key或者完整的文件地址
   * @param action 文件操作 仅对图片文件有效
   * @returns
   */
  static getBucketAccessUrl(bucketType: BucketType, src: string, action?: string) {
    const cdn = config.options.cdn;
    const fullUri = absoluteRegexp.test(src) ? src : `${cdn.replace(/\/$/, '')}/${src.replace(/^\//, '')}`;
    const joinChar = fullUri.indexOf('?') > 0 ? '&' : '?';
    if (fullUri.indexOf('x-oss-process=') > -1) {
      return fullUri;
    } else if (action) {
      return fullUri + joinChar + 'x-oss-process=' + action;
    }
    return fullUri;
  }

  /**
   * 获取共有云文件访问地址
   * @param {String} src 文件key或者完整的文件地址
   * @param {number} 按照宽度裁剪图片
   * @param {String} action  图片操作字符串 例如:image/resize,w_200
   */
  static getPublicUrl(src: string, width?: number, action?: string) {
    action = width > 0 ? `image/resize,w_${width}` : action;
    return this.getBucketAccessUrl('public', src, action);
  }

  /**
   * 获取私有云文件访问地址
   * @param {String} src 文件key或者完整的文件地址
   * @param {number} 按照宽度裁剪图片
   * @param {String} action  图片操作字符串 例如:image/resize,w_200
   */
  static getPrivateUrl(src: string, width?: number, action?: string) {
    action = width > 0 ? `image/resize,w_${width}` : action;
    return this.getBucketAccessUrl('private', src, action);
  }

  /**
   * 获取aliOss配置
   */
  static aliOssConfig(category: string): Promise<AliOssConfig> {
    if (config.options.oss?.aliOssConfig) {
      return Promise.resolve(config.options.oss?.aliOssConfig(category));
    }
    return Promise.resolve({} as AliOssConfig);
  }

  /**
   * 删除aliOss资源
   * @param {String} key 要删除的资源key名
   * @param {String} category 分类名称
   */
  static removeAliOssObj(key: string, category?: string) {
    // return this.aliOssConfig(category).then((config) => {
    //   const formData = new FormData();
    //   formData.append('key', key);
    //   formData.append('policy', config.policy);
    //   formData.append('CDNAccessKeyId', config.accessid);
    //   formData.append('signature', config.signature);
    //   formData.append('success_action_status', 201);
    //   return network.any(config.path + '/' + key, null, 'DELETE', { Authorization: config.signature });
    // });
  }

  private static mergeOssFormData(formData: any, options: any) {
    Object.keys(options || {}).forEach((key) => {
      formData.append ? formData.append(key, options[key]) : formData[key] = options[key];
    });
    return formData;
  }

  /**
   * 上传文件到aliOss
   * @param file 文件
   * @param category 上传目录
   * @param keep 是否保持原始文件目录上传
   */
  static uploadToAliOss(file: File, options?: OssUploadOptions, onprogress?: onUploadProgress, url?:string) {
    let category = options?.category || config.options.oss?.directory || 'default';
    return this.aliOssConfig(category).then((ossConfig) => {
      let formData = {} as any;
      category = category.replace(/\/$/, '');
      // const path = `https://${ossConfig.bucketName}.${config.OSS.region}.aliyuncs.com/`;
      const ext = file.name.split('.').pop();
      const name = options?.keepName ? file.name : new Date().getTime() + '-ali-oss-' + Math.random().toString().split('.').pop() + '.' + ext;
      const fileKey = category + '/' + name;
      options = options || {} as OssUploadOptions;
      delete options.keepName;
      // 默认设置cache-control 为no-cache
      options['Cache-Control'] = options['Cache-Control'] || 'no-cahe';
      // options['Content-Encoding'] = options['Content-Encoding'] || 'utf-8';
      if (process.env.RUNTIME === 'wxapp') {
        formData = {
          'key': fileKey,
          'policy': ossConfig.policy,
          'CDNAccessKeyId': ossConfig.accessid,
          'signature': ossConfig.signatur,
          'success_action_status': 201,
        };
        this.mergeOssFormData(formData, options);
        return this.wxUpload(url || ossConfig.host, formData, file);
      }
      formData = new FormData();
      formData.append('key', fileKey);
      formData.append('policy', ossConfig.policy);
      formData.append('OSSAccessKeyId', ossConfig.accessid);
      formData.append('signature', ossConfig.signatur);
      formData.append('success_action_status', 201);
      this.mergeOssFormData(formData, options);
      formData.append('file', file);
      return this
        .h5Upload(url || ossConfig.host, formData, onprogress)
        .then((response: any) => {
          const domKey = response.querySelector('PostResponse Location');
          const url = (domKey || {}).innerHTML;
          return (url || 'error').replace(/:\/\//g, ':///').replace(/\/\//g, '/');
        });
    }) as unknown as Promise<any>;
  }

  /**
   * 小程序上传文件到aliOss
   * @param url 服务器地址
   * @param formData 提交的数据
   * @param filePath 小程序选择文件路径
   */
  static wxUpload(url: string, formData: any, filePath: any) {
    return new Promise<UploadResponse>((resolve, reject) => {
      const ext = filePath.split('.').pop();
      formData.key = formData.key + '.' + ext;
      (<any>global).wx.uploadFile({
        url,
        filePath,
        name: 'file',
        formData,
        success: (res: any) => {
          resolve(res.data);
        },
        fail: reject,
      });
    });
  }

  /**
   * h5端上传文件
   * @param url 上传地址
   * @param data 表单数据
   * @returns
   */
  static h5Upload(url: string, data: FormData, onprogress: onUploadProgress) {
    return new Promise<UploadResponse>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', url, true);
      xhr.responseType = 'json';
      xhr.onprogress = (ev) => {
        if (ev.lengthComputable) {
          onprogress && onprogress((ev.loaded / ev.total) * 100);
        }
      };
      xhr.withCredentials = true;
      xhr.onreadystatechange = () => {
        if (xhr.readyState == 4) {
          const response = xhr.response as UploadResponse;
          (xhr.status >= 200 && xhr.status < 300) ? resolve(response) : reject(response);
        }
      };
      xhr.send(data);
    });
  }
}
