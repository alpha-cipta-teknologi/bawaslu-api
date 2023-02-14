'use strict';

import { Op } from 'sequelize';
import { Request, Response } from 'express';
import { helper } from '../../../helpers/helper';
import { response } from '../../../helpers/response';
import { variable } from './report.article.variable';
import { repository } from './report.article.respository';
import { repository as repoArticle } from '../../forum/article/article.respository';

const date: string = helper.date();

export default class Controller {
  public async index(req: Request, res: Response) {
    try {
      const limit: any = req?.query?.perPage || 10;
      const offset: any = req?.query?.page || 1;
      const keyword: any = req?.query?.q;
      const conditionArea: object = helper.conditionArea(req?.user);
      const { count, rows } = await repository.index({
        limit: parseInt(limit),
        offset: parseInt(limit) * (parseInt(offset) - 1),
        keyword: keyword,
        condition: conditionArea,
      });
      if (rows?.length < 1) return response.failed('Data not found', 404, res);
      return response.successDetail(
        'Data report article',
        { total: count, values: rows },
        res
      );
    } catch (err) {
      return helper.catchError(
        `report article index: ${err?.message}`,
        500,
        res
      );
    }
  }

  public async detail(req: Request, res: Response) {
    try {
      const id: any = req.params.id || 0;
      const result: Object | any = await repository.detail({
        id: id,
      });
      if (!result) return response.failed('Data not found', 404, res);
      return response.successDetail('Data report article', result, res);
    } catch (err) {
      return helper.catchError(
        `report.article detail: ${err?.message}`,
        500,
        res
      );
    }
  }

  public async create(req: Request, res: Response) {
    try {
      const { article_id } = req?.body;
      const data: Object = helper.only(variable.fillable(), req?.body);
      const id: number = article_id?.value;
      if (!id) return response.failed('Article must be selected', 500, res);
      const article = await repoArticle.detail({
        condition: {
          id: id,
          status: { [Op.ne]: 9 },
        },
        user_id: null,
      });
      const author = article?.getDataValue('author');
      await repository.create({
        payload: {
          ...data,
          article_id: id,
          created_by: req?.user?.id,
          area_province_id: author?.area_province_id || 0,
          area_regencies_id: author?.area_regencies_id || 0,
        },
      });
      return response.success(true, 'Data success saved', res);
    } catch (err) {
      return helper.catchError(
        `report article create: ${err?.message}`,
        500,
        res
      );
    }
  }

  public async update(req: Request, res: Response) {
    try {
      const id: any = req.params.id || 0;
      const check = await repository.detail({ id: id });
      if (!check) return response.failed('Data not found', 404, res);

      const { article_id } = req?.body;
      const data: Object = helper.only(variable.fillable(), req?.body, true);
      await repository.update({
        payload: {
          ...data,
          article_id: article_id?.value || check?.getDataValue('article_id'),
          modified_by: req?.user?.id,
        },
        condition: { id: id },
      });
      return response.success(true, 'Data success updated', res);
    } catch (err) {
      return helper.catchError(
        `report article update: ${err?.message}`,
        500,
        res
      );
    }
  }

  public async delete(req: Request, res: Response) {
    try {
      const id: any = req.params.id || 0;
      const date: string = helper.date();
      const check = await repository.detail({ id: id });
      if (!check) return response.failed('Data not found', 404, res);
      await repository.update({
        payload: {
          status: 9,
          modified_by: req?.user?.id,
          modified_date: date,
        },
        condition: { id: id },
      });
      return response.success(true, 'Data success deleted', res);
    } catch (err) {
      return helper.catchError(
        `report article delete: ${err?.message}`,
        500,
        res
      );
    }
  }
}
export const article = new Controller();
