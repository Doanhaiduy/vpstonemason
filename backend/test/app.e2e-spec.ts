import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';

describe('vpstonemason API (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('/api/showroom (GET) should return showroom settings', () => {
    return request(app.getHttpServer()).get('/api/showroom').expect(200);
  });

  it('/api/stones (GET) should return stone list', () => {
    return request(app.getHttpServer()).get('/api/stones').expect(200);
  });

  it('/api/stone-categories (GET) should return categories', () => {
    return request(app.getHttpServer())
      .get('/api/stone-categories')
      .expect(200);
  });

  it('/api/projects (GET) should return projects', () => {
    return request(app.getHttpServer()).get('/api/projects').expect(200);
  });

  it('/api/blog-posts (GET) should return published posts', () => {
    return request(app.getHttpServer()).get('/api/blog-posts').expect(200);
  });

  it('/api/auth/login (POST) should reject invalid credentials', () => {
    return request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'bad@email.com', password: 'wrong' })
      .expect(401);
  });
});
