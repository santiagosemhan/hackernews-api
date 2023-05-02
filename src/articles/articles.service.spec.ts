import { Test, TestingModule } from '@nestjs/testing';
import { ArticlesService } from '../articles/articles.service';
import { getModelToken } from '@nestjs/mongoose';
import { Article } from './articles.schema';
import { Model, Query } from 'mongoose';

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

describe('ArticlesService', () => {
  let service: ArticlesService;
  let model: Model<Article>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ArticlesService,
        {
          provide: getModelToken('Article'),
          useValue: {
            new: jest.fn().mockResolvedValue({}),
            constructor: jest.fn().mockResolvedValue({}),
            find: jest.fn(),
            findOne: jest.fn().mockReturnThis(),
            findOneAndDelete: jest.fn(),
            update: jest.fn(),
            create: jest.fn(),
            remove: jest.fn(),
            insertMany: jest.fn(),
            deleteMany: jest.fn(),
            countDocuments: jest.fn(),
            where: jest.fn(),
            sort: jest.fn(),
            exec: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ArticlesService>(ArticlesService);
    model = module.get<Model<Article>>(getModelToken('Article'));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOne', () => {
    it('should return an article', async () => {
      jest
        .spyOn(model, 'findOne')
        .mockReturnValueOnce(
          articleMock as unknown as Query<Article[], Article>,
        );

      expect(await service.findOne('1')).toBe(articleMock);
    });

    it('should return an internal server error', async () => {
      jest
        .spyOn(model, 'findOne')
        .mockRejectedValueOnce(new Error('Internal server error'));

      await expect(service.findOne('1')).rejects.toThrowError(
        'Internal server error',
      );
    });

    it('should return null when article not found', async () => {
      jest.spyOn(model, 'findOne').mockReturnValueOnce(null);

      await expect(service.findOne('1')).resolves.toBeNull();
    });
  });

  describe('findLast', () => {
    it('should return an array of articles sorted by created_at_i', async () => {
      const lastArticleMock = {
        ...articleMock,
        objectID: '2',
        created_at_i: 2,
      };

      const expected = [articleMock, lastArticleMock];

      jest.spyOn(model, 'findOne').mockReturnValueOnce({
        sort: jest
          .fn()
          .mockReturnValueOnce(
            expected.sort((a, b) => b.created_at_i - a.created_at_i)[0],
          ),
      } as unknown as Query<Article[], Article>);

      expect(await service.findLast()).toEqual(lastArticleMock);
    });

    it('should return an internal server error', async () => {
      jest.spyOn(model, 'findOne').mockReturnValueOnce({
        sort: jest
          .fn()
          .mockRejectedValueOnce(new Error('Internal server error')),
      } as unknown as Query<Article[], Article>);

      await expect(service.findLast()).rejects.toThrowError(
        'Internal server error',
      );
    });
  });

  describe('Insert many', () => {
    it('should insert many articles', async () => {
      const articleList = [articleMock, articleMock, articleMock];
      jest.spyOn(model, 'insertMany').mockReturnValueOnce(articleList);

      expect(await service.insertMany(articleList)).toEqual(articleList);
    });

    it('should return an internal server error', async () => {
      jest
        .spyOn(model, 'insertMany')
        .mockRejectedValueOnce(new Error('Error inserting articles'));

      await expect(service.insertMany([articleMock])).rejects.toThrowError(
        'Error inserting articles',
      );
    });
  });

  describe('Remove', () => {
    it('should remove an article', async () => {
      jest
        .spyOn(model, 'findOneAndDelete')
        .mockReturnValueOnce(
          articleMock as unknown as Query<Article[], Article>,
        );

      expect(await service.remove(articleMock.objectID)).toEqual(articleMock);
    });

    it('should return an internal server error', async () => {
      jest
        .spyOn(model, 'findOneAndDelete')
        .mockRejectedValueOnce(new Error('Error removing article'));

      await expect(service.remove('1')).rejects.toThrowError(
        'Error removing article',
      );
    });
  });

  describe('Remove all', () => {
    it('should remove all articles', async () => {
      jest.spyOn(model, 'deleteMany').mockReturnValueOnce({} as any);

      expect(await service.removeAll()).toEqual({});
    });

    it('should return an internal server error', async () => {
      jest
        .spyOn(model, 'deleteMany')
        .mockRejectedValueOnce(new Error('Error removing articles'));

      await expect(service.removeAll()).rejects.toThrowError(
        'Error removing articles',
      );
    });
  });

  describe('Count', () => {
    it('should return the number of articles', async () => {
      jest.spyOn(model, 'countDocuments').mockReturnValueOnce(1 as any);

      expect(await service.count()).toEqual(1);
    });

    it('should return an internal server error', async () => {
      jest
        .spyOn(model, 'countDocuments')
        .mockRejectedValueOnce(new Error('Error counting articles'));

      await expect(service.count()).rejects.toThrowError(
        'Error counting articles',
      );
    });
  });

  describe('Search', () => {
    it('should return articles', async () => {
      const articles = [];
      for (let i = 0; i < 20; i++) {
        const article = { ...articleMock };
        article.objectID = i.toString();
        article.title = `test${i}`;
        articles.push(article);
      }

      jest.spyOn(model, 'find').mockReturnValueOnce({
        where: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValueOnce(articles),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        clone: jest.fn().mockReturnThis(),
        countDocuments: jest.fn().mockResolvedValueOnce(articles.length),
      } as unknown as Query<Article[], Article>);

      jest.spyOn(model, 'find').mockReturnValueOnce(articles as any);
      expect(await service.search()).toEqual({
        hits: articles,
        nbHits: articles.length,
        page: 1,
        nbPages: 4,
      });
    });

    it('should search by author', async () => {
      const articles = [];

      const whereMock = jest.fn().mockReturnThis();
      jest.spyOn(model, 'find').mockReturnValueOnce({
        where: whereMock,
        exec: jest.fn().mockResolvedValueOnce(articles),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        clone: jest.fn().mockReturnThis(),
        countDocuments: jest.fn().mockResolvedValueOnce(articles.length),
      } as unknown as Query<Article[], Article>);

      expect(await service.search('test0')).toEqual({
        hits: [],
        nbHits: 0,
        page: 1,
        nbPages: 0,
      });

      expect(whereMock).toHaveBeenCalledWith('author', 'test0');
    });

    it('should search by title', async () => {
      const articles = [];

      const whereMock = jest.fn().mockReturnThis();
      jest.spyOn(model, 'find').mockReturnValueOnce({
        where: whereMock,
        exec: jest.fn().mockResolvedValueOnce(articles),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        clone: jest.fn().mockReturnThis(),
        countDocuments: jest.fn().mockResolvedValueOnce(articles.length),
      } as unknown as Query<Article[], Article>);

      expect(await service.search(null, null, 'a title')).toEqual({
        hits: [],
        nbHits: 0,
        page: 1,
        nbPages: 0,
      });

      expect(whereMock).toHaveBeenCalledWith('title', /a title/i);
    });

    it('should search by tags', async () => {
      const articles = [];

      const inMock = jest.fn().mockReturnThis();

      const whereMock = jest.fn().mockReturnValueOnce({
        in: inMock,
      });

      jest.spyOn(model, 'find').mockReturnValueOnce({
        where: whereMock,
        exec: jest.fn().mockResolvedValueOnce(articles),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        clone: jest.fn().mockReturnThis(),
        countDocuments: jest.fn().mockResolvedValueOnce(articles.length),
      } as unknown as Query<Article[], Article>);

      expect(await service.search(null, ['a tag', 'another tag'])).toEqual({
        hits: [],
        nbHits: 0,
        page: 1,
        nbPages: 0,
      });

      expect(whereMock).toHaveBeenCalledWith('_tags');
      expect(inMock).toHaveBeenCalledWith(['a tag', 'another tag']);
    });

    it('should search by month name', async () => {
      const articles = [];

      const gteMock = jest.fn().mockReturnThis();
      const whereMock = jest.fn().mockReturnValueOnce({
        gte: gteMock,
      });
      jest.spyOn(model, 'find').mockReturnValueOnce({
        where: whereMock,
        exec: jest.fn().mockResolvedValueOnce(articles),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        clone: jest.fn().mockReturnThis(),
        countDocuments: jest.fn().mockResolvedValueOnce(articles.length),
      } as unknown as Query<Article[], Article>);

      expect(await service.search(null, null, null, 'january')).toEqual({
        hits: [],
        nbHits: 0,
        page: 1,
        nbPages: 0,
      });

      expect(whereMock).toHaveBeenCalledWith('created_at_i');

      const year = new Date().getFullYear();
      const monthNumber = 0;

      expect(gteMock).toHaveBeenCalledWith(
        new Date(year, monthNumber, 1).getTime() / 1000,
      );
    });

    it('should return an internal server error', async () => {
      jest.spyOn(model, 'find').mockReturnValueOnce({
        where: jest.fn().mockReturnThis(),
        exec: jest
          .fn()
          .mockRejectedValueOnce(new Error('Error searching articles')),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        clone: jest.fn().mockReturnThis(),
        countDocuments: jest.fn().mockResolvedValueOnce(0),
      } as unknown as Query<Article[], Article>);

      await expect(service.search('test')).rejects.toThrowError(
        'Error searching articles',
      );
    });
  });
});
