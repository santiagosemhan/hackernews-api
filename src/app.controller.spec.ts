import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { getModelToken } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [AuthModule],
      controllers: [AppController],
      providers: [
        AppService,
        {
          provide: getModelToken('Article'),
          useValue: {
            new: jest.fn().mockResolvedValue({}),
            constructor: jest.fn().mockResolvedValue({}),
            find: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            create: jest.fn(),
            remove: jest.fn(),
            exec: jest.fn(),
          },
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('healthcheck', () => {
    it('should return an object', () => {
      const status = appController.healthCheck();
      expect(status).toBeInstanceOf(Object);
      expect(status).toHaveProperty('status');
      expect(status).toHaveProperty('time');
    });

    it('should return a date string', () => {
      const { time } = appController.healthCheck();
      const expected = new Date(time);
      expect(expected).toBeInstanceOf(Date);
      expect(expected.getTime()).toBeLessThanOrEqual(Date.now() + 5000);
    });
  });
});
