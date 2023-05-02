import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { ArticlesService } from './../src/articles/articles.service';
import sampleData from './utils/sample-data';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let articlesService: ArticlesService;
  let token: string;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    articlesService = moduleFixture.get<ArticlesService>(ArticlesService);
    await app.init();

    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        username: 'test',
        password: 'test',
      });

    token = response.body.access_token;
  });

  beforeEach(async () => {
    await articlesService.removeAll();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/ (GET)', async () => {
    const response = await request(app.getHttpServer()).get('/');
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      status: 'ok',
      time: expect.any(Number),
    });
  });

  it('/auth/login (POST)', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        username: 'test',
        password: 'test',
      });
    expect(response.statusCode).toBe(201);
    expect(response.body).toEqual({
      access_token: expect.any(String),
    });
  });

  it('/api/articles (GET) - should work without aplying filters', async () => {
    await articlesService.insertMany(sampleData.hits);

    const articlesResponse = await request(app.getHttpServer())
      .get('/articles')
      .set('Authorization', `Bearer ${token}`);

    expect(articlesResponse.statusCode).toBe(200);
    expect(articlesResponse.body).toEqual({
      hits: expect.any(Array),
      nbHits: 20,
      page: 1,
      nbPages: 4,
    });
  });

  it('/api/articles (GET) - should work with aplying author filter', async () => {
    await articlesService.insertMany(sampleData.hits);

    const articlesResponse = await request(app.getHttpServer())
      .get('/articles?tags=story&author=Gluber')
      .set('Authorization', `Bearer ${token}`);

    expect(articlesResponse.statusCode).toBe(200);
    expect(articlesResponse.body).toEqual({
      hits: expect.any(Array),
      nbHits: 1,
      page: 1,
      nbPages: 1,
    });
    expect(articlesResponse.body.hits[0].author).toBe('Gluber');
    expect(articlesResponse.body.hits[0]._tags).toContain('story');
  });

  it('/api/articles (GET) - should work with aplying title filter', async () => {
    await articlesService.insertMany(sampleData.hits);

    const articlesResponse = await request(app.getHttpServer())
      .get('/articles?tags=story&title=Ask HN: Data Management for AI Training')
      .set('Authorization', `Bearer ${token}`);

    expect(articlesResponse.statusCode).toBe(200);
    expect(articlesResponse.body).toEqual({
      hits: expect.any(Array),
      nbHits: 1,
      page: 1,
      nbPages: 1,
    });

    expect(articlesResponse.body.hits[0].title).toBe(
      'Ask HN: Data Management for AI Training',
    );
  });

  it('/api/articles (GET) - should work with aplying month filter', async () => {
    await articlesService.insertMany(sampleData.hits);

    const articlesResponse = await request(app.getHttpServer())
      .get('/articles?month=May')
      .set('Authorization', `Bearer ${token}`);

    expect(articlesResponse.statusCode).toBe(200);
    expect(articlesResponse.body).toEqual({
      hits: expect.any(Array),
      nbHits: 1,
      page: 1,
      nbPages: 1,
    });

    expect(articlesResponse.body.hits[0].created_at).toBe(
      '2023-05-01T14:45:35.000Z',
    );
  });
});
