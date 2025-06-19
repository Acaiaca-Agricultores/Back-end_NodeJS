import { up } from './migrations/add_historia_field.js';

async function runMigration() {
    try {
        console.log('Iniciando migração para adicionar campo historia...');
        await up();
        console.log('Migração concluída com sucesso!');
        process.exit(0);
    } catch (error) {
        console.error('Erro durante a migração:', error);
        process.exit(1);
    }
}

runMigration(); 