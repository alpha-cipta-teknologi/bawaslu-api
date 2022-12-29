'use strict';

import conn from '../../config/database';
import { Request, Response } from 'express';
import { helper } from '../../helpers/helper';
import { repository } from './notif.respository';
import { response } from '../../helpers/response';

export default class Controller {
  public async index(req: Request, res: Response) {
    try {
      const limit: any = req?.query?.perPage || 10;
      const offset: any = req?.query?.page || 1;
      const keyword: any = req?.query?.q;
      const type: any = req?.query?.type || 0;
      let condition: Object = {};
      if (['1', '2'].includes(type)) {
        condition = { status: type };
      }
      const { count, rows } = await repository.index({
        limit: parseInt(limit),
        offset: parseInt(limit) * (parseInt(offset) - 1),
        keyword: keyword,
        condition: {
          ...condition,
          resource_id: req?.user?.id,
        },
      });
      if (rows?.length < 1) return response.failed('Data not found', 404, res);
      return response.successDetail(
        'Data notif',
        { total: count, values: rows },
        res
      );
    } catch (err) {
      return helper.catchError(`notif index: ${err?.message}`, 500, res);
    }
  }

  public async read(req: Request, res: Response) {
    try {
      const id: any = req.params.id || 0;
      const check = await repository.detail({
        id: id,
        resource_id: req?.user?.id,
      });
      if (!check) return response.failed('Data not found', 404, res);
      await repository.update({
        payload: { status: 1 },
        condition: { id: id },
      });
      return response.success(true, 'Data success updated', res);
    } catch (err) {
      return helper.catchError(`notif update: ${err?.message}`, 500, res);
    }
  }
}
export const notif = new Controller();
