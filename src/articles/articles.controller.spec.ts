import { Test, TestingModule } from '@nestjs/testing';
import { ArticlesController } from './articles.controller';
import { Article } from './articles.schema';
import { getModelToken } from '@nestjs/mongoose';
import { ArticlesService, SearchArticlesResult } from './articles.service';
import { Model, Query } from 'mongoose';
import { EmptyLogger } from '../../test/utils/emptyLogger';

const articleMock: Article = {
  objectID: '1',
  title: 'test',
  created_at: '2023-05-01T16:38:00.000Z',
  created_at_i: 1,
  _tags: ['test'],
  author: 'test',
  url: 'test',
  points: 1,
  story_text: 'test',
  comment_text: 'test',
  num_comments: 1,
  story_id: 1,
  story_title: 'test',
  story_url: 'test',
  parent_id: 1,
};

describe('ArticlesController', () => {
  let controller: ArticlesController;
  let model: Model<Article>;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ArticlesController],
      providers: [
        ArticlesService,
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
            findOneAndDelete: jest.fn(),
            deleteMany: jest.fn(),
            exec: jest.fn(),
          },
        },
      ],
    }).compile();
    module.useLogger(new EmptyLogger());
    controller = module.get<ArticlesController>(ArticlesController);
    model = module.get<Model<Article>>(getModelToken('Article'));
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findOne', () => {
    it('should return an article', async () => {
      jest
        .spyOn(model, 'findOne')
        .mockReturnValueOnce(
          articleMock as unknown as Query<Article[], Article>,
        );

      expect(await controller.findOne('1')).toBe(articleMock);
    });

    it('should return an internal server error', async () => {
      jest
        .spyOn(model, 'findOne')
        .mockRejectedValueOnce(new Error('Internal server error'));

      await expect(controller.findOne('1')).rejects.toThrowError(
        'Error while pulling the article',
      );
    });

    it('should return a not found error', async () => {
      jest.spyOn(model, 'findOne').mockReturnValueOnce(null);

      await expect(controller.findOne('1')).rejects.toThrowError(
        'Article not found',
      );
    });
  });

  describe('search', () => {
    it('should return an array of articles', async () => {
      const articles = [];
      for (let i = 0; i < 20; i++) {
        const article = { ...articleMock };
        article.objectID = i.toString();
        article.title = `test${i}`;
        articles.push(article);
      }

      jest.spyOn(model, 'find').mockReturnValueOnce({
        exec: jest.fn().mockResolvedValueOnce(articles.slice(0, 5)),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        clone: jest.fn().mockReturnThis(),
        countDocuments: jest.fn().mockResolvedValueOnce(articles.length),
      } as unknown as Query<Article[], Article>);

      const result: SearchArticlesResult = await controller.search();
      expect(result).toEqual({
        hits: articles.slice(0, 5),
        nbHits: 20,
        page: 1,
        nbPages: 4,
      });
      expect(result.hits.length).toBe(5);
    });

    it('should return an internal server error when error is thrown while fetching data', async () => {
      jest.spyOn(model, 'find').mockReturnValueOnce({
        exec: jest.fn().mockRejectedValueOnce(new Error('Error fetching data')),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        clone: jest.fn().mockReturnThis(),
        countDocuments: jest.fn().mockResolvedValueOnce(20),
      } as unknown as Query<Article[], Article>);

      await expect(controller.search()).rejects.toThrowError(
        'Error while searching articles',
      );
    });

    it('should return an internal server error when error is thrown while counting documents', async () => {
      jest.spyOn(model, 'find').mockReturnValueOnce({
        exec: jest.fn().mockResolvedValueOnce([]),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        clone: jest.fn().mockReturnThis(),
        countDocuments: jest
          .fn()
          .mockRejectedValueOnce(new Error('Error while counting documents')),
      } as unknown as Query<Article[], Article>);

      await expect(controller.search()).rejects.toThrowError(
        'Error while searching articles',
      );
    });
  });

  describe('remove one', () => {
    it('should remove and return the objectID', async () => {
      jest
        .spyOn(model, 'findOneAndDelete')
        .mockReturnValueOnce(
          articleMock as unknown as Query<Article[], Article>,
        );

      expect(await controller.remove('1')).toEqual({
        id: articleMock.objectID,
      });
    });

    it('should return an internal server error', async () => {
      jest
        .spyOn(model, 'findOneAndDelete')
        .mockRejectedValueOnce(new Error('Internal server error'));

      await expect(controller.remove('1')).rejects.toThrowError(
        'Error while removing the article',
      );
    });

    it('should return a not found error', async () => {
      jest.spyOn(model, 'findOneAndDelete').mockReturnValueOnce(null);

      await expect(controller.remove('1')).rejects.toThrowError(
        'Article not found',
      );
    });
  });

  describe('remove all', () => {
    it('should remove all articles', async () => {
      jest
        .spyOn(model, 'deleteMany')
        .mockReturnValueOnce({ deletedCount: 10 } as unknown as Query<
          any,
          any,
          Article
        >);

      expect(await controller.removeAll()).toEqual({
        message: 'All articles have been removed',
        deletedCount: 10,
      });
    });

    it('should return an internal server error', async () => {
      jest
        .spyOn(model, 'deleteMany')
        .mockRejectedValueOnce(new Error('Internal server error'));

      await expect(controller.removeAll()).rejects.toThrowError(
        'Error while removing the articles',
      );
    });
  });
});
