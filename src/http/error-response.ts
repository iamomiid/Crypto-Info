import { Errors } from '../core/errors';
import { Request, Response } from 'express';

export const handleError = (req: Request, res: Response) =>
  Errors.match({}, (err) => {
    console.log(err);
    res.status(400).send();
  });
