'use strict';

import conn from '../../../config/database';
import { Request, Response } from 'express';
import { helper } from '../../../helpers/helper';
import { response } from '../../../helpers/response';
import { repository } from './like.comment.repository';

const date: string = helper.date();

export default class Controller {
  public async like(req: Request, res: Response) {
    const t = await conn.sequelize.transaction();
    try {
      const check = await repository.checkIdExternal(req);
      if (!check) return response.failed('Data not found', 404, res);

      const { id, group } = req?.body;
      const like = await repository.detailLike({
        id_external: id,
        group_like: group,
        created_by: req?.user?.id,
      });

      if (like) {
        await repository.deleteLike({
          condition: {
            id_external: id,
            group_like: group,
            created_by: req?.user?.id,
          },
          transaction: t,
        });
      } else {
        await repository.createLike({
          payload: {
            id_external: id,
            group_like: group,
            created_by: req?.user?.id,
            created_date: date,
          },
          transaction: t,
        });
      }

      await t.commit();
      return response.success(true, 'Like success saved', res);
    } catch (err) {
      await t.rollback();
      return helper.catchError(`like action: ${err?.message}`, 500, res);
    }
  }

  public async create(req: Request, res: Response) {
    const t = await conn.sequelize.transaction();
    try {
      const check = await repository.checkIdExternal(req);
      if (!check) return response.failed('Data not found', 404, res);

      const { id, comment, status, group } = req?.body;
      await repository.createComment({
        payload: {
          id_external: id,
          group_comment: group,
          comment: comment,
          status: status,
          created_by: req?.user?.id,
          created_date: date,
        },
        transaction: t,
      });

      await t.commit();
      return response.success(true, 'Comment success saved', res);
    } catch (err) {
      await t.rollback();
      return helper.catchError(`comment create: ${err?.message}`, 500, res);
    }
  }

  public async update(req: Request, res: Response) {
    const t = await conn.sequelize.transaction();
    try {
      const check = await repository.checkIdExternal(req);
      if (!check) return response.failed('Data not found', 404, res);

      const { id, comment, status, group } = req?.body;
      const checkComment = await repository.detailComment({
        id_external: id,
        group_comment: group,
        created_by: req?.user?.id,
      });
      if (!checkComment) return response.failed('Data not found', 404, res);

      await repository.updateComment({
        payload: {
          comment: comment || checkComment?.getDataValue('comment'),
          id_external: id || checkComment?.getDataValue('id_external'),
          status: status || checkComment?.getDataValue('status'),
          group_comment: group || checkComment?.getDataValue('group_comment'),
          modified_by: req?.user?.id,
          modified_date: date,
        },
        condition: {
          id_external: id,
          group_comment: group,
          created_by: req?.user?.id,
        },
        transaction: t,
      });

      await t.commit();
      return response.success(true, 'Comment success updated', res);
    } catch (err) {
      await t.rollback();
      return helper.catchError(`comment update: ${err?.message}`, 500, res);
    }
  }

  public async delete(req: Request, res: Response) {
    const t = await conn.sequelize.transaction();
    try {
      const check = await repository.checkIdExternal(req);
      if (!check) return response.failed('Data not found', 404, res);

      const { id, group } = req?.body;
      const checkComment = await repository.detailComment({
        id_external: id,
        group_comment: group,
        created_by: req?.user?.id,
      });
      if (!checkComment) return response.failed('Data not found', 404, res);

      await repository.updateComment({
        payload: {
          status: 9,
          modified_by: req?.user?.id,
          modified_date: date,
        },
        condition: {
          id_external: id,
          group_comment: group,
          created_by: req?.user?.id,
        },
        transaction: t,
      });

      await t.commit();
      return response.success(true, 'Comment success updated', res);
    } catch (err) {
      await t.rollback();
      return helper.catchError(`comment update: ${err?.message}`, 500, res);
    }
  }
}

export const likeComment = new Controller();
