import { User } from '../../models/User';

declare global {
  namespace Express {
    export interface Request {
      user?: {
        id: string;
        role: string;

      };
    }

  }
}
export {};