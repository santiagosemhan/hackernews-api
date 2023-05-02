import { Module } from '@nestjs/common';
import { ArticlesScheduleService } from './articles-schedule.service';
import { ArticlesService } from '../articles/articles.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Article, ArticleSchema } from '../articles/articles.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Article.name, schema: ArticleSchema }]),
  ],
  providers: [ArticlesScheduleService, ArticlesService],
})
export class SchedulerModule {}
