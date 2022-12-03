'use strict';

import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';

dotenv.config();

interface Config {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
}

const cfg: Config = {
  host: process.env.DB_HOST_SLAVE || '127.0.0.1',
  port: +(process.env.DB_PORT || 3306),
  database: process.env.DB_NAME || 'jarimuawasi_kdpp',
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
};

const conn: any = {};
const sequelize = new Sequelize(cfg?.database, cfg?.username, cfg?.password, {
  host: cfg?.host,
  port: cfg?.port,
  dialect: 'mysql',
  timezone: '+07:00',
});

conn.sequelize = sequelize;
conn.Sequelize = Sequelize;

export default conn;
