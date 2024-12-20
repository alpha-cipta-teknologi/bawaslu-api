'use strict';

import axios from 'axios';
import dotenv from 'dotenv';
import { Request, Response } from 'express';
import { helper } from '../../helpers/helper';
import { response } from '../../helpers/response';
import { transformer } from '../global/global.transformer';
import { repository as RepoMenu } from '../app/menu/menu.respository';
import { repository as repoGallery } from '../reff/gallery/gallery.respository';
import { repository as repoArticle } from '../forum/article/article.respository';
import { repository as repoBWU } from '../forum/bawaslu.update/bawaslu.update.respository';

dotenv.config();

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
      const komunitas_id: any = req?.query?.komunitas_id;
      let condition: any = {
        status: 1,
      };
      if (komunitas_id) {
        condition = {
          ...condition,
          komunitas_id: komunitas_id,
        };
      }
      const { count, rows } = await repoArticle.index({
        limit: parseInt(limit),
        offset: parseInt(limit) * (parseInt(offset) - 1),
        keyword: keyword,
        condition: condition,
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

  public async trendingArticle(req: Request, res: Response) {
    try {
      const keyword: any = req?.query?.q;
      const { count, rows } = await repoArticle.trending({
        limit: 10,
        offset: 0,
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
      return response.successDetail('Data article', article, res);
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

  public sendmail = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, subject, content } = req?.body;
      if (!email) return response.failed('email is required', 422, res);
      if (!subject) return response.failed('subject is required', 422, res);
      if (!content) return response.failed('content is required', 422, res);

      let attachments: Array<Object> = [];
      if (req?.files && req?.files?.attachs) {
        const attachs = req?.files?.attachs;
        if (attachs?.length > 0) {
          for (let i in attachs) {
            attachments.push({
              filename: attachs[i]?.name,
              path: attachs[i]?.tempFilePath,
            });
          }
        } else {
          attachments.push({
            filename: attachs?.name,
            path: attachs?.tempFilePath,
          });
        }
      }

      await helper.sendEmail({
        to: email,
        subject: subject,
        content: content,
        attachments: attachments,
      });

      return response.success(true, 'Send email success', res);
    } catch (error) {
      const err: any = error;
      return helper.catchError(`sendmail: ${err?.message}`, 500, res);
    }
  };

  public async search(req: Request, res: Response) {
    try {
      const { q, user_id, komunitas_id, tema_id, perPage, page } = req?.query;
      const limit: any = perPage || 10;
      const offset: any = page || 1;
      const { result, count } = await repoArticle.search({
        limit: parseInt(limit),
        offset: parseInt(limit) * (parseInt(offset) - 1),
        keyword: q,
        user_id: user_id || 0,
        komunitas_id: komunitas_id,
        tema_id: tema_id,
      });
      if (result?.length < 1)
        return response.failed('Data not found', 404, res);
      const search = transformer.list(result);
      return response.successDetail(
        'Data search',
        { total: count[0]?.total, values: search },
        res
      );
    } catch (err) {
      return helper.catchError(`search: ${err?.message}`, 500, res);
    }
  }

  public async antihoaxSearch(req: Request, res: Response) {
    const apiUrl = process.env.MAFINDO_API_URL;
    const limit: any = req?.query?.perPage || 10;
    const keyword: any = req?.query?.keyword;

    if (!keyword) return response.failed('keyword is a required', 422, res);

    try {
      let payload = {
        key: process.env.MAFINDO_API_KEY,
        method: 'content',
        value: keyword,
      };
      let headers = {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      };

      const result = await axios.post(
        `${apiUrl}/antihoax/search`,
        { ...payload, limit: limit },
        headers
      );
      const total = await axios.post(
        `${apiUrl}/antihoax/search`,
        { ...payload, total: 1 },
        headers
      );
      return response.successDetail(
        'data antihoax',
        { total: total?.data, values: result?.data },
        res
      );
    } catch (err) {
      return helper.catchError(`search: ${err?.message}`, 500, res);
    }
  }
}

export const global = new Controller();
