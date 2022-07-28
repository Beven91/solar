import Cookie from '../src/cookie';

describe('Cookie', () => {
  it('parse', () => {
    const str = 'BIDUPSID=18CB9619E5482B2D0E9EC9A37D2CF93B; PSTM=1586315620; BAIDUID=18CB9619E5482B2D1D7FEA5C25651A4D:FG=1; BD_UPN=12314753; COOKIE_SESSION=132245_4_9_7_60_14_0_0_9_5_0_0_131430_0_3_0_1588776067_1587296668_1588776064%7C9%2392079_3_1587291523%7C2; BD_HOME=1; H_PS_PSSID=1429_31125_21107_31589_30826_31463_31228_30823_31164; delPer=0; BD_CK_SAM=1; PSINO=1; BDORZ=B490B5EBF6F3CD402E515D22BCDA1598; BDSVRTM=18';

    const cookies = Cookie.parse(str);

    const runtime = {
      value: '',
    };

    Object.defineProperty(document, 'cookie', {
      set(value) {
        runtime.value = value;
      },
    });


    // 匹配镜像
    expect(cookies).toMatchSnapshot();

    const date = new Date();
    cookies.setCookie('name', 'beven', date, '/');

    // 断言： 底层设置cookie应该正确
    expect(runtime.value).toBe(`name=beven;expires=${date.toUTCString()};path=/`);

    expect(cookies).toMatchSnapshot();

    cookies.setCookie('aaa', null, null);
    expect(cookies).toMatchSnapshot();

    cookies.setCookie(null, null, null);
    expect(cookies).toMatchSnapshot();

    cookies.setCookie('type', '1', new Date(), '/', 'www.solar.com');
    expect(cookies).toMatchSnapshot();

    // 断言：存在 type
    expect(cookies.getCookie('type')).toBe('1');

    // 移除name
    cookies.removeCookie('name');
    expect(cookies).toMatchSnapshot();
  });
});
