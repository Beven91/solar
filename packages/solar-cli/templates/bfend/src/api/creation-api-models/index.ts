import { Sequelize } from 'sequelize-typescript';
import config from '$projectName$-api-config';

const sequlize = new Sequelize({
  ...config.db,
  models: [__dirname + '/src/**/*.ts'],

});

sequlize.sync();

export {
};
