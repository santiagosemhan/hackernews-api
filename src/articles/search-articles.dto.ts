import { Article } from './articles.schema';
import { ApiProperty } from '@nestjs/swagger';

class searchArticlesDto {
  @ApiProperty({ type: [Article] })
  hits: Article[];
  @ApiProperty()
  nbHits: number;
  @ApiProperty()
  page: number;
  @ApiProperty()
  nbPages: number;
}

export default searchArticlesDto;
