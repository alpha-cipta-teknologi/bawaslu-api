'use strict';

import { Op } from 'sequelize';
import { Request, Response } from 'express';
import { helper } from '../../helpers/helper';
import { response } from '../../helpers/response';
import { repository as RepoMenu } from '../app/menu/menu.respository';
import { repository as repoGallery } from '../reff/gallery/gallery.respository';
import { repository as repoArticle } from '../forum/article/article.respository';
import { repository as repoBWU } from '../forum/bawaslu.update/bawaslu.update.respository';

const nestedChildren = (data: any, parent: number = 0) => {
  let result: Array<object> = [];
  data.forEach((item: any) => {
    const menu: any = item?.dataValues;
    if (menu?.parent_id === parent) {
      let children: any = nestedChildren(data, menu?.menu_id);
      result.push({
        ...menu,
        children,
      });
    }
  });
  return result;
};

export default class Controller {
  public index(req: Request, res: Response) {
    return response.success(
      true,
      'Hello from the Bawaslu RESTful API  !!!!!',
      res
    );
  }

  public async navigation(req: Request, res: Response) {
    const result = await RepoMenu.list();
    if (result?.length < 1) return response.failed('Data not found', 404, res);
    const navigation = nestedChildren(result);
    return response.successList('Data navigation', navigation, res);
  }

  public async gallery(req: Request, res: Response) {
    try {
      const limit: any = req?.query?.perPage || 10;
      const offset: any = req?.query?.page || 1;
      const keyword: any = req?.query?.q;
      const { count, rows } = await repoGallery.index({
        limit: parseInt(limit),
        offset: parseInt(limit) * (parseInt(offset) - 1),
        keyword: keyword,
        condition: { status: 1 },
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

  public async article(req: Request, res: Response) {
    try {
      const limit: any = req?.query?.perPage || 10;
      const offset: any = req?.query?.page || 1;
      const keyword: any = req?.query?.q;
      const { count, rows } = await repoArticle.index({
        limit: parseInt(limit),
        offset: parseInt(limit) * (parseInt(offset) - 1),
        keyword: keyword,
        condition: { status: 1 },
        user_id: null,
      });
      if (rows?.length < 1) return response.failed('Data not found', 404, res);
      const total: number = count?.length;
      const article: Array<Object> = rows.map((item: any) => ({
        ...item?.dataValues,
        like: item?.like?.length > 0,
      }));
      return response.successDetail(
        'Data article',
        { total: total, values: article },
        res
      );
    } catch (err) {
      return helper.catchError(`article index: ${err?.message}`, 500, res);
    }
  }
  public async bwuIndex(req: Request, res: Response) {
    try {
      const limit: any = req?.query?.perPage || 10;
      const offset: any = req?.query?.page || 1;
      const keyword: any = req?.query?.q;
      const { count, rows } = await repoBWU.index({
        limit: parseInt(limit),
        offset: parseInt(limit) * (parseInt(offset) - 1),
        keyword: keyword,
        condition: { status: 1 },
        user_id: null,
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

  public async bwuDetail(req: Request, res: Response) {
    try {
      const slug: string = req.params.slug || '';
      const result: Object | any = await repoBWU.detail({
        condition: {
          slug: slug,
          status: 1,
        },
        user_id: null,
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
}

export const global = new Controller();
