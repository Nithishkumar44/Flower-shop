"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const db_1 = __importDefault(require("./config/db"));
const PORT = process.env.PORT || 5000;
const startServer = async () => {
    try {
        // Verify DB connection
        await db_1.default.$connect();
        console.log('Database connected successfully to PostgreSQL! 🐘');
        const server = app_1.default.listen(PORT, () => {
            console.log(`Luxe Blooms Server running in ${process.env.NODE_ENV || 'development'} mode on http://localhost:${PORT} 🌸`);
        });
        // Handle system shutdowns
        const shutdown = async () => {
            console.log('Shutting down server gracefully...');
            server.close(async () => {
                await db_1.default.$disconnect();
                console.log('Database disconnected. Process exited.');
                process.exit(0);
            });
        };
        process.on('SIGTERM', shutdown);
        process.on('SIGINT', shutdown);
    }
    catch (error) {
        console.error('Server startup failed! ❌', error);
        process.exit(1);
    }
};
startServer();
