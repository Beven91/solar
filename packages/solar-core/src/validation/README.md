# Validation

数据校验器

### 用例

```js
import { Validation } from 'nebulas';

const rules = {
  userName: { required: '请输入用户名' },
};

const data = {
  userName:'张三'
}

// 绑定校验失败事件
Validation.validator.on('invalid',(errors)=>{
  console.log(errors);
});

// 绑定校验通过事件
Validation.validator.on('valid',()=>{
  // ...passs
});


if(Validation.validator.model(data,rules)){
  // 校验通过
}
```

### 自定义规则

```js
import { Validation } from 'nebulas';

// 自定义手机校验
Validator.registerRule('mobile2', (value)=> /^1\d{10}$/.test(value), '请输入正确的手机号码');

const rules = {
  userName: { mobile2: '请输入正确的手机号码' },
};

const data = {
  userName:'张三'
}

if(Validation.validator.model(data,rules)){
  // 校验通过
}
```

### 支持哪些规则?

#### required  
 
非空校验: 

```js
const rules = {
  name: { required:'名称不能为空'  }
}
```


#### twoRequired 

两项必填某一项

```js
const obj = { name:'张三',alias:''}
const rules = {
  name: { twoRequired:['alias','姓名与别名至少填写一项']  }
}
```

#### email

邮箱验证

```js
const rules = {
  userEmail: { email:'请填写正确的邮箱'  }
}
```

#### number

数字校验 (小数，与整数)

```js
const rules = {
  orderPrice: { number:'请输入有效的数字'  } ,
}
```

#### minlength

最小长度验证

```js
const rules = {
  userName: { minlength:[10,'最少要输入 {0} 个字符']  }
}
```

#### maxlength

最大长度验证

```js
const rules = {
  userName: { maxlength:[10,'最多可以输入 {0} 个字符']  }
}
```

#### rangelength

长度范围验证

```js
const rules = {
  userName: { rangelength:[5,8,'用户名长度至少在{0} 到{1} 个字符之间']  }
}
```

#### min

最小值验证

```js
const rules = {
  buyNum: { min:[5,'购买数量不能小于{0}个']  }
}
```

#### max

最小值验证

```js
const rules = {
  buyNum: { max:[10,'购买数量不能超过{0}个']  }
}
```

#### range 

最小值验证() 释义： buyNum >=5 && buyNum<=10

```js
const rules = {
  buyNum: { range:[5,10,'购买数量只能在{0} 到{1}个之间']  }
}
```
      
#### mobile 

手机号验证

```js
const rules = {
  buyNum: { mobile:'请输入有效的手机号码'  }
}
```
      
#### equalTo 

当前值是否和指定属性值相等校验

```js
const obj = { password:'xxx',confirmPassword:'xx' }
const rules = {
  password: { equalTo:['confirmPassword','两次密码不一致']  }
}
```

#### minTo

判断当前属性必须小于指定属性值

```js
const rules = {
  buyNum: { minTo:['stockNum','购买数量不能大于库存数量']  }
}
```

#### maxTo

判断当前属性值必须大于指定属性值

```js
const rules = {
  buyNum: { maxTo:['minBuyNum','购买数量不能小于起购数量']  }
}
```

#### idCard

中华人民共和国身份证校验 (包括二代身份证以及老身份证校验)

```js
const rules = {
  idCard: { idCard:'请输入有效的身份证'  }
}
```
