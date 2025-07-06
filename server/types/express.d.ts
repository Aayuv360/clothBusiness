import 'express-session';
import type { User } from '@shared/schema';

declare module 'express-session' {
  interface SessionData {
    userId?: string;
    user?: User;
  }
}

declare global {
  namespace Express {
    interface Request {
      session: SessionData;
    }
  }
}