'use strict';

import { Op } from 'sequelize';
import conn from '../../../config/database';
import { Request, Response } from 'express';
import { variable } from './gallery.variable';
import { helper } from '../../../helpers/helper';
import { repository } from './gallery.respository';
import { response } from '../../../helpers/response';

const date: string = helper.date();

const insertDetails = async (req: Request, gallery_id: number) => {
  const t = await conn.sequelize.transaction();

  if (req?.body?.detail_delete) {
    const detail_delete: any = JSON.parse(req?.body?.detail_delete);
    if (detail_delete?.length > 0) {
      const arrId = detail_delete.map((t: any) => t);
      await repository.deleteDetail({
        condition: { id: { [Op.in]: arrId } },
        transaction: t,
      });
    }
  }

  if (req?.body?.details) {
    const details: Array<{
      seq: number;
      status: number;
      description: string;
    }> = JSON.parse(req?.body?.details);

    let insert: Array<Object> = [];
    for (let i in details) {
      let path_image: any = null;
      const img: any = `detail_image_${details[i]?.seq}`;
      if (req?.files && req?.files[img]) {
        path_image = await helper.upload(req?.files[img], 'gallery');
      }

      insert.push({
        gallery_id: gallery_id,
        status: details[i]?.status,
        description: details[i]?.description,
        path_image: path_image,
        created_by: req?.user?.id,
        created_date: date,
      });
    }

    if (insert?.length > 0) {
      await repository.bulkCreateDetail({
        payload: insert,
        transaction: t,
      });
    }
  }
};

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
      });
      if (rows?.length < 1) return response.failed('Data not found', 404, res);

      const total: number = count?.length;
      return response.successDetail(
        'Data gallery',
        { total: total, values: rows },
        res
      );
    } catch (err) {
      return helper.catchError(`gallery index: ${err?.message}`, 500, res);
    }
  }

  public async create(req: Request, res: Response) {
    const t = await conn.sequelize.transaction();
    try {
      const check = await repository.detail({
        folder_name: req?.body?.folder_name,
      });
      if (check) return response.failed('Data already exists', 400, res);

      let path_thumbnail: any = null;
      if (req?.files && req?.files?.image) {
        const { path_doc } = await helper.resize(
          req?.files?.image,
          'gallery',
          250
        );
        path_thumbnail = path_doc;
      }

      const data: Object = helper.only(variable.fillable(), req?.body);
      const result = await repository.create({
        payload: {
          ...data,
          path_thumbnail: path_thumbnail,
          created_by: req?.user?.id,
        },
        transaction: t,
      });
      await insertDetails(req, result?.getDataValue('id'));

      await t.commit();
      return response.success(true, 'Data success saved', res);
    } catch (err) {
      await t.rollback();
      return helper.catchError(`gallery create: ${err?.message}`, 500, res);
    }
  }

  public async update(req: Request, res: Response) {
    const t = await conn.sequelize.transaction();
    try {
      const id: any = req.params.id || 0;
      const check = await repository.detail({ id: id });
      if (!check) return response.failed('Data not found', 404, res);

      let path_thumbnail: any = null;
      if (req?.files && req?.files?.image) {
        const { path_doc } = await helper.resize(
          req?.files?.image,
          'gallery',
          250
        );
        path_thumbnail = path_doc;
      }

      const data: Object = helper.only(variable.fillable(), req?.body);
      await repository.update({
        payload: {
          ...data,
          path_thumbnail: path_thumbnail,
          modified_by: req?.user?.id,
        },
        condition: { id: id },
        transaction: t,
      });
      await insertDetails(req, id);

      await t.commit();
      return response.success(true, 'Data success updated', res);
    } catch (err) {
      await t.rollback();
      return helper.catchError(`gallery update: ${err?.message}`, 500, res);
    }
  }

  public async delete(req: Request, res: Response) {
    const t = await conn.sequelize.transaction();
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
        transaction: t,
      });
      await repository.updateDetail({
        payload: {
          status: 9,
          modified_by: req?.user?.id,
          modified_date: date,
        },
        condition: { gallery_id: id },
        transaction: t,
      });

      await t.commit();
      return response.success(true, 'Data success deleted', res);
    } catch (err) {
      await t.rollback();
      return helper.catchError(`gallery delete: ${err?.message}`, 500, res);
    }
  }
}
export const gallery = new Controller();
