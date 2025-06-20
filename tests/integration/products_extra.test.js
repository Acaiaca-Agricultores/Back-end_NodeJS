import { jest } from '@jest/globals';
import request from 'supertest';
import app from '../../app.js';

let token;
let userId;
let productId;

beforeAll(async () => {
  // Cria usuário
  const userData = {
    username: 'Product User',
    email: `productuser${Date.now()}@example.com`,
    password: 'password123',
    confirmpassword: 'password123',
    role: 'agricultor',
    propertyName: 'Fazenda Produto',
    city: 'Cidade Produto',
    state: 'Estado Produto',
    phoneNumber: '11933333333'
  };
  const res = await request(app).post('/auth/register').send(userData);
  token = res.body.token;
  userId = res.body.user.id;
});

describe('Product Endpoints', () => {
  it('should register a new product', async () => {
    const productData = {
      name: 'Produto Teste',
      description: 'Descrição longa para produto de teste',
      price: 20.5,
      quantity: 50,
      category: 'frutas',
    };
    const res = await request(app)
      .put('/product/register')
      .set('Authorization', `Bearer ${token}`)
      .field('name', productData.name)
      .field('description', productData.description)
      .field('price', productData.price)
      .field('quantity', productData.quantity)
      .field('category', productData.category)
      .attach('productImage', Buffer.from('fake image data'), 'test-image.jpg');
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('product');
    productId = res.body.product.id;
  });

  it('should get product by id', async () => {
    const res = await request(app)
      .get(`/product/${productId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(res.body).toHaveProperty('product');
    expect(res.body.product.id).toBe(productId);
  });

  it('should edit product', async () => {
    const res = await request(app)
      .put(`/product/edit/${productId}`)
      .set('Authorization', `Bearer ${token}`)
      .field('name', 'Produto Editado')
      .field('description', 'Descrição editada para produto de teste com texto longo')
      .field('price', 30.0)
      .field('quantity', 60)
      .field('category', 'Frutas')
      .attach('productImage', Buffer.from('fake image data'), 'test-image2.jpg');
    console.log('Edit product response:', res.body);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('product');
    expect(res.body.product.name).toBe('Produto Editado');
  });

  it('should get all products', async () => {
    const res = await request(app)
      .get('/products')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(res.body).toHaveProperty('products');
    expect(Array.isArray(res.body.products)).toBe(true);
  });

  it('should get all products by user id', async () => {
    const res = await request(app)
      .get(`/products/user/${userId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(Array.isArray(res.body) || Array.isArray(res.body.products)).toBe(true);
  });

  it('should delete product', async () => {
    const res = await request(app)
      .delete(`/product/delete/${productId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(res.body).toHaveProperty('msg');
  });

  it('should return 404 for non-existent product', async () => {
    const res = await request(app)
      .get('/product/00000000-0000-0000-0000-000000000000')
      .set('Authorization', `Bearer ${token}`)
      .expect(404);
    expect(res.body).toHaveProperty('msg');
  });

  it('should not allow to register product without image', async () => {
    const productData = {
      name: 'Produto Sem Imagem',
      description: 'Descrição longa',
      price: 10.0,
      quantity: 10,
      category: 'frutas',
    };
    const res = await request(app)
      .put('/product/register')
      .set('Authorization', `Bearer ${token}`)
      .field('name', productData.name)
      .field('description', productData.description)
      .field('price', productData.price)
      .field('quantity', productData.quantity)
      .field('category', productData.category);
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('msg');
  });
}); 