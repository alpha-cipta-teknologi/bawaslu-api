'use strict';

import { Op } from 'sequelize';
import conn from '../../../config/database';
import { Request, Response } from 'express';
import { helper } from '../../../helpers/helper';
import { variable } from './bawaslu.update.variable';
import { response } from '../../../helpers/response';
import { repository } from './bawaslu.update.respository';
import { repository as repoLC } from '../like.comment/like.comment.repository';

export default class Controller {
  public async index(req: Request, res: Response) {
    try {
      const limit: any = req?.query?.perPage || 10;
      const offset: any = req?.query?.page || 1;
      const keyword: any = req?.query?.q;
      const type: any = req?.query?.type;
      let condition: any = {
        status: { [Op.ne]: 9 },
      };
      if (type && type == 'fe') {
        condition = {
          status: 1,
        };
      }
      const { count, rows } = await repository.index({
        limit: parseInt(limit),
        offset: parseInt(limit) * (parseInt(offset) - 1),
        keyword: keyword,
        condition: condition,
        user_id: req?.user?.id || null,
      });
      if (rows?.length < 1) return response.failed('Data not found', 404, res);
      const total: number = count?.length;
      const bawasluUpdate: Array<Object> = rows.map((item: any) => ({
        ...item?.dataValues,
        like: item?.like?.length > 0,
      }));
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
      const slug: string = req.params.slug || '';
      const result: Object | any = await repository.detail({
        condition: {
          slug: slug,
          status: { [Op.ne]: 9 },
        },
        user_id: req?.user?.id || null,
      });
      if (!result) return response.failed('Data not found', 404, res);
      const bawasluUpdate: Object = {
        ...result?.dataValues,
        like: result?.like?.length > 0,
      };
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
      const body: any = req?.body;
      if (!body?.title) return response.failed('Title is required', 422, res);

      let slug: string = helper.slug(body?.title);
      const checkSlug = await repository.check({
        slug: slug,
      });
      if (checkSlug) slug = slug + 1;

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
        path_image = await helper.upload(req?.files?.image, 'bawaslu_update');
      }

      const data: Object = helper.only(variable.fillable(), body);
      await repository.create({
        payload: {
          ...data,
          slug: slug,
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
        status: { [Op.ne]: 9 },
      });
      if (!check) return response.failed('Data not found', 404, res);

      const body: any = req?.body;
      if (!body?.title) return response.failed('Title is required', 422, res);

      let slug: string = check?.getDataValue('slug');
      if (body?.title != check?.getDataValue('title')) {
        slug = helper.slug(body?.title);
        const checkSlug = await repository.check({
          slug: slug,
        });
        if (checkSlug) slug = slug + 1;
      }

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
        path_image = await helper.upload(req?.files?.image, 'bawaslu_update');
      }

      const data: Object = helper.only(variable.fillable(), body, true);
      await repository.update({
        payload: {
          ...data,
          slug: slug,
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
        status: { [Op.ne]: 9 },
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
