const request = require('supertest');
const app = require('../index');
const mongoose = require('mongoose')

describe('Only admin can post news', () => {
  it('POST /news should error if you not admin!', async () => {
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4MzgxNDZkMDc4NmNjYWM2NjUwNzk5MiIsImlhdCI6MTc0OTcyNzU0NCwiZXhwIjoxNzUyMzE5NTQ0fQ.GcmHeCB-hczdHcRi03o6Jnk0z32jA5kJzmq1DpJgkmQ';
    const res = await request(app)
       .post('/api/v1/news')
       .set('Authorization', `Bearer ${token}`)
       .field('title', 'News with image')
       .field('content', 'Testing image upload')
       .field('category', 'ข่าวกฎหมายใหม่')
       .attach('image', 'test/assets/test-image.png');

    expect(res.statusCode).toBe(403);
    expect(res.body).toHaveProperty('success', false);
    expect(res.body).toHaveProperty('message','User role user is not authorized to access this route');
  });
});





afterAll(async () => {
  await mongoose.connection.close();
});
