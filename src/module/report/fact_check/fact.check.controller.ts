'use strict';

import { Op } from 'sequelize';
import { Request, Response } from 'express';
import { helper } from '../../../helpers/helper';
import { variable } from './fact.check.variable';
import { repository } from './fact.check.respository';
import { response } from '../../../helpers/response';

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
        condition: {
          status: { [Op.ne]: 9 },
        },
        conditionArea: conditionArea,
      });
      if (rows?.length < 1) return response.failed('Data not found', 404, res);
      return response.successDetail(
        'Data fact check results',
        { total: count, values: rows },
        res
      );
    } catch (err) {
      return helper.catchError(
        `fact check results index: ${err?.message}`,
        500,
        res
      );
    }
  }

  public async indexFE(req: Request, res: Response) {
    try {
      const limit: any = req?.query?.perPage || 10;
      const offset: any = req?.query?.page || 1;
      const keyword: any = req?.query?.q;
      const { count, rows } = await repository.index({
        limit: parseInt(limit),
        offset: parseInt(limit) * (parseInt(offset) - 1),
        keyword: keyword,
        condition: { status: 1 },
      });
      if (rows?.length < 1) return response.failed('Data not found', 404, res);
      return response.successDetail(
        'Data fact check results',
        { total: count, values: rows },
        res
      );
    } catch (err) {
      return helper.catchError(
        `fact check results index: ${err?.message}`,
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
      return response.successDetail('Data fact check results', result, res);
    } catch (err) {
      return helper.catchError(
        `fact check results detail: ${err?.message}`,
        500,
        res
      );
    }
  }

  public async create(req: Request, res: Response) {
    try {
      let path_image: any = null;
      let path_thumbnail: any = null;
      if (req?.files && req?.files?.image) {
        let checkFile = helper.checkExtention(req?.files?.image);
        if (checkFile != 'allowed') return response.failed(checkFile, 422, res);
        // resize
        const { path_doc } = await helper.resize(
          req?.files?.image,
          'factcheck',
          250
        );
        path_thumbnail = path_doc;

        // upload original
        path_image = await helper.upload(req?.files?.image, 'factcheck');
      }

      const data: Object = helper.only(variable.fillable(), req?.body);
      await repository.create({
        payload: {
          ...data,
          path_thumbnail: path_thumbnail,
          path_image: path_image,
          created_by: req?.user?.id,
        },
      });
      return response.success(true, 'Data success saved', res);
    } catch (err) {
      return helper.catchError(
        `fact check results create: ${err?.message}`,
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

      let path_image: any = null;
      let path_thumbnail: any = null;
      if (req?.files && req?.files?.image) {
        let checkFile = helper.checkExtention(req?.files?.image);
        if (checkFile != 'allowed') return response.failed(checkFile, 422, res);
        // resize
        const { path_doc } = await helper.resize(
          req?.files?.image,
          'factcheck',
          250
        );
        path_thumbnail = path_doc;

        // upload original
        path_image = await helper.upload(req?.files?.image, 'factcheck');
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
      });
      return response.success(true, 'Data success updated', res);
    } catch (err) {
      return helper.catchError(
        `fact check results update: ${err?.message}`,
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
        `fact check results delete: ${err?.message}`,
        500,
        res
      );
    }
  }
}
export const factcheck = new Controller();
