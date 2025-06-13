const request = require('supertest');
const app = require('../index');
const mongoose = require('mongoose');
const News = require('../models/News');

describe('Only admin can post news', () => {


  it('1.1 - POST /news should error if user is not admin', async () => {
    const userToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4MzgxNDZkMDc4NmNjYWM2NjUwNzk5MiIsImlhdCI6MTc0OTcyNzU0NCwiZXhwIjoxNzUyMzE5NTQ0fQ.GcmHeCB-hczdHcRi03o6Jnk0z32jA5kJzmq1DpJgkmQ';
    const res = await request(app)
      .post('/api/v1/news')
      .set('Authorization', `Bearer ${userToken}`)
      .field('title', 'News with image')
      .field('content', 'Testing image upload')
      .field('category', 'ข่าวกฎหมายใหม่')
      .attach('image', 'test/assets/test-image.png');

    expect(res.statusCode).toBe(403);
    expect(res.body).toHaveProperty('success', false);
    expect(res.body).toHaveProperty('message', 'User role user is not authorized to access this route');
  });


  it('1.2 - POST /news should fail without token', async () => {
    const res = await request(app)
      .post('/api/v1/news')
      .field('title', 'No token test')
      .field('content', 'Should fail')
      .field('category', 'ข่าวกฎหมายใหม่');

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('success', false);
    expect(res.body).toHaveProperty('message','Not authorize to access this route');
  });

  // 1.3: Admin successfully posts news
  it('1.3 - POST /news should succeed if user is admin', async () => {
    const adminToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4MjhkNDY1MTU1N2FhOTM4ZTMyMTBlYSIsImlhdCI6MTc0OTgwNzQ0MiwiZXhwIjoxNzUyMzk5NDQyfQ.JQnLJvlAiobRZ4nwVvDrqwdbdLU2VUvblOXPlMgBKPs'; // admin token
    const res = await request(app)
      .post('/api/v1/news')
      .set('Authorization', `Bearer ${adminToken}`)
      .field('title', 'Admin news')
      .field('content', 'Posted by admin')
      .field('category', 'กฎหมายครอบครัว')
      .attach('image', 'test/assets/test-image.png');


    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body.data).toHaveProperty('title', 'Admin news');

    const saved = await News.findOne({ title: 'Admin news' });
      expect(saved).not.toBeNull();
      expect(saved.category).toBe('กฎหมายครอบครัว');

  },20000);


});

afterAll(async () => {
  await mongoose.connection.close();
});
