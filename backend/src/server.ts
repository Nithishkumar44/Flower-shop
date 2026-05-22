import app from './app';
import prisma from './config/db';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Verify DB connection
    await prisma.$connect();
    console.log('Database connected successfully to PostgreSQL! 🐘');

    const server = app.listen(PORT, () => {
      console.log(`Luxe Blooms Server running in ${process.env.NODE_ENV || 'development'} mode on http://localhost:${PORT} 🌸`);
    });

    // Handle system shutdowns
    const shutdown = async () => {
      console.log('Shutting down server gracefully...');
      server.close(async () => {
        await prisma.$disconnect();
        console.log('Database disconnected. Process exited.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);

  } catch (error) {
    console.error('Server startup failed! ❌', error);
    process.exit(1);
  }
};

startServer();
