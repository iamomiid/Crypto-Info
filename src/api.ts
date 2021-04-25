import { runExpress } from '@infra/express-runner';
import express, { NextFunction, Router, Response, Request } from 'express';
import { json, urlencoded } from 'body-parser';
import { controllers } from '@http/controllers';

export const bootstrapExpressApp = (run: ReturnType<typeof runExpress>) => {
  const app = express();

  app.use(urlencoded({ extended: false }));
  app.use(json());

  app.use(
    '/',
    controllers
      .map((x) => x(run))
      .reduce((router, childRouter) => router.use(childRouter), Router()),
  );

  app.use((error: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.log(error);
    res.status(500).send();
  });

  return app;
};
