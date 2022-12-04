'use strict';

import { Op } from 'sequelize';
import Like from './like.model';
import { Request } from 'express';
import Comment from './comment.model';
import Article from '../article/article.model';
import BawasluUpdate from '../bawaslu.update/bawaslu.update.model';

export default class Respository {
  public async checkIdExternal(req: Request) {
    const { id, group } = req?.body;
    let result: boolean = false;
    const condition: Object = {
      where: {
        id: id,
        status: { [Op.ne]: 9 },
        created_by: req?.user?.id,
      },
    };
    if (group == 1) {
      const article = await Article.findOne(condition);
      if (article) return true;
    } else if (group == 2) {
      const bawasluUpdate = await BawasluUpdate.findOne(condition);
      if (bawasluUpdate) return true;
    } else if (group == 3) {
      const comment = await Comment.findOne(condition);
      if (comment) return true;
    }
    return result;
  }

  public comments(condition: any) {
    return Comment.findAll({
      where: condition,
    });
  }

  public detailComment(condition: any) {
    return Comment.findOne({
      where: condition,
    });
  }

  public createComment(data: any) {
    return Comment.create(data?.payload, {
      transaction: data?.transaction,
    });
  }

  public updateComment(data: any) {
    return Comment.update(data?.payload, {
      where: data?.condition,
      transaction: data?.transaction,
    });
  }

  public detailLike(condition: any) {
    return Like.findOne({
      where: condition,
    });
  }

  public createLike(data: any) {
    return Like.create(data?.payload, {
      transaction: data?.transaction,
    });
  }

  public deleteLike(data: any) {
    return Like.destroy({
      where: data?.condition,
      transaction: data?.transaction,
    });
  }
}

export const repository = new Respository();
