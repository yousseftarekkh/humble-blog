import { ARTICLE_REPOSITORY } from './../constants';
import { Connection } from 'typeorm';
import { Article } from './article.entity';

export const articleProviders = [
  {
    provide: ARTICLE_REPOSITORY,
    useFactory: (connection: Connection) => {
      return connection.getRepository(Article);
    },
    inject: ['DATABASE_CONNECTION'],
  },
];
