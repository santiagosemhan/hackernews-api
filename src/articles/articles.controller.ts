import {
  Controller,
  Get,
  Query,
  Param,
  Delete,
  UseGuards,
  NotFoundException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ArticlesService } from './articles.service';
import { Article } from './articles.schema';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import SearchArticlesDto from './search-articles.dto';

@Controller('articles')
@ApiBearerAuth('JWT')
@ApiTags('articles')
@UseGuards(JwtAuthGuard)
export class ArticlesController {
  private readonly logger = new Logger(ArticlesController.name);
  constructor(private readonly articlesService: ArticlesService) {}

  @Get(':id')
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, type: Article, isArray: false })
  async findOne(@Param('id') id: string): Promise<Article> {
    try {
      const article = await this.articlesService.findOne(id);
      if (!article) {
        throw new NotFoundException('Article not found');
      }
      return article;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(error);
      throw new InternalServerErrorException('Error while pulling the article');
    }
  }

  @Delete(':id')
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200 })
  async remove(@Param('id') id: string): Promise<{ id: string }> {
    try {
      const result = await this.articlesService.remove(id);
      if (!result) {
        throw new NotFoundException('Article not found');
      }
      return { id: result.objectID };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(error);
      throw new InternalServerErrorException(
        'Error while removing the article',
      );
    }
  }

  @Delete()
  @ApiResponse({
    status: 200,
    description: 'Remove all articles',
    schema: { type: 'object', properties: { message: { type: 'string' } } },
  })
  async removeAll() {
    try {
      const { deletedCount } = await this.articlesService.removeAll();
      return { message: 'All articles have been removed', deletedCount };
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(
        'Error while removing the articles',
      );
    }
  }

  @Get()
  @ApiQuery({ name: 'page', type: Number, required: false })
  @ApiQuery({ name: 'author', type: String, required: false })
  @ApiQuery({ name: '_tags', type: String, required: false })
  @ApiQuery({ name: 'title', type: String, required: false })
  @ApiQuery({ name: 'month', type: String, required: false })
  @ApiResponse({ status: 200, type: SearchArticlesDto, isArray: true })
  async search(
    @Query('page') page?: number,
    @Query('author') author?: string,
    @Query('_tags') tags?: string,
    @Query('title') title?: string,
    @Query('month') month?: string,
  ): Promise<SearchArticlesDto> {
    try {
      let tagsArray;

      if (tags) {
        tagsArray = tags.split(',');
      }
      const results = await this.articlesService.search(
        author,
        tagsArray,
        title,
        month,
        page,
      );
      return results;
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException('Error while searching articles');
    }
  }
}
