'use strict';

import conn from '../../../config/database';
import { Request, Response } from 'express';
import { helper } from '../../../helpers/helper';
import { variable } from './bawaslu.update.variable';
import { response } from '../../../helpers/response';
import { repository } from './bawaslu.update.respository';
import { transformer } from './bawaslu.update.transformer';
import { repository as repoLC } from '../like.comment/like.comment.repository';

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
      const total: number = count?.length;
      const bawasluUpdate = await transformer.list(rows);
      return response.successDetail(
        'Data bawaslu update',
        { total: total, values: bawasluUpdate },
        res
      );
    } catch (err) {
      return helper.catchError(
        `bawaslu update index: ${err?.message}`,
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
        created_by: req?.user?.id,
      });
      if (!result) return response.failed('Data not found', 404, res);
      const bawasluUpdate = await transformer.detail(result);
      return response.successDetail('Data bawaslu update', bawasluUpdate, res);
    } catch (err) {
      return helper.catchError(
        `bawaslu update detail: ${err?.message}`,
        500,
        res
      );
    }
  }

  public async create(req: Request, res: Response) {
    const t = await conn.sequelize.transaction();
    try {
      const check = await repository.check({
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
          'bawaslu_update',
          250
        );
        path_thumbnail = path_doc;

        // upload original
        path_image = await helper.upload(req?.files?.image, 'bawaslu update');
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
      return helper.catchError(
        `bawaslu update create: ${err?.message}`,
        500,
        res
      );
    }
  }

  public async update(req: Request, res: Response) {
    const t = await conn.sequelize.transaction();
    try {
      const id: any = req.params.id || 0;
      const check = await repository.check({
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
          'bawaslu_update',
          250
        );
        path_thumbnail = path_doc;

        // upload original
        path_image = await helper.upload(req?.files?.image, 'bawaslu update');
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
      return helper.catchError(
        `bawaslu update update: ${err?.message}`,
        500,
        res
      );
    }
  }

  public async delete(req: Request, res: Response) {
    const t = await conn.sequelize.transaction();
    try {
      const id: any = req.params.id || 0;
      const date: string = helper.date();
      const check = await repository.check({
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
      await repoLC.deleteLike({
        condition: {
          id_external: id,
          group_like: 2,
        },
        transaction: t,
      });
      await repoLC.updateComment({
        payload: {
          status: 9,
          modified_by: req?.user?.id,
          modified_date: date,
        },
        condition: {
          id_external: id,
          group_comment: 2,
        },
        transaction: t,
      });
      await t.commit();
      return response.success(true, 'Data success deleted', res);
    } catch (err) {
      await t.rollback();
      return helper.catchError(
        `bawaslu update delete: ${err?.message}`,
        500,
        res
      );
    }
  }
}

export const bawasluUpdate = new Controller();
