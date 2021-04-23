import { Request, Response } from 'express';

export const handleSuccess = (req: Request, res: Response) => <A>(a: A) => {
  res.status(200).send(a);
};
