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
      const check = await repository.detailLike({
        id_external: req?.body?.id,
        group_like: req?.body?.group,
        created_by: req?.user?.id,
      });
      
      if (check) {
        await repository.delete({
          condition: {
            id_external: req?.body?.id,
            group_like: req?.body?.group,
          },
          transaction: t,
        });
      } else {
        await repository.create({
          payload: {
            id_external: req?.body?.id,
            group_like: req?.body?.group,
            created_by: req?.user?.id,
            created_date: date,
          },
          transaction: t,
        });
      }

      await t.commit();
      return response.success(true, 'Data success saved', res);
    } catch (err) {
      await t.rollback();
      return helper.catchError(`like action: ${err?.message}`, 500, res);
    }
  }
}

export const likeComment = new Controller();