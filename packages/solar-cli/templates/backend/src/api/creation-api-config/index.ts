import path from 'path';

export default {
  SIGNATURE_KEY: '',
  TOKEN_KEY: '',
  db: {
    username: '$projectName$',
    password: '$projectName$@123',
    dialect: 'sqlite' as any,
    database: '$projectName$',
    storage: path.resolve('appdata/demo.sqlite'),
  },
};