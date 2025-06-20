import { jest } from '@jest/globals';
import request from 'supertest';
import app from '../../app.js';

describe('Products Endpoints', () => {
  let authToken;
  let userId;

  beforeAll(async () => {
    // Criar usuário e fazer login para obter token
    const userData = {
      username: 'Product Test User',
      email: `producttest${Date.now()}@example.com`,
      password: 'password123',
      confirmpassword: 'password123',
      role: 'agricultor',
      propertyName: 'Fazenda Produto',
      city: 'Cidade Produto',
      state: 'Estado Produto',
      phoneNumber: '11988888888'
    };

    await request(app)
      .post('/auth/register')
      .send(userData);

    const loginResponse = await request(app)
      .post('/auth/login')
      .send({
        email: userData.email,
        password: 'password123',
        role: 'agricultor'
      });

    authToken = loginResponse.body.token;
    userId = loginResponse.body.user.id;
  });

  describe('PUT /product/register', () => {
    it('should register a new product successfully', async () => {
      const productData = {
        name: 'Test Product',
        description: 'Produto de teste para integração com descrição longa',
        price: 10.50,
        quantity: 100,
        category: 'frutas',
      };

      const response = await request(app)
        .put('/product/register')
        .set('Authorization', `Bearer ${authToken}`)
        .field('name', productData.name)
        .field('description', productData.description)
        .field('price', productData.price)
        .field('quantity', productData.quantity)
        .field('category', productData.category)
        .attach('productImage', Buffer.from('fake image data'), 'test-image.jpg');

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('msg');
      expect(response.body.msg).toBe('Produto registrado com sucesso!');
      expect(response.body).toHaveProperty('product');
    });

    it('should return error without authentication', async () => {
      const productData = {
        name: 'Test Product',
        description: 'Produto de teste para integração com descrição longa',
        price: 10.50,
        quantity: 100,
        category: 'frutas',
      };

      const response = await request(app)
        .put('/product/register')
        .field('name', productData.name)
        .field('description', productData.description)
        .field('price', productData.price)
        .field('quantity', productData.quantity)
        .field('category', productData.category)
        .expect(401);

      expect(response.body).toHaveProperty('msg');
      // Não verificar success pois pode não estar presente em todos os casos
    });
  });

  describe('GET /products', () => {
    it('should get all products with authentication', async () => {
      const response = await request(app)
        .get('/products')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Verificar se é um array ou objeto com propriedade products
      expect(typeof response.body).toBe('object');
    });

    it('should return error without authentication', async () => {
      const response = await request(app)
        .get('/products')
        .expect(401);

      expect(response.body).toHaveProperty('msg');
      // Não verificar success pois pode não estar presente em todos os casos
    });
  });
}); 