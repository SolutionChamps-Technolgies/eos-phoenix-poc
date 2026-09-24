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

  it('GET /employees returns the synthetic Phoenix employees', async () => {
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
});
