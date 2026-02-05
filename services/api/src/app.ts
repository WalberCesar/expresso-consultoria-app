import express, { Application, Request, Response, NextFunction } from 'express';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import syncRoutes from './routes/sync.routes';

interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

class App {
  public app: Application;

  constructor() {
    this.app = express();
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeMiddlewares(): void {
    
    this.app.use(express.json());
    
   
    this.app.use(express.urlencoded({ extended: true }));
  }

  private initializeRoutes(): void {
    
    this.app.get('/health', (_req: Request, res: Response) => {
      res.status(200).json({
        status: 'success',
        message: 'Server is running',
        timestamp: new Date().toISOString(),
      });
    });

  
    this.app.get('/', (_req: Request, res: Response) => {
      res.status(200).json({
        status: 'success',
        message: 'Welcome to Expresso Consultoria API',
        version: '1.0.0',
      });
    });

   
    this.app.use('/api/auth', authRoutes);

    
    this.app.use('/api/users', userRoutes);

    
    this.app.use('/api/sync', syncRoutes);
  }

  private initializeErrorHandling(): void {
    
    this.app.use((_req: Request, res: Response) => {
      res.status(404).json({
        status: 'error',
        message: 'Route not found',
      });
    });

    
    this.app.use((err: AppError, _req: Request, res: Response, _next: NextFunction) => {
      const statusCode = err.statusCode || 500;
      const message = err.isOperational ? err.message : 'Internal Server Error';

      console.error('Error:', {
        message: err.message,
        stack: err.stack,
        statusCode,
      });

      res.status(statusCode).json({
        status: 'error',
        message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
      });
    });
  }

  public getApp(): Application {
    return this.app;
  }
}

export default App;
