import { NextApiRequest } from 'next';
import { DecodedToken } from '../lib/auth';

declare module 'next' {
  export interface NextApiRequest {
    user?: DecodedToken;
  }
}
