import express, { Application, Request, Response, NextFunction } from 'express';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';

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
    // Parse JSON bodies
    this.app.use(express.json());
    
    // Parse URL-encoded bodies
    this.app.use(express.urlencoded({ extended: true }));
  }

  private initializeRoutes(): void {
    // Health check endpoint
    this.app.get('/health', (_req: Request, res: Response) => {
      res.status(200).json({
        status: 'success',
        message: 'Server is running',
        timestamp: new Date().toISOString(),
      });
    });

    // Root endpoint
    this.app.get('/', (_req: Request, res: Response) => {
      res.status(200).json({
        status: 'success',
        message: 'Welcome to Expresso Consultoria API',
        version: '1.0.0',
      });
    });

    // Authentication routes
    this.app.use('/api/auth', authRoutes);

    // User routes (protected)
    this.app.use('/api/users', userRoutes);
  }

  private initializeErrorHandling(): void {
    // 404 handler - must come before error handler
    this.app.use((_req: Request, res: Response) => {
      res.status(404).json({
        status: 'error',
        message: 'Route not found',
      });
    });

    // Global error handler - must be last
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
