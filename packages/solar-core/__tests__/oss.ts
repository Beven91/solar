import 'jest-fetch-mock';
import config from '../src/config';
import Oss from '../src/oss';

const fetch = global.fetch;

const OssSuccessResponse = `
<PostResponse>
  <Bucket>solar-common</Bucket>
  <Location>http://solar-common.oss-cn-shanghai.aliyuncs.com/aa.jpg</Location>
  <Key>aa.jpg</Key>
  <ETag>FBC45A0A46341DD5E21FFA29DFED19E9</ETag>
</PostResponse>
`;


describe('Oss', () => {
  afterEach(() => {
    process.env.RUNTIME = '';
  });

  it('resizeAliOss', () => {
    const url = 'http://ali-oss.shanghai.com/a.png';
    const url2 = 'http://ali-oss.shanghai.com/a.png?x-oss-process=style/';
    // 断言：正常url附加尺寸样式
    expect(Oss.getPublicUrl(url, 100)).toBe(`${url}?x-oss-process=image/resize,w_100`);

    // 断言: 在已经包含了style情况下，不进行额外处理
    expect(Oss.getPublicUrl(url2, 100)).toBe(url2);

    // 断言: 获取私有private
    expect(Oss.getPrivateUrl(url, 100)).toBe(`${url}?x-oss-process=image/resize,w_100`);


    // 断言：在没有传递任何操作样式，返回原始Url
    expect(Oss.getBucketAccessUrl('public', url)).toBe(url);
    expect(Oss.getBucketAccessUrl('private', url2)).toBe(url2);

    expect(Oss.getBucketAccessUrl('public', 'a.png')).toBe('a.png');
  });

  it('aliOssConfig', async() => {
    const result = {
      accessid: 'key',
      policy: 'ss',
      signatur: 'ss',
      host: '',
    };

    config.setup({
      oss: {
        directory: 'aa',
        aliOssConfig: () => Promise.resolve(result),
      },
    });

    fetch.mockResponse(JSON.stringify({ data: result }));

    // 配置信息
    const result2 = await Oss.aliOssConfig('item');

    // 断言: 正常返回配置数据 这里result2 为返回数据的 xx.data
    expect(result2.accessid).toBe(result.accessid);

    // 模拟服务返回data为null
    fetch.mockResponse(JSON.stringify({ data: null }));

    // 配置信息
    const result3 = await Oss.aliOssConfig('item');
    // 断言：当服务器返回null时会进行空对象处理
    expect(!!result3).toBe(true);
  });

  it('uploadToAliOss.normal', async() => {
    const file = getUploadFile();
    const jestUpload = jest.spyOn(Oss, 'h5Upload');

    let uploadData = null as any;

    jestUpload.mockImplementation((url, type, data) => {
      const div = document.createElement('div');
      div.innerHTML = OssSuccessResponse;
      uploadData = data;
      return Promise.resolve(div);
    });

    await Oss.uploadToAliOss(file, { category: 'hello' });

    // 断言: 默认为h5上传，所以jestUpload需要被调用
    expect(jestUpload).toHaveBeenCalled();

    // 测试 keep 模式，保留源文件名
    await Oss.uploadToAliOss(file, { category: 'oss' });

    // 断言: uploadData.filekey会使用原始文件名
    expect(uploadData.get('key')).toBe('oss/a.txt');

    // 模拟服务器返回空
    jestUpload.mockImplementation((url, type, data) => {
      const div = document.createElement('div');
      div.innerHTML = '';
      return Promise.resolve(div);
    });
    const emptyR = await Oss.uploadToAliOss(file, { category: 'hello' });
    // 断言：返回空时 result为error
    expect(emptyR).toBe('error');

    jestUpload.mockRestore();
  });

  it('h5Upload', async() => {
    const XMLHttpRequest = window.XMLHttpRequest;
    const mWindow = window as any;

    mWindow.XMLHttpRequest = function() { };

    mWindow.XMLHttpRequest.prototype.open = jest.fn();

    const jestSend = mWindow.XMLHttpRequest.prototype.send = jest.fn();

    // 模拟上传成功
    jestSend.mockImplementation(function() {
      this.onreadystatechange();
      this.status = 200;
      this.readyState = 4;
      this.responseXML = 'ok';
      this.onreadystatechange();
    });
    // 上传
    const res = await Oss.h5Upload('/upload', new FormData(), () => { });
    // 断言: 返回结果为ok
    expect(res).toBe('ok');

    // 模拟上传失败
    jestSend.mockImplementation(function() {
      this.status = 500;
      this.readyState = 4;
      this.responseXML = 'error';
      this.onreadystatechange();
    });
    // 上传
    const res2 = await Oss.h5Upload('/upload', new FormData(), () => { }).catch((err) => err);
    // 断言: 返回结果为 error
    expect(res2).toBe('error');

    // 还原覆写
    window.XMLHttpRequest = XMLHttpRequest;
  });

  it('uploadToAliOss.wxapp', async() => {
    const file = getUploadFile();
    const jestWxUpload = jest.spyOn(Oss, 'wxUpload');

    // 设置运行环境为 wxapp
    process.env.RUNTIME = 'wxapp';

    jestWxUpload.mockImplementation(() => Promise.resolve('https://solar.file/a.jpg'));

    await Oss.uploadToAliOss(file, { category: 'hello' });

    // 断言: 在 process.env.RUNTIME === 'wxapp' 时 会使用微信接口上传
    expect(jestWxUpload).toHaveBeenCalled();

    jestWxUpload.mockRestore();
  });

  it('wxUpload', async() => {
    const uploadFile = jest.fn();
    const mWindow = window as any;
    mWindow.wx = {
      uploadFile: uploadFile,
    };

    // 上传成功
    uploadFile.mockImplementation((options) => {
      options.success({
        data: OssSuccessResponse,
      });
    });
    // 调用上传
    const r = await Oss.wxUpload('https://solar.upload/file', {}, 'a.jpg');
    // 断言: 返回上传的文件
    expect(r).toBe('http://solar-common.oss-cn-shanghai.aliyuncs.com/aa.jpg');

    // 上传成功返回空内容
    uploadFile.mockImplementation((options) => {
      options.success({
        data: '',
      });
    });
    // 调用上传
    const r2 = await Oss.wxUpload('https://solar.upload/file', {}, 'a.jpg');
    // 断言: 这里不会出现异常，返回结果为undefined
    expect(r2).toBeUndefined();

    // 上传失败
    uploadFile.mockImplementation((options) => {
      options.fail('error');
    });
    const e = await Oss.wxUpload('https://solar.upload/file', {}, 'a.jpg').catch((e) => e);
    // 断言: 返回上传失败
    expect(e).toBe('error');
  });

  it('removeAliOssObj', () => {
    Oss.removeAliOssObj(undefined, undefined);
  });

  function getUploadFile() {
    const result = {
      dir: 'dir/',
      signature: 'signature',
      accessid: 'accessid',
      policy: 'a1234',
    };
    fetch.mockResponse(JSON.stringify({ data: result }));
    return new File([], 'a.txt');
  }
})
;
