import { jest } from '@jest/globals';
import dotenv from 'dotenv';
import '../scr/models/associations.js';

// Carrega variáveis de ambiente para testes
dotenv.config({ path: '.env.test' });

// Configurações globais para testes
global.testTimeout = 10000;

// Limpa console durante testes
beforeEach(() => {
  jest.clearAllMocks();
}); 