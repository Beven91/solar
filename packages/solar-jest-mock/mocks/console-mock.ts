const originalOutError = console.error;
const originalWarn = console.warn;
const originalLog = console.log;
const onceBlackList: Array<string> = [];
const blackList = [
  'Not implemented: navigation',
  'Test defined error',
  'MOCKERROR ',
  'ThrowError',
];
const blacWarnList = [
  'You are using a whole package of antd-mobile',
  'You are using a whole package of antd',
];

const blackLogList = [
  'use jsbridge',
  'dispatch schema',
];


jest.fn();
const error = jest.spyOn(console, 'error');
const warn = jest.spyOn(console, 'warn');
const log = jest.spyOn(console, 'log');

error.mockImplementation((message = '', ...params: Array<any>) => {
  const msg = message + [...params].join('');
  const inBlackList = blackList.find((n) => msg.indexOf(n) > -1);
  const inOnceBlackList = onceBlackList.find((n) => msg.indexOf(n) > -1);
  if (!inOnceBlackList && !inBlackList) {
    originalOutError.apply(console, [message, ...params]);
  }
  if (inOnceBlackList) {
    onceBlackList.splice(onceBlackList.indexOf(inOnceBlackList), 1);
  }
});

warn.mockImplementation((message: string, ...params: Array<any>) => {
  const msg = message + [...params].join('');
  if (!blacWarnList.find((n) => msg.indexOf(n) > -1)) {
    originalWarn.apply(console, [message, ...params]);
  }
});

log.mockImplementation((message: string, ...params: Array<any>) => {
  const msg = message + [...params].join('');
  if (!blackLogList.find((n) => msg.indexOf(n) > -1)) {
    originalLog.apply(console, [message, ...params]);
  }
});

export default class ConsoleMock {
  static mockOnceBlackError(message: string) {
    onceBlackList.push(message);
  }
}
