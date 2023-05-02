import { Test, TestingModule } from '@nestjs/testing';
import axios from 'axios';
import { ArticlesScheduleService } from './articles-schedule.service';
import { ArticlesService } from '../articles/articles.service';
import { getModelToken } from '@nestjs/mongoose';
import sampleData from '../../test/utils/sample-data';

describe('ArticlesScheduleService', () => {
  let service: ArticlesScheduleService;
  let articlesService: ArticlesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ArticlesScheduleService,
        ArticlesService,
        {
          provide: getModelToken('Article'),
          useValue: {
            new: jest.fn().mockResolvedValue({}),
            constructor: jest.fn().mockResolvedValue({}),
            find: jest.fn(),
          },
        },
      ],
    }).compile();
    service = module.get<ArticlesScheduleService>(ArticlesScheduleService);
    articlesService = module.get<ArticlesService>(ArticlesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Fetch articles', () => {
    it('should fetch articles and insert articles', async () => {
      const findLastSpy = jest
        .spyOn(articlesService, 'findLast')
        .mockResolvedValue({
          created_at_i: 123456789,
        } as any);

      const insertManySpy = jest
        .spyOn(articlesService, 'insertMany')
        .mockResolvedValueOnce({} as any);

      const loggerSpy = jest.spyOn(service['logger'], 'log');

      jest.spyOn(axios, 'get').mockResolvedValueOnce({
        data: sampleData,
      });

      const lookupArticlesFromApiSpy = jest.spyOn(
        service as any,
        'lookupArticlesFromApi',
      );

      await service.fetchArticles();

      expect(findLastSpy).toBeCalled();
      expect(lookupArticlesFromApiSpy).toBeCalledWith('created_at_i>123456789');
      expect(insertManySpy).toBeCalledWith(sampleData.hits);
      expect(loggerSpy).toBeCalledTimes(2);
      expect(loggerSpy).toBeCalledWith('Running fetchArticles cron job');
      expect(loggerSpy).toBeCalledWith('Imported 20 articles');
    });
  });

  describe('Lookup articles from API', () => {
    it('should fetch and return articles', async () => {
      jest.spyOn(axios, 'get').mockResolvedValueOnce({
        data: sampleData,
      });

      const articles = await service['lookupArticlesFromApi']();
      expect(articles).toBeDefined();
      expect(articles.length).toBe(sampleData.hits.length);
    });

    it('should call hacker news API', async () => {
      const spy = jest.spyOn(axios, 'get').mockResolvedValueOnce({
        data: sampleData,
      });

      await service['lookupArticlesFromApi']();
      expect(spy).toBeCalledWith(
        'https://hn.algolia.com/api/v1/search_by_date?tags=story&query=nodejs&numericFilters=',
      );
    });

    it('should call hacker news API with numeric filters', async () => {
      const spy = jest.spyOn(axios, 'get').mockResolvedValueOnce({
        data: sampleData,
      });
      const numericFilters = 'created_at_i>123456789';

      await service['lookupArticlesFromApi'](numericFilters);
      expect(spy).toBeCalledWith(
        `https://hn.algolia.com/api/v1/search_by_date?tags=story&query=nodejs&numericFilters=${numericFilters}`,
      );
    });
  });
});
