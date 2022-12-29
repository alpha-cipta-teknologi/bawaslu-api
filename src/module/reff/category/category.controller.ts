'use strict';

import { variable } from './category.variable';
import conn from '../../../config/database';
import { Request, Response } from 'express';
import { helper } from '../../../helpers/helper';
import { repository } from './category.respository';
import { response } from '../../../helpers/response';

export default class Controller {
  public async list(req: Request, res: Response) {
    try {
      const result = await repository.list();
      if (result?.length < 1)
        return response.failed('Data not found', 404, res);
      return response.successList('list data category', result, res);
    } catch (err) {
      return helper.catchError(`category all-data: ${err?.message}`, 500, res);
    }
  }

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
      return response.successDetail(
        'Data category',
        { total: count, values: rows },
        res
      );
    } catch (err) {
      return helper.catchError(`category index: ${err?.message}`, 500, res);
    }
  }

  public async create(req: Request, res: Response) {
    try {
      const check = await repository.detail({
        category_name: req?.body?.category_name,
      });
      if (check) return response.failed('Data already exists', 400, res);

      let icon_image: any = null;
      if (req?.files && req?.files?.icon_image) {
        const { path_doc } = await helper.resize(
          req?.files?.icon_image,
          'category',
          250
        );
        icon_image = path_doc;
      }

      const data: Object = helper.only(variable.fillable(), req?.body);
      await repository.create({
        payload: {
          ...data,
          icon_image: icon_image,
          created_by: req?.user?.id,
        },
      });
      return response.success(true, 'Data success saved', res);
    } catch (err) {
      return helper.catchError(`category create: ${err?.message}`, 500, res);
    }
  }

  public async update(req: Request, res: Response) {
    try {
      const id: any = req.params.id || 0;
      const check = await repository.detail({ id: id });
      if (!check) return response.failed('Data not found', 404, res);

      let icon_image: any = null;
      if (req?.files && req?.files?.icon_image) {
        const { path_doc } = await helper.resize(
          req?.files?.icon_image,
          'category',
          250
        );
        icon_image = path_doc;
      }

      const data: Object = helper.only(variable.fillable(), req?.body, true);
      await repository.update({
        payload: {
          ...data,
          icon_image: icon_image || check?.getDataValue('icon_image'),
          modified_by: req?.user?.id,
        },
        condition: { id: id },
      });
      return response.success(true, 'Data success updated', res);
    } catch (err) {
      return helper.catchError(`category update: ${err?.message}`, 500, res);
    }
  }

  public async delete(req: Request, res: Response) {
    try {
      const id: any = req.params.id || 0;
      const date: string = helper.date();
      const check = await repository.detail({ id: id });
      if (!check) return response.failed('Data not found', 404, res);
      await repository.delete({
        condition: { id: id },
      });
      return response.success(true, 'Data success deleted', res);
    } catch (err) {
      return helper.catchError(`category delete: ${err?.message}`, 500, res);
    }
  }
}
export const category = new Controller();
