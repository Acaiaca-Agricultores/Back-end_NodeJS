import { sequelize } from '../scr/config/database.js';

export async function up() {
    try {
        await sequelize.query(`
            ALTER TABLE "Users" 
            ADD COLUMN historia TEXT;
        `);
        console.log('Campo historia adicionado com sucesso à tabela Users');
    } catch (error) {
        console.error('Erro ao adicionar campo historia:', error);
        throw error;
    }
}

export async function down() {
    try {
        await sequelize.query(`
            ALTER TABLE "Users" 
            DROP COLUMN historia;
        `);
        console.log('Campo historia removido com sucesso da tabela Users');
    } catch (error) {
        console.error('Erro ao remover campo historia:', error);
        throw error;
    }
} 