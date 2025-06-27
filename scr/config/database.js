import { Sequelize } from "sequelize";
import dotenv from "dotenv";
dotenv.config();

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASS,
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: 'postgres',
        logging: false,
    }
);

export default async function connectDB() {
    try {
        await sequelize.authenticate();
        
        // Configuração baseada no ambiente
        const syncOptions = process.env.NODE_ENV === 'development' 
            ? { alter: true }  // Para desenvolvimento - permite alterações incrementais
            : { force: false }; // Para produção - não altera estrutura existente
        
        await sequelize.sync(syncOptions);
        console.log('Connected to PostgreSQL and synchronized database models');
    } catch (error) {
        console.error('Error connecting to PostgreSQL:', error);
        throw error;
    }
}

export { sequelize };