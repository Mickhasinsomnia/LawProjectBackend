
import 'express';

declare global {
  namespace Express {
    interface User {
      id: string;
      role: 'user' | 'lawyer' | 'admin';

    }

    interface Request {
      user?: User | null;
    }
  }
}
