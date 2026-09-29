import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/configure-app';

describe('HTTP API (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    configureApp(app);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /health returns a healthy response', async () => {
    const response = await request(app.getHttpServer()).get('/health').expect(200);

    expect(response.body).toEqual({
      status: 'ok',
      service: 'eos-phoenix-poc',
    });
  });

  it('GET /employees returns the full synthetic Phoenix employee list', async () => {
    const response = await request(app.getHttpServer()).get('/employees').expect(200);

    expect(response.body).toEqual([
      {
        id: 'phx-emp-001',
        displayName: 'Mira Calder',
        jobTitle: 'Platform Engineer',
        department: 'Engineering',
        status: 'active',
      },
      {
        id: 'phx-emp-002',
        displayName: 'Jonah Hale',
        jobTitle: 'Delivery Analyst',
        department: 'Delivery',
        status: 'active',
      },
      {
        id: 'phx-emp-003',
        displayName: 'Sera Quinn',
        jobTitle: 'Quality Specialist',
        department: 'Quality',
        status: 'inactive',
      },
      {
        id: 'phx-emp-004',
        displayName: 'Ellis Rowan',
        jobTitle: 'Evidence Coordinator',
        department: 'Operations',
        status: 'active',
      },
    ]);
  });

  it('GET /employees?name=Mira returns the matching employee', async () => {
    const response = await request(app.getHttpServer())
      .get('/employees?name=Mira')
      .expect(200);

    expect(response.body).toEqual([
      {
        id: 'phx-emp-001',
        displayName: 'Mira Calder',
        jobTitle: 'Platform Engineer',
        department: 'Engineering',
        status: 'active',
      },
    ]);
  });

  it('GET /employees?name= (case-insensitive) matches regardless of case', async () => {
    const response = await request(app.getHttpServer())
      .get('/employees?name=jonah%20hale')
      .expect(200);

    expect(response.body).toEqual([
      {
        id: 'phx-emp-002',
        displayName: 'Jonah Hale',
        jobTitle: 'Delivery Analyst',
        department: 'Delivery',
        status: 'active',
      },
    ]);
  });

  it('GET /employees?name= (whitespace-padded) trims and still matches', async () => {
    const response = await request(app.getHttpServer())
      .get('/employees?name=%20%20Sera%20Quinn%20%20')
      .expect(200);

    expect(response.body).toEqual([
      {
        id: 'phx-emp-003',
        displayName: 'Sera Quinn',
        jobTitle: 'Quality Specialist',
        department: 'Quality',
        status: 'inactive',
      },
    ]);
  });

  it('GET /employees?name=zzz-no-match returns []', async () => {
    const response = await request(app.getHttpServer())
      .get('/employees?name=zzz-no-match')
      .expect(200);

    expect(response.body).toEqual([]);
  });

  it('GET /employees?name= (empty) returns 400 Bad Request', async () => {
    await request(app.getHttpServer())
      .get('/employees?name=')
      .expect(400);
  });

  it('GET /employees?name=%20%20 (whitespace-only) returns 400 Bad Request', async () => {
    await request(app.getHttpServer())
      .get('/employees?name=%20%20')
      .expect(400);
  });

  it('GET /employees?name=Mira&name=Jonah (array) returns 400 Bad Request', async () => {
    await request(app.getHttpServer())
      .get('/employees?name=Mira&name=Jonah')
      .expect(400);
  });
});
