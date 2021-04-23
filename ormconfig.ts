import { config } from 'dotenv-flow';
import { ConnectionOptions } from 'typeorm';
config();

const option: ConnectionOptions = {
  type: 'mysql',
  host: process.env.DB_HOST,
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  migrationsTableName: 'migration',
  // debug: true,
  logging: true,
  migrations: [__dirname + '/migration/*.ts'],
  synchronize: false,
  cli: {
    migrationsDir: 'migration',
  },
  entities: [__dirname + '/src/**/*.entity.ts'],
};

export = option;
