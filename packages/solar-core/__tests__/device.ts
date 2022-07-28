describe('Device', () => {
  function getDevice(userAgent?:string) {
    jest.resetModules();
    Object.defineProperty(navigator, 'userAgent', { configurable: true, value: userAgent });
    return require('../src/device').default;
  }

  it('Device.normal', () => {
    const Device = getDevice();
    Device.applyClass();
    expect(document.documentElement.className).toContain('');
  });

  it('Device.isAndroid', () => {
    const Device = getDevice(' Android ');
    Device.applyClass();
    expect(document.documentElement.className).toContain('is-platform-android');
    expect(Device.platform).toBe('android');
  });

  it('Device.isiPhone', () => {
    const Device = getDevice(' iPhone ');
    Device.applyClass();
    expect(document.documentElement.className).toContain('is-platform-ios');
    expect(Device.platform).toBe('ios');
  });
})
;
