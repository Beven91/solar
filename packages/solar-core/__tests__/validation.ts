/**
 * @module Validation
 * @name 测试 Validation模块
 * @description
 */

import Validation from '../src/validation';


describe('Validation', () => {
  beforeEach(() => {
    Validation.validator.clear();
  });

  test('resiter', () => {
    let error = null;
    try {
      Validation.register('hello', undefined, undefined);
    } catch (ex) {
      error = ex;
    }

    // 断言: 校验器必须为一个函数
    expect(error.message).toContain('检验器必须为一个function');

    try {
      Validation.register('required', undefined, undefined);
    } catch (ex) {
      error = ex;
    }

    // 断言: 校验器必须为一个函数
    expect(error.message).toContain('已存在名称为required的校验器');
  });

  test('event', () => {
    const user = {
      userName: '',
    };
    const rules = {
      userName: { required: '用户名不能为空', maxlength: [4, '最多可以输入 {0} 个字符'] },
      password: { required: '密码不能为空' },
    };
    const res = {
      errors: null as any,
    };
    const invalidFn = jest.fn();
    const validFn = jest.fn();

    invalidFn.mockImplementation((errors) => {
      res.errors = errors;
    });

    Validation.validator.on('invalid', invalidFn);
    Validation.validator.on('valid', validFn);
    const r = Validation.validator.model(user, rules);

    // 断言校验失败
    expect(r).toBe(false);

    // 断言：invalidFn会被调用
    expect(invalidFn).toHaveBeenCalled();
    // 断言:validFn不会被调用
    expect(validFn).not.toHaveBeenCalled();
    // 断言：镜像
    expect(res.errors).toMatchSnapshot();

    user.userName = '你好啊满五个字了';

    const r2 = Validation.validator.model(user, rules);

    // 断言校验失败
    expect(r2).toBe(false);
    expect(res.errors).toMatchSnapshot();

    // 移除事件绑定
    invalidFn.mockReset();
    Validation.validator.off('invalid', invalidFn);

    // 重新校验
    user.userName = '';
    // 断言: 此时会校验失败
    expect(Validation.validator.model(user, rules)).toBe(false);
    // 断言: invalidFn不会被执行，因为该事件被移除
    expect(invalidFn).not.toHaveBeenCalled();
  });

  it('required', () => {
    const rules = {
      userName: { required: '请输入用户名' },
    };
    const model = {
      userName: '',
    };

    // 断言：在没有填写用户名的情况下，应该为校验失败
    expect(Validation.validator.model(model, rules)).toBe(false);

    model.userName = 'beven';

    // 断言: 输入了用户名，校验结果为true
    expect(Validation.validator.model(model, rules)).toBe(true);
  });

  it('no rquired', () => {
    const rules = {
      email: { email: '请输入正确的邮箱' },
    };
    const model = {
      email: '',
    };

    // 断言：在没有设置email的情况，返回结果应该为true 应为 email不是必填项
    expect(Validation.validator.model(model, rules)).toBe(true);

    model.email = 'beven@hotmail.com';

    // 断言: 输入了邮箱，返回结果为true
    expect(Validation.validator.model(model, rules)).toBe(true);
  });

  it('twoRequired', () => {
    const rules = {
      userName: { twoRequired: ['email', '用户名邮箱二选一'] },
    };
    const rules2 = {
      userName: { twoRequired: [() => 'email', '用户名与邮箱二选一'] },
    };
    const model = {
      userName: '',
      email: '',
    };
    expect(Validation.validator.model(model, rules)).toBe(false);

    model.email = 'beven.zhou@hotmail.com';

    expect(Validation.validator.model(model, rules)).toBe(true);


    model.userName = 'beven.zhou';
    expect(Validation.validator.model(model, rules)).toBe(true);

    model.userName = '';
    model.email = 'beven.zhou@hotmail.com';

    expect(Validation.validator.model(model, rules2)).toBe(true);
  });

  it('email', () => {
    const rules = {
      email: { email: '请输入正确的邮箱' },
    };
    const model = {
      email: '',
    };

    const invalidFn = jest.fn();

    Validation.validator.on('invalid', invalidFn);

    expect(Validation.validator.model(model, rules)).toBe(true);

    model.email = 'beven.zhou';
    // 断言: beven.zhou 不是正确的邮箱
    expect(Validation.validator.model(model, rules)).toBe(false);
    // 断言：此时返回的errors消息
    expect(invalidFn.mock.calls[0][0]).toStrictEqual([{ 'message': '请输入正确的邮箱', 'name': 'email' }]);
  });

  it('number', () => {
    const rules = {
      age: { number: '请输入数字或者小数' },
    };
    const model = {
      age: '223ssss',
    };

    // 断言：校验失败 223ssss不是一个数字格式
    expect(Validation.validator.model(model, rules)).toBe(false);

    model.age = '18';
    // 断言: 返回true
    expect(Validation.validator.model(model, rules)).toBe(true);

    model.age = '18.23';
    // 断言: 返回true
    expect(Validation.validator.model(model, rules)).toBe(true);


    model.age = '18.23.2';
    // 断言: 返回true
    expect(Validation.validator.model(model, rules)).toBe(false);
  });

  it('digits', () => {
    const rules = {
      age: { digits: '请输入数字' },
    };
    const model = {
      age: '223ssss',
    };

    // 断言：校验失败 223ssss不是一个数字格式
    expect(Validation.validator.model(model, rules)).toBe(false);

    model.age = '18.8';
    // 断言: 返回false
    expect(Validation.validator.model(model, rules)).toBe(false);

    model.age = '18.';
    // 断言: 返回false
    expect(Validation.validator.model(model, rules)).toBe(false);

    model.age = '18';
    // 断言: 返回true
    expect(Validation.validator.model(model, rules)).toBe(true);
  });

  it('minlength', () => {
    const rules = {
      name: { minlength: [4, '请至少输入 {0} 个字符'] },
    };
    const model = {
      name: '2' as any,
    };

    // 断言: 返回false
    expect(Validation.validator.model(model, rules)).toBe(false);

    model.name = '182222';
    // 断言: 返回true
    expect(Validation.validator.model(model, rules)).toBe(true);
  });

  it('maxlength', () => {
    const rules = {
      name: { maxlength: [4, '最多只能输入 {0} 个字符'] },
    };
    const model = {
      name: '' as any,
    };

    // 断言: 返回true
    expect(Validation.validator.model(model, rules)).toBe(true);

    model.name = 182222;
    // 断言: 返回false
    expect(Validation.validator.model(model, rules)).toBe(false);
  });

  it('rangelength', () => {
    const rules = {
      name: { rangelength: [4, 10, '最多只能输入 {0} - {1} 个字符'] },
    };
    const model = {
      name: '22',
    };

    // 断言: 返回false
    expect(Validation.validator.model(model, rules)).toBe(false);

    model.name = '182222';
    // 断言: 返回true
    expect(Validation.validator.model(model, rules)).toBe(true);

    model.name = '182229999999992';
    // 断言: 返回true
    expect(Validation.validator.model(model, rules)).toBe(false);
  });


  it('min', () => {
    const rules = {
      age: { min: [4, '年龄不能低于{0}岁'] },
    };
    const model = {
      age: 2,
    };

    // 断言: 返回false
    expect(Validation.validator.model(model, rules)).toBe(false);

    model.age = 4;
    // 断言: 返回true
    expect(Validation.validator.model(model, rules)).toBe(true);

    model.age = 40;
    // 断言: 返回true
    expect(Validation.validator.model(model, rules)).toBe(true);
  });

  it('max', () => {
    const rules = {
      age: { max: [29, '年龄不能超过{0}岁'] },
    };
    const model = {
      age: 1,
    };

    // 断言: 返回true
    expect(Validation.validator.model(model, rules)).toBe(true);

    model.age = 30;
    // 断言: 返回false
    expect(Validation.validator.model(model, rules)).toBe(false);
  });

  it('range', () => {
    const rules = {
      age: { range: [4, 29, '年龄只能在 {0} - {1} 岁之间'] },
    };
    const model = {
      age: 1,
    };

    // 断言: 返回false
    expect(Validation.validator.model(model, rules)).toBe(false);

    model.age = 4;
    // 断言: 返回true
    expect(Validation.validator.model(model, rules)).toBe(true);

    model.age = 10;
    // 断言: 返回true
    expect(Validation.validator.model(model, rules)).toBe(true);

    model.age = 29;
    // 断言: 返回true
    expect(Validation.validator.model(model, rules)).toBe(true);

    model.age = 30;
    // 断言: 返回false
    expect(Validation.validator.model(model, rules)).toBe(false);
  });

  it('mobile', () => {
    const rules = {
      mobile: { mobile: ['请输入正确的手机号'] },
    };
    const model = {
      mobile: 1 as any,
    };

    // 断言: 返回false
    expect(Validation.validator.model(model, rules)).toBe(false);

    const mobiles = [
      '12322244445',
      '13344445555',
      '14455556666',
      '15455556666',
      '16455556666',
      '17455556666',
      '18455556666',
      '19455556666',
    ];
    mobiles.forEach((value) => {
      model.mobile = value;
      // 断言: 返回true
      expect(Validation.validator.model(model, rules)).toBe(true);
    });

    model.mobile = '133';
    expect(Validation.validator.model(model, rules)).toBe(false);
  });

  it('equalTo', () => {
    const rules = {
      password: { equalTo: ['confirmPassword', '两次密码输入不一致'] },
    };
    const model = {
      password: '111',
      confirmPassword: '222',
    };

    // 断言: 返回false
    expect(Validation.validator.model(model, rules)).toBe(false);

    model.password = '222';
    // 断言: 返回true
    expect(Validation.validator.model(model, rules)).toBe(true);
  });

  it('minTo', () => {
    const rules = {
      salesPrice: { minTo: ['price', '销售价不能大于原价'] },
    };
    const model = {
      price: 10,
      salesPrice: 20,
    };

    // 断言: 返回false
    expect(Validation.validator.model(model, rules)).toBe(false);

    model.salesPrice = 5;
    // 断言: 返回true
    expect(Validation.validator.model(model, rules)).toBe(true);
  });

  it('maxTo', () => {
    const rules = {
      price: { maxTo: ['salesPrice', '原价不能低于销售价'] },
    };
    const model = {
      price: 10,
      salesPrice: 20,
    };

    // 断言: 返回false
    expect(Validation.validator.model(model, rules)).toBe(false);

    model.price = 30;
    // 断言: 返回true
    expect(Validation.validator.model(model, rules)).toBe(true);
  });

  it('idCard', () => {
    const rules = {
      idCard: { idCard: '请输入正确的身份证号码' },
    };
    const model = {
      idCard: '2344',
    };

    // 断言: 返回false
    expect(Validation.validator.model(model, rules)).toBe(false);

    // 二代身份证
    model.idCard = '110101199003076018';
    // 断言: 返回true
    expect(Validation.validator.model(model, rules)).toBe(true);
  });

  it('coverage', () => {
    const rules = {
      a: { a: 'ss' },
    };
    const rules2 = {
      b: { required: true, a: 'ss' as any },
    };
    const rules3 = {
      c: { required: [] as any },
    };

    const rules4 = {
      d: { max: null as any },
    };

    Validation.validator.model(null, null);
    expect(Validation.validator.model(null, rules)).toBe(true);
    expect(Validation.validator.model({ a: '' }, rules)).toBe(true);

    expect(Validation.validator.attr('a', '', rules2, null)).toStrictEqual({ valid: true });

    // 不存在的规则
    expect(Validation.validator.model({ b: 'a' }, rules2, null)).toBe(true);

    // default message
    expect(Validation.validator.model({ b: 'a' }, rules3)).toBe(false);

    expect(Validation.validator.model({ d: 'ss' }, rules4)).toBe(false);
  })
  ;
});
