import { ARTICLE_REPOSITORY, AUTHOR_REPOSITORY } from './../constants';
import { Author } from './../author/author.entity';
import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Article } from './article.entity';
import { CreateArticleDto } from './dto/create-article.dto';

@Injectable()
export class ArticleService {
  constructor(
    @Inject(ARTICLE_REPOSITORY)
    readonly articlesRepository: Repository<Article>,
    @Inject(AUTHOR_REPOSITORY)
    readonly authorsRepository: Repository<Author>,
  ) {}

  async create(articleData: CreateArticleDto): Promise<Article> {
    const article = new Article();
    const author = await this.authorsRepository.findOne(articleData.author);
    if (!author)
      throw new HttpException("Couldn't find the author", HttpStatus.NOT_FOUND);
    article.body = articleData.body;
    article.title = articleData.title;
    article.author = author;

    const newArticle = await this.articlesRepository.save(article);
    return newArticle;
  }

  async findAll(query: string, byThumbsUp: boolean): Promise<Article[]> {
    const qb = await this.articlesRepository.createQueryBuilder('article');
    if (query)
      qb.where('article.body like :query OR article.title like :query', {
        query: `%${query}%`,
      });
    if (byThumbsUp) qb.orderBy('article.thumbsUp', 'DESC');
    return qb.getMany();
  }

  async findById(articleId: number): Promise<Article> {
    const article = await this.articlesRepository.findOne(articleId, {
      relations: ['comments', 'author'],
    });
    if (!article)
      throw new HttpException(
        "Couldn't find the article",
        HttpStatus.NOT_FOUND,
      );
    return article;
  }

  async update(articleId: number, thumbsUp: boolean): Promise<Article> {
    const article = await this.articlesRepository.findOne(articleId, {
      relations: ['comments', 'author'],
    });
    if (!article)
      throw new HttpException(
        "Couldn't find the article",
        HttpStatus.NOT_FOUND,
      );
    article.thumbsUp += thumbsUp ? 1 : 0;
    const updateArticle = await this.articlesRepository.save(article);
    return updateArticle;
  }
}
