'use strict';

import { Request, Response } from 'express';
import { helper } from '../../helpers/helper';
import { repository } from './area.repository';
import { response } from '../../helpers/response';

export default class Controller {
  public async province(req: Request, res: Response) {
    try {
      const result = await repository.province();
      if (result?.length < 1)
        return response.failed('Data not found', 404, res);
      return response.successDetail('Data province', result, res);
    } catch (err) {
      return helper.catchError(`province: ${err?.message}`, 500, res);
    }
  }

  public async regency(req: Request, res: Response) {
    try {
      const id: number = +(req.params.id || 0);
      const result = await repository.regency({
        area_province_id: id,
      });
      if (result?.length < 1)
        return response.failed('Data not found', 404, res);
      return response.successDetail('Data regency', result, res);
    } catch (err) {
      return helper.catchError(`regency: ${err?.message}`, 500, res);
    }
  }
}

export const area = new Controller();