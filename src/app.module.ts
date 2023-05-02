import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ArticlesModule } from './articles/articles.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { SchedulerModule } from './scheduler/scheduler.module';

const { MONGO_URI } = process.env;

@Module({
  imports: [
    MongooseModule.forRoot(MONGO_URI),
    process.env.NODE_ENV !== 'test' ? ScheduleModule.forRoot() : undefined,
    ArticlesModule,
    AuthModule,
    UsersModule,
    SchedulerModule,
  ].filter((module) => module),
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
