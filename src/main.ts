import { repos } from '@db/repositories';
import { runExpress } from '@infra/express-runner';
import { bootstrapExpressApp } from 'api';
import { getDatabaseConnection, getPort } from 'config';
import { createConnection } from 'typeorm';
import { runSeeds } from 'seed';
import { runWebsocket } from 'websocket';
import { mkBinanceService } from 'external/binance.service';

async function bootstrap() {
  const connection = await createConnection(getDatabaseConnection());
  const em = connection.createEntityManager();

  await runSeeds();

  await runWebsocket();

  const handle = runExpress((req) => (rte) =>
    rte({ ...repos(em), BinanceService: mkBinanceService() }),
  );

  const app = bootstrapExpressApp(handle);

  app.listen(getPort(), () => {
    console.info(`Started Listening to ${getPort()}`);
  });
}

bootstrap();
