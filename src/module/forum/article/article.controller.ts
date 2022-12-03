'use strict';

import { Op } from 'sequelize';
import { variable } from './article.variable';
import conn from '../../../config/database';
import { Request, Response } from 'express';
import { helper } from '../../../helpers/helper';
import { repository } from './article.respository';
import { response } from '../../../helpers/response';

export default class Controller {
  public async index(req: Request, res: Response) {
    try {
      const limit: any = req?.query?.perPage || 10;
      const offset: any = req?.query?.page || 1;
      const keyword: any = req?.query?.q;
      const { count, rows } = await repository.index({
        limit: parseInt(limit),
        offset: parseInt(limit) * (parseInt(offset) - 1),
        keyword: keyword,
        condition: req?.user?.is_public,
      });
      if (rows?.length < 1) return response.failed('Data not found', 404, res);
      return response.successDetail(
        'Data article',
        { total: count, values: rows },
        res
      );
    } catch (err) {
      return helper.catchError(`article index: ${err?.message}`, 500, res);
    }
  }

  public async create(req: Request, res: Response) {
    const t = await conn.sequelize.transaction();
    try {
      const check = await repository.detail({
        ...req?.user?.is_public,
        title: req?.body?.title,
      });
      if (check) return response.failed('Data already exists', 400, res);

      let path_thumbnail: any = null;
      let path_image: any = null;
      if (req?.files && req?.files?.image) {
        // resize
        const { path_doc } = await helper.resize(
          req?.files?.image,
          'article',
          250
        );
        path_thumbnail = path_doc;

        // upload original
        path_image = await helper.upload(req?.files?.image, 'article');
      }

      const data: Object = helper.only(variable.fillable(), req?.body);
      await repository.create({
        payload: {
          ...data,
          path_thumbnail: path_thumbnail,
          path_image: path_image,
          created_by: req?.user?.id,
        },
        transaction: t,
      });
      await t.commit();
      return response.success(true, 'Data success saved', res);
    } catch (err) {
      await t.rollback();
      return helper.catchError(`article create: ${err?.message}`, 500, res);
    }
  }

  public async update(req: Request, res: Response) {
    const t = await conn.sequelize.transaction();
    try {
      const id: any = req.params.id || 0;
      const check = await repository.detail({
        id: id,
        ...req?.user?.is_public,
      });
      if (!check) return response.failed('Data not found', 404, res);

      let path_thumbnail: any = null;
      let path_image: any = null;
      if (req?.files && req?.files?.image) {
        // resize
        const { path_doc } = await helper.resize(
          req?.files?.image,
          'article',
          250
        );
        path_thumbnail = path_doc;

        // upload original
        path_image = await helper.upload(req?.files?.image, 'article');
      }

      const data: Object = helper.only(variable.fillable(), req?.body, true);
      await repository.update({
        payload: {
          ...data,
          path_thumbnail:
            path_thumbnail || check?.getDataValue('path_thumbnail'),
          path_image: path_image || check?.getDataValue('path_image'),
          modified_by: req?.user?.id,
        },
        condition: { id: id },
        transaction: t,
      });

      await t.commit();
      return response.success(true, 'Data success updated', res);
    } catch (err) {
      await t.rollback();
      return helper.catchError(`article update: ${err?.message}`, 500, res);
    }
  }

  public async delete(req: Request, res: Response) {
    const t = await conn.sequelize.transaction();
    try {
      const id: any = req.params.id || 0;
      const date: string = helper.date();
      const check = await repository.detail({
        id: id,
        ...req?.user?.is_public,
      });
      if (!check) return response.failed('Data not found', 404, res);
      await repository.update({
        payload: {
          status: 9,
          modified_by: req?.user?.id,
          modified_date: date,
        },
        condition: { id: id },
        transaction: t,
      });
      await t.commit();
      return response.success(true, 'Data success deleted', res);
    } catch (err) {
      await t.rollback();
      return helper.catchError(`article delete: ${err?.message}`, 500, res);
    }
  }
}

export const article = new Controller();
