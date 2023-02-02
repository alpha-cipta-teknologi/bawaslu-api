'use strict';

import { Request, Response } from 'express';
import { helper } from '../../../helpers/helper';
import { repository } from './summary.respository';
import { response } from '../../../helpers/response';

const date: string = helper.date();

export default class Controller {
  public async pengguna(req: Request, res: Response) {
    try {
      const { q, province, regency } = req?.query;
      const limit: any = req?.query?.perPage || 10;
      const offset: any = req?.query?.page || 1;
      let condition: Object = {};
      if (province) {
        condition = {
          ...condition,
          area_province_id: province,
        };
      }
      if (regency) {
        condition = {
          ...condition,
          area_regencies_id: regency,
        };
      }
      const { count, rows } = await repository.pengguna({
        limit: parseInt(limit),
        offset: parseInt(limit) * (parseInt(offset) - 1),
        keyword: q,
        condition: condition,
      });
      if (rows?.length < 1) return response.failed('Data not found', 404, res);
      return response.successDetail(
        'Data summary pengguna',
        { total: count, values: rows },
        res
      );
    } catch (err) {
      return helper.catchError(`summary pengguna: ${err?.message}`, 500, res);
    }
  }

  public async penggunaKomunitas(req: Request, res: Response) {
    try {
      const { q, province, regency, komunitas } = req?.query;
      const limit: any = req?.query?.perPage || 10;
      const offset: any = req?.query?.page || 1;
      let condition: Object = {};
      if (province) {
        condition = {
          ...condition,
          area_province_id: province,
        };
      }
      if (regency) {
        condition = {
          ...condition,
          area_regencies_id: regency,
        };
      }
      if (komunitas) {
        condition = {
          ...condition,
          komunitas_id: komunitas,
        };
      }
      const { count, rows } = await repository.penggunaKomunitas({
        limit: parseInt(limit),
        offset: parseInt(limit) * (parseInt(offset) - 1),
        keyword: q,
        condition: condition,
      });
      if (rows?.length < 1) return response.failed('Data not found', 404, res);
      return response.successDetail(
        'Data summary pengguna per komuntias',
        { total: count, values: rows },
        res
      );
    } catch (err) {
      return helper.catchError(
        `summary pengguna per komuntias: ${err?.message}`,
        500,
        res
      );
    }
  }

  public async articleTema(req: Request, res: Response) {
    try {
      const { q, province, regency, tema } = req?.query;
      const limit: any = req?.query?.perPage || 10;
      const offset: any = req?.query?.page || 1;
      let condition: Object = {};
      if (province) {
        condition = {
          ...condition,
          area_province_id: province,
        };
      }
      if (regency) {
        condition = {
          ...condition,
          area_regencies_id: regency,
        };
      }
      if (tema) {
        condition = {
          ...condition,
          tema_id: tema,
        };
      }
      const { count, rows } = await repository.articleTema({
        limit: parseInt(limit),
        offset: parseInt(limit) * (parseInt(offset) - 1),
        keyword: q,
        condition: condition,
      });
      if (rows?.length < 1) return response.failed('Data not found', 404, res);
      return response.successDetail(
        'Data summary article per tema',
        { total: count, values: rows },
        res
      );
    } catch (err) {
      return helper.catchError(
        `summary article per tema: ${err?.message}`,
        500,
        res
      );
    }
  }

  public async articleKomunitas(req: Request, res: Response) {
    try {
      const { q, province, regency, komunitas } = req?.query;
      const limit: any = req?.query?.perPage || 10;
      const offset: any = req?.query?.page || 1;
      let condition: Object = {};
      if (province) {
        condition = {
          ...condition,
          area_province_id: province,
        };
      }
      if (regency) {
        condition = {
          ...condition,
          area_regencies_id: regency,
        };
      }
      if (komunitas) {
        condition = {
          ...condition,
          komunitas_id: komunitas,
        };
      }
      const { count, rows } = await repository.articleKomunitas({
        limit: parseInt(limit),
        offset: parseInt(limit) * (parseInt(offset) - 1),
        keyword: q,
        condition: condition,
      });
      if (rows?.length < 1) return response.failed('Data not found', 404, res);
      return response.successDetail(
        'Data summary article per komunitas',
        { total: count, values: rows },
        res
      );
    } catch (err) {
      return helper.catchError(
        `summary article per komunitas: ${err?.message}`,
        500,
        res
      );
    }
  }
}
export const summary = new Controller();
