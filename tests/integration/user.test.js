import { jest } from '@jest/globals';
import request from 'supertest';
import app from '../../app.js';

let token;
let userId;
let anotherUserId;

beforeAll(async () => {
  // Cria usuário principal
  const userData = {
    username: 'User Test',
    email: `usertest${Date.now()}@example.com`,
    password: 'password123',
    confirmpassword: 'password123',
    role: 'agricultor',
    propertyName: 'Fazenda User',
    city: 'Cidade User',
    state: 'Estado User',
    phoneNumber: '11911111111'
  };
  const res = await request(app).post('/auth/register').send(userData);
  token = res.body.token;
  userId = res.body.user.id;

  // Cria outro usuário para testar permissões
  const anotherUserData = {
    username: 'Another User',
    email: `anotheruser${Date.now()}@example.com`,
    password: 'password123',
    confirmpassword: 'password123',
    role: 'consumidor',
    city: 'Cidade User',
    state: 'Estado User',
    phoneNumber: '11922222222'
  };
  const res2 = await request(app).post('/auth/register').send(anotherUserData);
  anotherUserId = res2.body.user.id;
});

describe('User Endpoints', () => {
  it('should get user by id', async () => {
    const res = await request(app)
      .get(`/user/${userId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(res.body).toHaveProperty('user');
    expect(res.body.user.id).toBe(userId);
  });

  it('should return 404 for non-existent user', async () => {
    const res = await request(app)
      .get('/user/00000000-0000-0000-0000-000000000000')
      .set('Authorization', `Bearer ${token}`)
      .expect(404);
    expect(res.body).toHaveProperty('msg');
  });

  it('should not allow to get user without token', async () => {
    const res = await request(app)
      .get(`/user/${userId}`)
      .expect(401);
    expect(res.body).toHaveProperty('msg');
  });

  it('should edit user', async () => {
    const res = await request(app)
      .put(`/user/${userId}/edit`)
      .set('Authorization', `Bearer ${token}`)
      .send({ username: 'User Test Editado' })
      .expect(200);
    expect(res.body).toHaveProperty('msg');
    expect(res.body.user.username).toBe('User Test Editado');
  });

  it('should not allow to edit another user', async () => {
    const res = await request(app)
      .put(`/user/${anotherUserId}/edit`)
      .set('Authorization', `Bearer ${token}`)
      .send({ username: 'Hacker' })
      .expect(403);
    expect(res.body).toHaveProperty('msg');
  });

  it('should change password', async () => {
    const res = await request(app)
      .put(`/user/${userId}/password`)
      .set('Authorization', `Bearer ${token}`)
      .send({ 
        oldPassword: 'password123', 
        newPassword: 'newpassword123', 
        confirmPassword: 'newpassword123' 
      })
      .expect(200);
    expect(res.body).toHaveProperty('msg');
  });

  it('should not allow to change password with wrong confirmation', async () => {
    const res = await request(app)
      .put(`/user/${userId}/password`)
      .set('Authorization', `Bearer ${token}`)
      .send({ 
        oldPassword: 'newpassword123', 
        newPassword: 'newpassword123', 
        confirmPassword: 'wrong' 
      })
      .expect(400);
    expect(res.body).toHaveProperty('msg');
  });

  it('should get agricultores', async () => {
    const res = await request(app)
      .get('/user/agricultores')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(res.body).toHaveProperty('agricultores');
    expect(Array.isArray(res.body.agricultores)).toBe(true);
  });

  it('should delete user', async () => {
    const res = await request(app)
      .delete(`/user/${userId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(res.body).toHaveProperty('msg');
  });

  it('should not allow to delete another user', async () => {
    const res = await request(app)
      .delete(`/user/${anotherUserId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(403);
    expect(res.body).toHaveProperty('msg');
  });
}); 