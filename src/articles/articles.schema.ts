import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type ArticleDocument = HydratedDocument<Article>;

@Schema()
export class Article {
  @ApiProperty()
  @Prop({ required: true })
  created_at: string;

  @ApiProperty()
  @Prop({ required: true })
  author: string;

  @ApiProperty()
  @Prop({ type: [String], required: true })
  _tags: string[];

  @ApiProperty()
  @Prop()
  title: string;

  @ApiProperty()
  @Prop()
  url: string;

  @ApiProperty()
  @Prop()
  points: number;

  @ApiProperty()
  @Prop()
  story_text: string;

  @ApiProperty()
  @Prop()
  comment_text: string;

  @ApiProperty()
  @Prop()
  num_comments: number;

  @ApiProperty()
  @Prop()
  story_id: number;

  @ApiProperty()
  @Prop()
  story_title: string;

  @ApiProperty()
  @Prop()
  story_url: string;

  @ApiProperty()
  @Prop()
  parent_id: number;

  @ApiProperty()
  @Prop()
  created_at_i: number;

  @Prop()
  objectID: string;
}

export const ArticleSchema = SchemaFactory.createForClass(Article);
