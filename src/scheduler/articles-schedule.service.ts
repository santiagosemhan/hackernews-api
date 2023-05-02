import { Logger, Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import axios from 'axios';
import { Article } from '../articles/articles.schema';
import { ArticlesService } from '../articles/articles.service';

@Injectable()
export class ArticlesScheduleService {
  private readonly logger = new Logger(ArticlesScheduleService.name);
  private readonly apiUrl = 'https://hn.algolia.com/api/v1/';

  constructor(private readonly articlesService: ArticlesService) {}

  @Cron(
    process.env.NODE_ENV === 'production'
      ? CronExpression.EVERY_HOUR
      : CronExpression.EVERY_10_SECONDS,
  )
  async fetchArticles() {
    try {
      this.logger.log('Running fetchArticles cron job');
      const lastArticle = await this.articlesService.findLast();
      let numericFilters: string;
      if (lastArticle) {
        numericFilters = `created_at_i>${lastArticle.created_at_i}`;
      }
      const articles = await this.lookupArticlesFromApi(numericFilters);
      await this.articlesService.insertMany(articles);
      this.logger.log(`Imported ${articles.length} articles`);
    } catch (error) {
      this.logger.error(error);
    }
  }

  /**
   * Fetches articles from the API
   * @param {string} numericFilters - Numeric filters to be used in the API call
   * @returns {Promise<Article[]>} - Articles from the API
   */
  private async lookupArticlesFromApi(numericFilters = ''): Promise<Article[]> {
    const response = await axios.get(
      `${this.apiUrl}search_by_date?tags=story&query=nodejs&numericFilters=${numericFilters}`,
    );
    const { hits: articles } = response.data || {};
    return articles;
  }
}
