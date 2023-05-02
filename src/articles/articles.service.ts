import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Article } from './articles.schema';
import { isEmpty, turnMonthIntoNumber } from './utils';

export type SearchArticlesResult = {
  hits: Article[];
  nbHits: number;
  page: number;
  nbPages: number;
};

@Injectable()
export class ArticlesService {
  constructor(
    @InjectModel(Article.name) private articleModel: Model<Article>,
  ) {}

  async findOne(id: string) {
    const article = await this.articleModel.findOne({ objectID: id });
    if (!article || isEmpty(article)) {
      return null;
    }
    return article;
  }

  async findLast() {
    return this.articleModel.findOne().sort({ created_at_i: -1 });
  }

  async insertMany(articles: Article[]) {
    return this.articleModel.insertMany(articles);
  }

  async remove(id: string): Promise<Article> {
    return this.articleModel.findOneAndDelete({ objectID: id });
  }

  async removeAll() {
    return this.articleModel.deleteMany({});
  }

  async search(
    author?: string,
    tags?: string[],
    title?: string,
    month?: string,
    page = 1,
  ): Promise<SearchArticlesResult> {
    const itemsPerPage = 5;
    const startIndex = (page - 1) * itemsPerPage;

    const query = this.articleModel.find();

    if (author) {
      query.where('author', author);
    }
    if (tags && tags.length > 0) {
      query.where('_tags').in(tags);
    }
    if (title) {
      query.where('title', new RegExp(title, 'i'));
    }
    if (month) {
      const monthNumber = turnMonthIntoNumber(month);
      const year = new Date().getFullYear();
      const createdAtUnixTimestamp = Math.floor(
        new Date(year, monthNumber, 1).getTime() / 1000,
      );
      query.where('created_at_i').gte(createdAtUnixTimestamp);
    }

    const [totalDocuments, articles] = await Promise.all([
      query.clone().countDocuments(),
      query.skip(startIndex).limit(itemsPerPage).exec(),
    ]);
    const nbPages = Math.ceil(totalDocuments / itemsPerPage);

    return { hits: articles, nbHits: totalDocuments, page, nbPages };
  }

  async count() {
    return this.articleModel.countDocuments();
  }
}
