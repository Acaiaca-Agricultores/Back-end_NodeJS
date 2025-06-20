import { jest } from '@jest/globals';
import request from 'supertest';
import app from '../../app.js';

describe('Auth Endpoints', () => {
  describe('POST /auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        username: 'Test User',
        email: `test${Date.now()}@example.com`,
        password: 'password123',
        confirmpassword: 'password123',
        role: 'agricultor',
        propertyName: 'Fazenda Teste',
        city: 'Cidade Teste',
        state: 'Estado Teste',
        phoneNumber: '11999999999'
      };

      const response = await request(app)
        .post('/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty('msg');
      expect(response.body.msg).toBe('Usuário criado com sucesso!');
      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('token');
    });

    it('should return error for invalid email', async () => {
      const userData = {
        username: 'Test User',
        email: 'invalid-email',
        password: 'password123',
        confirmpassword: 'password123',
        role: 'agricultor',
        propertyName: 'Fazenda Teste',
        city: 'Cidade Teste',
        state: 'Estado Teste',
        phoneNumber: '11999999999'
      };

      const response = await request(app)
        .post('/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('msg');
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /auth/login', () => {
    it('should login successfully with valid credentials', async () => {
      // Primeiro criar um usuário
      const userData = {
        username: 'Login Test User',
        email: `logintest${Date.now()}@example.com`,
        password: 'password123',
        confirmpassword: 'password123',
        role: 'agricultor',
        propertyName: 'Fazenda Login',
        city: 'Cidade Login',
        state: 'Estado Login',
        phoneNumber: '11977777777'
      };

      await request(app)
        .post('/auth/register')
        .send(userData);

      const loginData = {
        email: userData.email,
        password: 'password123',
        role: 'agricultor'
      };

      const response = await request(app)
        .post('/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.msg).toBe('Login realizado com sucesso!');
    });

    it('should return error for invalid credentials', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'wrongpassword',
        role: 'agricultor'
      };

      const response = await request(app)
        .post('/auth/login')
        .send(loginData)
        .expect(404);

      expect(response.body).toHaveProperty('msg');
      expect(response.body.success).toBe(false);
    });
  });
}); 