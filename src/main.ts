import { repos } from '@db/repositories';
import { runExpress } from '@infra/express-runner';
import { bootstrapExpressApp } from 'api';
import { getDatabaseConnection, getPort } from 'config';
import { createConnection } from 'typeorm';

async function bootstrap() {
  const connection = await createConnection(getDatabaseConnection());
  const em = connection.createEntityManager();

  const handle = runExpress((req) => (rte) => rte({ ...repos(em) }));

  const app = bootstrapExpressApp(handle);

  app.listen(getPort(), () => {
    console.info(`Started Listening to ${getPort()}`);
  });
}

bootstrap();
