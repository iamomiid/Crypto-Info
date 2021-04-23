import { runExpress } from '@infra/express-runner';
import express from 'express';
import { json, urlencoded } from 'body-parser';

export const bootstrapExpressApp = (run: ReturnType<typeof runExpress>) => {
  const app = express();

  app.use(urlencoded({ extended: false }));
  app.use(json());

  return app;
};
