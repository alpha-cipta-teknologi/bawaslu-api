'use strict';

import { Request, Response } from 'express';
import { variable } from './kerjasama.variable';
import { helper } from '../../../helpers/helper';
import { repository } from './kerjasama.respository';
import { response } from '../../../helpers/response';

const date: string = helper.date();

export default class Controller {
  public async list(req: Request, res: Response) {
    try {
      const result = await repository.list();
      if (result?.length < 1)
        return response.failed('Data not found', 404, res);
      return response.successList('list data bentuk kerjasama', result, res);
    } catch (err) {
      return helper.catchError(
        `bentuk kerjasama all-data: ${err?.message}`,
        500,
        res
      );
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
        'Data bentuk kerjasama',
        { total: count, values: rows },
        res
      );
    } catch (err) {
      return helper.catchError(
        `bentuk kerjasama index: ${err?.message}`,
        500,
        res
      );
    }
  }

  public async create(req: Request, res: Response) {
    try {
      const check = await repository.detail({
        nama_kerjasama: req?.body?.nama_kerjasama,
      });
      if (check) return response.failed('Data already exists', 400, res);
      const data: Object = helper.only(variable.fillable(), req?.body);
      await repository.create({
        payload: { ...data, created_by: req?.user?.id || 0 },
      });
      return response.success(true, 'Data success saved', res);
    } catch (err) {
      return helper.catchError(
        `bentuk kerjasama create: ${err?.message}`,
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
      const data: Object = helper.only(variable.fillable(), req?.body, true);
      await repository.update({
        payload: { ...data, modified_by: req?.user?.id || 0 },
        condition: { id: id },
      });
      return response.success(true, 'Data success updated', res);
    } catch (err) {
      return helper.catchError(
        `bentuk kerjasama update: ${err?.message}`,
        500,
        res
      );
    }
  }

  public async delete(req: Request, res: Response) {
    try {
      const id: any = req.params.id || 0;
      const check = await repository.detail({ id: id });
      if (!check) return response.failed('Data not found', 404, res);
      await repository.update({
        payload: {
          status: 9,
          modified_by: req?.user?.id || 0,
          modified_date: date,
        },
        condition: { id: id },
      });
      return response.success(true, 'Data success deleted', res);
    } catch (err) {
      return helper.catchError(
        `bentuk kerjasama delete: ${err?.message}`,
        500,
        res
      );
    }
  }
}

export const kerjasama = new Controller();
