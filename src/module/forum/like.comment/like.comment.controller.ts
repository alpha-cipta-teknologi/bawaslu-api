'use strict';

import { Op } from 'sequelize';
import { Request, Response } from 'express';
import { helper } from '../../../helpers/helper';
import { response } from '../../../helpers/response';
import { repository } from './like.comment.repository';
import { transformer } from './like.comment.transformer';

const date: string = helper.date();

export default class Controller {
  public async like(req: Request, res: Response) {
    try {
      const { id, group } = req?.body;
      if (![1, 2, 3].includes(group))
        return response.failed(
          'group must be a valid value (1,2, 3)',
          422,
          res
        );

      const check = await repository.checkIdExternal(req);
      if (!check) return response.failed('Data not found', 404, res);

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
        });
      } else {
        await repository.createLike({
          payload: {
            id_external: id,
            group_like: group,
            created_by: req?.user?.id,
            created_date: date,
          },
        });
      }

      return response.success(true, 'Like success saved', res);
    } catch (err) {
      return helper.catchError(`like action: ${err?.message}`, 500, res);
    }
  }

  public async index(req: Request, res: Response) {
    try {
      const { id_external, group, perPage, page, q } = req?.query;
      if (!id_external || !group)
        return response.failed('id_external and group is required', 422, res);

      const limit: any = perPage || 10;
      const offset: any = page || 1;
      const keyword: any = q;
      const { count, rows } = await repository.index({
        limit: parseInt(limit),
        offset: parseInt(limit) * (parseInt(offset) - 1),
        keyword: keyword,
        condition: {
          ...req?.user?.is_public,
          group_comment: group,
          id_external: id_external,
        },
      });
      if (rows?.length < 1) return response.failed('Data not found', 404, res);
      const comments: Array<Object> = await transformer.list(rows);
      return response.successDetail(
        'Data comment',
        { total: count, values: comments },
        res
      );
    } catch (err) {
      return helper.catchError(`comment index: ${err?.message}`, 500, res);
    }
  }

  public async detail(req: Request, res: Response) {
    try {
      const { id_external, group } = req?.params;
      const result: Object | any = await repository.detailComment({
        ...req?.user?.is_public,
        group_comment: group,
        id_external: id_external,
        status: { [Op.ne]: 9 },
      });
      if (!result) return response.failed('Data not found', 404, res);
      const comment: Array<Object> = await transformer.detail(result);
      return response.successDetail('Data comment', comment, res);
    } catch (err) {
      return helper.catchError(`comment detail: ${err?.message}`, 500, res);
    }
  }

  public async create(req: Request, res: Response) {
    try {
      const { id, comment, status, group } = req?.body;
      if (![1, 2, 3].includes(group))
        return response.failed(
          'group must be a valid value (1,2, 3)',
          422,
          res
        );

      const check = await repository.checkIdExternal(req);
      if (!check) return response.failed('Data not found', 404, res);

      await repository.createComment({
        payload: {
          id_external: id,
          group_comment: group,
          comment: comment,
          status: status,
          created_by: req?.user?.id,
          created_date: date,
        },
      });

      return response.success(true, 'Comment success saved', res);
    } catch (err) {
      return helper.catchError(`comment create: ${err?.message}`, 500, res);
    }
  }

  public async update(req: Request, res: Response) {
    try {
      const { id, comment, status, group } = req?.body;
      if (![1, 2, 3].includes(group))
        return response.failed(
          'group must be a valid value (1,2, 3)',
          422,
          res
        );

      const check = await repository.checkIdExternal(req);
      if (!check) return response.failed('Data not found', 404, res);

      const checkComment = await repository.detailComment({
        id_external: id,
        group_comment: group,
        created_by: req?.user?.id,
        status: { [Op.ne]: 9 },
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
      });

      return response.success(true, 'Comment success updated', res);
    } catch (err) {
      return helper.catchError(`comment update: ${err?.message}`, 500, res);
    }
  }

  public async delete(req: Request, res: Response) {
    try {
      const id: number = +(req?.params?.id || 0);
      const check = await repository.detailComment({
        id: id,
      });
      if (!check) return response.failed('Data not found', 404, res);

      await repository.updateComment({
        payload: {
          status: 9,
          modified_by: req?.user?.id,
          modified_date: date,
        },
        condition: {
          id: id,
        },
      });

      return response.success(true, 'Comment success updated', res);
    } catch (err) {
      return helper.catchError(`comment update: ${err?.message}`, 500, res);
    }
  }

  public async counter(req: Request, res: Response) {
    try {
      const { id, group, counter } = req?.body;
      if (![1, 2].includes(group))
        return response.failed('group must be a valid value (1,2)', 422, res);
      if (!['view', 'share'].includes(counter))
        return response.failed(
          'counter must be a valid value (view, share)',
          422,
          res
        );
      if (!id) return response.failed('id must be a valid value', 422, res);

      const check = await repository.checkData(req);
      if (!check) return response.failed('Data not found', 404, res);

      let count: Object = {};
      if (counter == 'view')
        count = {
          counter_view: check?.getDataValue('counter_view') + 1,
        };
      else if (counter == 'share')
        count = {
          counter_share: check?.getDataValue('counter_share') + 1,
        };

      await repository.updateViewShare({
        payload: count,
        condition: {
          id: id,
        },
        group: group,
      });

      return response.success(true, 'Counter success updated', res);
    } catch (err) {
      return helper.catchError(`counter view share: ${err?.message}`, 500, res);
    }
  }
}

export const likeComment = new Controller();
