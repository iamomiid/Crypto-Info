import ormConfig from '../ormconfig';

const { env } = process;

export const getPort = () => (env.PORT ? parseInt(env.PORT, 10) : 3000);

export const getDbPort = () => (env.DB_PORT ? parseInt(env.DB_PORT, 10) : 3306);

export const getDatabaseConnection = () => ({
  ...ormConfig,
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
});
