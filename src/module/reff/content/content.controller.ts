'use strict';

import { variable } from './content.variable';
import { Request, Response } from 'express';
import { helper } from '../../../helpers/helper';
import { repository } from './content.respository';
import { response } from '../../../helpers/response';

const date: string = helper.date();

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
      return response.successDetail(
        'Data content',
        { total: count, values: rows },
        res
      );
    } catch (err) {
      return helper.catchError(`content index: ${err?.message}`, 500, res);
    }
  }

  public async homeContent(req: Request, res: Response) {
    try {
      const result: Object | any = await repository.detail({
        seq: 1,
        status: 1,
      });
      if (!result) return response.failed('Data not found', 404, res);
      return response.successDetail('Data content', result, res);
    } catch (err) {
      return helper.catchError(`content detail: ${err?.message}`, 500, res);
    }
  }

  public async create(req: Request, res: Response) {
    try {
      const check = await repository.detail({
        header: req?.body?.header,
      });
      if (check) return response.failed('Data already exists', 400, res);

      let path_thumbnail: any = null;
      let path_image: any = null;
      if (req?.files && req?.files?.image) {
        // resize
        const { path_doc } = await helper.resize(
          req?.files?.image,
          'content',
          250
        );
        path_thumbnail = path_doc;

        // upload original
        path_image = await helper.upload(req?.files?.image, 'content');
      }

      let path_video: any = null;
      if (req?.files && req?.files?.image) {
        path_video = await helper.upload(req?.files?.video, 'content');
      }

      const data: Object = helper.only(variable.fillable(), req?.body);
      await repository.create({
        payload: {
          ...data,
          path_thumbnail: path_thumbnail,
          path_image: path_image,
          path_video: path_video,
          created_by: req?.user?.id,
        },
      });
      return response.success(true, 'Data success saved', res);
    } catch (err) {
      return helper.catchError(`content create: ${err?.message}`, 500, res);
    }
  }

  public async update(req: Request, res: Response) {
    try {
      const id: any = req.params.id || 0;
      const check = await repository.detail({ id: id });
      if (!check) return response.failed('Data not found', 404, res);

      let path_thumbnail: any = null;
      let path_image: any = null;
      if (req?.files && req?.files?.image) {
        // resize
        const { path_doc } = await helper.resize(
          req?.files?.image,
          'content',
          250
        );
        path_thumbnail = path_doc;

        // upload original
        path_image = await helper.upload(req?.files?.image, 'content');
      }

      let path_video: any = null;
      if (req?.files && req?.files?.image) {
        path_video = await helper.upload(req?.files?.video, 'content');
      }

      const data: Object = helper.only(variable.fillable(), req?.body, true);
      await repository.update({
        payload: {
          ...data,
          path_thumbnail:
            path_thumbnail || check?.getDataValue('path_thumbnail'),
          path_image: path_image || check?.getDataValue('path_image'),
          path_video: path_video || check?.getDataValue('path_video'),
          modified_by: req?.user?.id,
        },
        condition: { id: id },
      });
      return response.success(true, 'Data success updated', res);
    } catch (err) {
      return helper.catchError(`content update: ${err?.message}`, 500, res);
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
      return helper.catchError(`content delete: ${err?.message}`, 500, res);
    }
  }
}
export const content = new Controller();
