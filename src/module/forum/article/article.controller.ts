'use strict';

import dotenv from 'dotenv';
import { Op } from 'sequelize';
import { Request, Response } from 'express';
import { variable } from './article.variable';
import { helper } from '../../../helpers/helper';
import { repository } from './article.respository';
import { response } from '../../../helpers/response';
import { repository as repoNotif } from '../../notif/notif.respository';
import { repository as repoLC } from '../like.comment/like.comment.repository';
import { repository as repoResource } from '../../app/resource/resource.repository';

dotenv.config();
const base_url_cms: string = process.env.BASE_URL_FE_CMS || '';

const notif = async (data: any) => {
  const url: string = `${base_url_cms}/article/list`;

  const admins = await repoResource.list({
    condition: { role_id: { [Op.in]: [1, 2] } },
  });

  let insert: Array<Object> = [];
  let usernames: Array<string> = [];

  admins.forEach((item: any) => {
    insert.push({
      resource_id: item?.resource_id,
      text_message: data?.title,
      target_url: url,
      created_by: data?.created_by,
    });
    usernames.push(item?.username);
  });

  if (insert?.length > 0) {
    await repoNotif.bulkCreate({
      payload: insert,
    });
  }

  return {
    web_url: url,
    usernames: usernames,
  };
};

export default class Controller {
  public async index(req: Request, res: Response) {
    try {
      const limit: any = req?.query?.perPage || 10;
      const offset: any = req?.query?.page || 1;
      const keyword: any = req?.query?.q;
      const type: any = req?.query?.type;
      const tema_id: any = req?.query?.tema_id;
      const komunitas_id: any = req?.query?.komunitas_id;
      let condition: any = {
        ...req?.user?.is_public,
        status: { [Op.ne]: 9 },
      };
      if (type && type == 'fe') {
        condition = {
          status: 1,
        };
      }
      if (tema_id) {
        condition = {
          ...condition,
          tema_id: tema_id,
        };
      }
      if (komunitas_id) {
        condition = {
          ...condition,
          komunitas_id: komunitas_id,
        };
      }
      const { count, rows } = await repository.index({
        limit: parseInt(limit),
        offset: parseInt(limit) * (parseInt(offset) - 1),
        keyword: keyword,
        condition: condition,
        user_id: req?.user?.id || null,
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

  public async detail(req: Request, res: Response) {
    try {
      const slug: string = req.params.slug || '';
      const result: Object | any = await repository.detail({
        condition: {
          slug: slug,
          status: { [Op.ne]: 9 },
        },
        user_id: null,
      });
      if (!result) return response.failed('Data not found', 404, res);
      const article: Object = {
        ...result?.dataValues,
        like: result?.like?.length > 0,
      };
      return response.successDetail('Data article', article, res);
    } catch (err) {
      return helper.catchError(`article detail: ${err?.message}`, 500, res);
    }
  }

  public async create(req: Request, res: Response) {
    try {
      const body: any = req?.body;
      if (!body?.title) return response.failed('Title is required', 422, res);

      let slug: string = helper.slug(body?.title);
      const checkSlug = await repository.check({
        slug: slug,
      });
      if (checkSlug) slug = slug + 1;

      let path_thumbnail: any = null;
      let path_image: any = null;
      if (req?.files && req?.files?.image) {
        // resize
        const { path_doc } = await helper.resize(
          req?.files?.image,
          'article',
          250
        );
        path_thumbnail = path_doc;

        // upload original
        path_image = await helper.upload(req?.files?.image, 'article');
      }

      let komunitas: any = null;
      let tema: any = null;
      const { komunitas_id, tema_id } = req?.body;
      if (komunitas_id) komunitas = JSON.parse(komunitas_id);
      if (tema_id) tema = JSON.parse(tema_id);
      const data: Object = helper.only(variable.fillable(), body);
      const payload: any = {
        ...data,
        slug: slug,
        path_thumbnail: path_thumbnail,
        path_image: path_image,
        komunitas_id: komunitas?.value || 0,
        tema_id: tema?.value || 0,
        created_by: req?.user?.id,
      };

      await repository.create({
        payload: payload,
      });
      const { web_url, usernames } = await notif({
        ...payload,
        title: `${req?.user?.username} create article: ${payload?.title}`,
      });
      await helper.sendOneSignalCMS(
        {
          ...payload,
          title: `${req?.user?.username} create article: ${payload?.title}`,
          web_url: web_url,
        },
        usernames
      );

      return response.success(true, 'Data success saved', res);
    } catch (err) {
      return helper.catchError(`article create: ${err?.message}`, 500, res);
    }
  }

  public async update(req: Request, res: Response) {
    try {
      const id: any = req.params.id || 0;
      const check = await repository.check({
        id: id,
        status: { [Op.ne]: 9 },
      });
      if (!check) return response.failed('Data not found', 404, res);

      const body: any = req?.body;
      if (!body?.title) return response.failed('Title is required', 422, res);

      let slug: string = check?.getDataValue('slug');
      if (body?.title != check?.getDataValue('title')) {
        slug = helper.slug(body?.title);
        const checkSlug = await repository.check({
          slug: slug,
        });
        if (checkSlug) slug = slug + 1;
      }

      let path_thumbnail: any = null;
      let path_image: any = null;
      if (req?.files && req?.files?.image) {
        // resize
        const { path_doc } = await helper.resize(
          req?.files?.image,
          'article',
          250
        );
        path_thumbnail = path_doc;

        // upload original
        path_image = await helper.upload(req?.files?.image, 'article');
      }

      let komunitas: any = null;
      let tema: any = null;
      const { komunitas_id, tema_id } = req?.body;
      if (komunitas_id) komunitas = JSON.parse(komunitas_id);
      if (tema_id) tema = JSON.parse(tema_id);
      const data: Object = helper.only(variable.fillable(), body, true);
      await repository.update({
        payload: {
          ...data,
          slug: slug,
          path_thumbnail:
            path_thumbnail || check?.getDataValue('path_thumbnail'),
          path_image: path_image || check?.getDataValue('path_image'),
          komunitas_id: komunitas?.value || check?.getDataValue('komunitas_id'),
          tema_id: tema?.value || check?.getDataValue('tema_id'),
          modified_by: req?.user?.id,
        },
        condition: { id: id },
      });

      return response.success(true, 'Data success updated', res);
    } catch (err) {
      return helper.catchError(`article update: ${err?.message}`, 500, res);
    }
  }

  public async delete(req: Request, res: Response) {
    try {
      const id: any = req.params.id || 0;
      const date: string = helper.date();
      const check = await repository.check({
        id: id,
        status: { [Op.ne]: 9 },
      });
      if (!check) return response.failed('Data not found', 404, res);
      await repository.update({
        payload: {
          status: 9,
          modified_by: req?.user?.id,
          modified_date: date,
        },
        condition: { id: id },
      });
      await repoLC.deleteLike({
        condition: {
          id_external: id,
          group_like: 1,
        },
      });
      await repoLC.updateComment({
        payload: {
          status: 9,
          modified_by: req?.user?.id,
          modified_date: date,
        },
        condition: {
          id_external: id,
          group_comment: 1,
        },
      });
      return response.success(true, 'Data success deleted', res);
    } catch (err) {
      return helper.catchError(`article delete: ${err?.message}`, 500, res);
    }
  }
}

export const article = new Controller();
